import cv2
import numpy as np
from PIL import Image
import os
import subprocess
import json
import tempfile

def check_video_alpha_with_ffprobe(video_path):
    """
    使用FFprobe检查视频是否包含alpha通道 (支持HEVC Alpha)
    """
    try:
        cmd = [
            'ffprobe', 
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_streams',
            video_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        
        if result.returncode != 0:
            print(f"FFprobe分析失败: {result.stderr}")
            return False, {}
        
        try:
            data = json.loads(result.stdout)
        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}")
            return False, {}
        
        for stream in data.get('streams', []):
            if stream.get('codec_type') == 'video':
                codec_name = stream.get('codec_name', '')
                pix_fmt = stream.get('pix_fmt', '')
                
                print(f"视频编解码器: {codec_name}")
                print(f"像素格式: {pix_fmt}")
                
                # 检查HEVC Alpha支持的像素格式
                hevc_alpha_formats = ['yuva420p', 'yuva422p', 'yuva444p', 'yuva420p10le', 'yuva422p10le', 'yuva444p10le']
                # 其他alpha格式
                other_alpha_formats = ['rgba', 'argb', 'bgra', 'abgr', 'ya', 'gbra']
                
                all_alpha_formats = hevc_alpha_formats + other_alpha_formats
                has_alpha = any(alpha_fmt in pix_fmt.lower() for alpha_fmt in all_alpha_formats)
                
                stream_info = {
                    'codec': codec_name,
                    'pixel_format': pix_fmt,
                    'has_alpha': has_alpha,
                    'is_hevc': codec_name.lower() in ['hevc', 'h265'],
                    'width': stream.get('width'),
                    'height': stream.get('height'),
                    'nb_frames': stream.get('nb_frames', 'N/A')
                }
                
                if has_alpha:
                    if codec_name.lower() in ['hevc', 'h265']:
                        print("✅ 检测到HEVC Alpha视频")
                    else:
                        print(f"✅ 检测到Alpha通道 ({codec_name})")
                else:
                    print("❌ 未检测到Alpha通道")
                
                return has_alpha, stream_info
        
        return False, {}
        
    except Exception as e:
        print(f"FFprobe检查过程中出现错误: {e}")
        return False, {}

def extract_alpha_frame_ffmpeg(video_path, output_path=None, frame_number=1):
    """
    使用FFmpeg提取带alpha通道的帧
    """
    try:
        if output_path is None:
            with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
                output_path = temp_file.name
        
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-vf', f'select=eq(n\\,{frame_number-1})',
            '-vframes', '1',
            '-pix_fmt', 'rgba',  # 强制输出为RGBA格式
            '-y',
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        
        if result.returncode != 0:
            print(f"FFmpeg帧提取失败: {result.stderr}")
            return False, None, None
        
        # 分析提取的帧
        if os.path.exists(output_path):
            with Image.open(output_path) as img:
                if img.mode == 'RGBA':
                    alpha_channel = np.array(img)[:, :, 3]
                    
                    # 分析alpha通道
                    unique_alpha = np.unique(alpha_channel)
                    min_alpha = np.min(alpha_channel)
                    max_alpha = np.max(alpha_channel)
                    
                    transparent_pixels = np.sum(alpha_channel < 255)
                    total_pixels = alpha_channel.size
                    transparency_ratio = transparent_pixels / total_pixels
                    
                    alpha_info = {
                        'unique_values': len(unique_alpha),
                        'alpha_range': [int(min_alpha), int(max_alpha)],
                        'transparency_ratio': transparency_ratio,
                        'has_transparency': transparency_ratio > 0
                    }
                    
                    print(f"提取帧模式: {img.mode}")
                    print(f"Alpha值范围: [{min_alpha}, {max_alpha}]")
                    print(f"透明像素比例: {transparency_ratio:.2%}")
                    
                    return True, alpha_info, output_path
                else:
                    print(f"提取帧模式: {img.mode} (无alpha通道)")
                    return False, None, output_path
        
        return False, None, None
        
    except Exception as e:
        print(f"帧提取过程中出现错误: {e}")
        return False, None, None

def check_mov_alpha_channel_opencv(video_path):
    """
    使用OpenCV检查.mov视频是否包含透明通道
    """
    try:
        # 打开视频文件
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            print(f"无法打开视频文件: {video_path}")
            return False
        
        # 读取第一帧
        ret, frame = cap.read()
        
        if not ret:
            print("无法读取视频帧")
            cap.release()
            return False
        
        # 检查帧的通道数
        channels = frame.shape[2] if len(frame.shape) == 3 else 1
        
        print(f"视频帧形状: {frame.shape}")
        print(f"通道数: {channels}")
        
        # 如果有4个通道，通常表示包含alpha通道
        if channels == 4:
            print("检测到4个通道 - 可能包含透明通道")
            
            # 进一步验证：检查alpha通道是否包含非255的值
            alpha_channel = frame[:, :, 3]
            unique_alpha_values = np.unique(alpha_channel)
            
            print(f"Alpha通道唯一值: {unique_alpha_values}")
            
            # 如果alpha通道有不等于255的值，说明有透明像素
            if len(unique_alpha_values) > 1 or (len(unique_alpha_values) == 1 and unique_alpha_values[0] != 255):
                print("确认：视频包含透明背景")
                has_transparency = True
            else:
                print("虽然有4个通道，但所有像素都是不透明的")
                has_transparency = False
                
        elif channels == 3:
            print("只有3个通道 - 不包含透明通道")
            has_transparency = False
        else:
            print(f"未知通道数: {channels}")
            has_transparency = False
        
        cap.release()
        return has_transparency
        
    except Exception as e:
        print(f"检查过程中出现错误: {e}")
        return False

def detailed_alpha_analysis(video_path, sample_frames=5):
    """
    对视频进行详细的透明通道分析
    """
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return
    
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    print(f"\n=== 视频详细信息 ===")
    print(f"总帧数: {total_frames}")
    print(f"帧率: {fps}")
    print(f"采样分析 {min(sample_frames, total_frames)} 帧")
    
    transparency_found = False
    
    for i in range(min(sample_frames, total_frames)):
        ret, frame = cap.read()
        if not ret:
            break
            
        if len(frame.shape) == 3 and frame.shape[2] == 4:
            alpha = frame[:, :, 3]
            
            # 统计透明像素
            transparent_pixels = np.sum(alpha < 255)
            total_pixels = alpha.shape[0] * alpha.shape[1]
            transparency_ratio = transparent_pixels / total_pixels
            
            print(f"帧 {i+1}: 透明像素 {transparent_pixels}/{total_pixels} ({transparency_ratio:.2%})")
            
            if transparent_pixels > 0:
                transparency_found = True
                # 显示透明度的统计信息
                print(f"  Alpha值范围: [{np.min(alpha)}, {np.max(alpha)}]")
    
    cap.release()
    return transparency_found

def comprehensive_alpha_detection(video_path):
    """
    综合alpha通道检测，特别支持HEVC Alpha
    """
    print(f"\n{'='*60}")
    print(f"综合Alpha通道检测: {os.path.basename(video_path)}")
    print(f"{'='*60}")
    
    if not os.path.exists(video_path):
        print(f"❌ 视频文件不存在: {video_path}")
        return False
    
    results = {}
    
    # 1. FFprobe检测 (最准确，支持HEVC Alpha)
    print("\n🔍 方法1: FFprobe分析")
    print("-" * 30)
    has_alpha_ffprobe, stream_info = check_video_alpha_with_ffprobe(video_path)
    results['ffprobe'] = {'has_alpha': has_alpha_ffprobe, 'info': stream_info}
    
    # 2. FFmpeg帧提取检测
    print("\n🔍 方法2: FFmpeg帧提取分析")
    print("-" * 30)
    success, alpha_info, frame_path = extract_alpha_frame_ffmpeg(video_path)
    results['ffmpeg_frame'] = {'success': success, 'alpha_info': alpha_info}
    
    # 清理临时文件
    if frame_path and os.path.exists(frame_path):
        try:
            os.unlink(frame_path)
        except:
            pass
    
    # 3. OpenCV检测 (作为对比)
    print("\n🔍 方法3: OpenCV分析 (对比)")
    print("-" * 30)
    opencv_result = check_mov_alpha_channel_opencv(video_path)
    results['opencv'] = opencv_result
    
    # 综合结论
    print("\n📊 检测结果汇总")
    print("-" * 30)
    
    if stream_info:
        print(f"视频信息:")
        print(f"  编解码器: {stream_info.get('codec', 'Unknown')}")
        print(f"  像素格式: {stream_info.get('pixel_format', 'Unknown')}")
        print(f"  分辨率: {stream_info.get('width', '?')}x{stream_info.get('height', '?')}")
        print(f"  是否HEVC: {'是' if stream_info.get('is_hevc') else '否'}")
    
    # 最终判断
    final_has_alpha = has_alpha_ffprobe or (success and alpha_info and alpha_info.get('has_transparency', False))
    
    if final_has_alpha:
        if stream_info.get('is_hevc'):
            print("✅ 最终结论: 检测到HEVC Alpha视频")
        else:
            print("✅ 最终结论: 检测到Alpha通道")
    else:
        print("❌ 最终结论: 未检测到Alpha通道")
    
    return final_has_alpha

# 使用方法
def detect_hevc_alpha_advanced(video_path):
    """
    高级HEVC Alpha检测函数 - 支持更多格式和详细分析
    """
    try:
        cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', video_path]
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
        
        if result.returncode != 0:
            return False, "FFprobe分析失败", {}
        
        data = json.loads(result.stdout)
        
        # 扩展的HEVC编解码器识别
        hevc_codecs = ['hevc', 'h265', 'hvc1', 'hev1']
        
        # 扩展的Alpha像素格式支持
        alpha_formats = [
            'yuva420p', 'yuva422p', 'yuva444p',
            'yuva420p10le', 'yuva422p10le', 'yuva444p10le',
            'yuva420p12le', 'yuva422p12le', 'yuva444p12le',
            'yuva420p16le', 'yuva422p16le', 'yuva444p16le'
        ]
        
        for stream in data.get('streams', []):
            if stream.get('codec_type') == 'video':
                codec = stream.get('codec_name', '').lower()
                codec_tag = stream.get('codec_tag_string', '').lower()
                pix_fmt = stream.get('pix_fmt', '').lower()
                
                # 更准确的HEVC检测
                is_hevc = (codec in hevc_codecs or 
                          codec_tag in hevc_codecs or
                          'hevc' in codec or 'h265' in codec)
                
                # 更准确的Alpha检测
                has_alpha = any(fmt in pix_fmt for fmt in alpha_formats)
                
                # 提取位深度信息
                bit_depth = 8
                if '10le' in pix_fmt or '10be' in pix_fmt:
                    bit_depth = 10
                elif '12le' in pix_fmt or '12be' in pix_fmt:
                    bit_depth = 12
                elif '16le' in pix_fmt or '16be' in pix_fmt:
                    bit_depth = 16
                
                # 详细信息
                details = {
                    'codec': codec,
                    'codec_tag': codec_tag,
                    'pixel_format': pix_fmt,
                    'width': stream.get('width', 0),
                    'height': stream.get('height', 0),
                    'bit_depth': bit_depth,
                    'fps': stream.get('r_frame_rate', '0/1'),
                    'container': data.get('format', {}).get('format_name', 'unknown')
                }
                
                if is_hevc and has_alpha:
                    return True, f"HEVC Alpha ({bit_depth}bit)", details
                elif has_alpha:
                    return True, f"{codec.upper()} Alpha ({bit_depth}bit)", details
                elif is_hevc:
                    return False, f"HEVC ({bit_depth}bit, 无Alpha)", details
                else:
                    return False, f"{codec.upper()} ({bit_depth}bit, 无Alpha)", details
        
        return False, "未找到视频流", {}
        
    except Exception as e:
        return False, f"检测错误: {e}", {}

def get_conversion_suggestions(video_details, has_alpha, alpha_type):
    """
    根据视频信息提供转换建议
    """
    suggestions = []
    
    if "HEVC Alpha" in alpha_type:
        suggestions.append("✅ 已经是HEVC Alpha格式，无需转换")
        suggestions.append("💡 如需优化可以调整位深度或压缩参数")
    elif "HEVC" in alpha_type and not has_alpha:
        suggestions.append("💡 HEVC视频，可以添加Alpha通道:")
        suggestions.append(f"   ffmpeg -i input.{video_details.get('container', 'mp4')} -vf 'format=yuva420p' -c:v libx265 -crf 23 output_alpha.mp4")
    elif has_alpha and "HEVC" not in alpha_type:
        suggestions.append("💡 包含Alpha通道，建议转换为HEVC Alpha以获得更好压缩:")
        if video_details.get('bit_depth', 8) > 8:
            suggestions.append(f"   ffmpeg -i input.{video_details.get('container', 'mov')} -c:v libx265 -pix_fmt yuva420p10le -crf 20 output_hevc_alpha.mp4")
        else:
            suggestions.append(f"   ffmpeg -i input.{video_details.get('container', 'mov')} -c:v libx265 -pix_fmt yuva420p -crf 23 output_hevc_alpha.mp4")
    else:
        suggestions.append("💡 标准视频，如需HEVC Alpha可以:")
        suggestions.append("   1. 添加透明度: ffmpeg -i input.mp4 -vf 'format=yuva420p' -c:v libx265 output_alpha.mp4")
        suggestions.append("   2. 转换为HEVC: ffmpeg -i input.mp4 -c:v libx265 -crf 23 output_hevc.mp4")
    
    return suggestions

if __name__ == "__main__":
    print("🎬 改进的HEVC Alpha检测器")
    print("=" * 60)
    print("✨ 新增功能:")
    print("   • 专门优化HEVC Alpha检测")
    print("   • 支持多种alpha像素格式")
    print("   • 改进的编码处理")
    print("   • 详细的兼容性分析")
    
    # 测试多个视频文件
    test_videos = [
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\alpha_test_transparent.mov",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\alpha_test_mov_prores4444.mov",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\hevc_alpha_test.mp4",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\均匀分布.mov",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\卡方分布.mp4",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\泊松分布.mp4",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\正态分布.mp4",
        # r"C:\Users\12919\Desktop\可视化教学案例\static\videos\指数分布.mp4"
        r"D:\project\数字人任务\课程介绍视频\16.mov"
    ]
    
    alpha_videos = []
    hevc_alpha_videos = []
    hevc_videos = []
    
    video_analysis_results = []
    
    for video_path in test_videos:
        if os.path.exists(video_path):
            # 综合Alpha检测
            has_alpha = comprehensive_alpha_detection(video_path)
            if has_alpha:
                alpha_videos.append(video_path)
            
            # 高级HEVC Alpha检测
            is_alpha, alpha_type, details = detect_hevc_alpha_advanced(video_path)
            
            # 分类统计
            if "HEVC Alpha" in alpha_type:
                hevc_alpha_videos.append(video_path)
            elif "HEVC" in alpha_type:
                hevc_videos.append(video_path)
            
            # 保存分析结果
            video_analysis_results.append({
                'path': video_path,
                'name': os.path.basename(video_path),
                'has_alpha': has_alpha,
                'is_alpha': is_alpha,
                'alpha_type': alpha_type,
                'details': details
            })
                
        else:
            print(f"\n⚠️  文件不存在: {os.path.basename(video_path)}")
    
    print(f"\n{'='*60}")
    print("🎯 HEVC Alpha检测总结 (改进版)")
    print(f"{'='*60}")
    print(f"总共检测视频: {len([v for v in test_videos if os.path.exists(v)])} 个")
    print(f"包含Alpha通道: {len(alpha_videos)} 个")
    print(f"HEVC视频: {len(hevc_videos)} 个")
    print(f"HEVC Alpha视频: {len(hevc_alpha_videos)} 个")
    
    if hevc_alpha_videos:
        print(f"\n🌟 HEVC Alpha视频:")
        for video in hevc_alpha_videos:
            result = next(r for r in video_analysis_results if r['path'] == video)
            details = result['details']
            print(f"  🎯 {result['name']}")
            print(f"     格式: {details.get('pixel_format', 'unknown')} | "
                  f"分辨率: {details.get('width', 0)}x{details.get('height', 0)} | "
                  f"位深度: {details.get('bit_depth', 8)}bit")
    
    if alpha_videos:
        print(f"\n✅ 所有Alpha视频详情:")
        for video in alpha_videos:
            result = next(r for r in video_analysis_results if r['path'] == video)
            marker = "🌟" if "HEVC Alpha" in result['alpha_type'] else "✨"
            details = result['details']
            print(f"  {marker} {result['name']} ({result['alpha_type']})")
            if details:
                print(f"     容器: {details.get('container', 'unknown')} | "
                      f"像素格式: {details.get('pixel_format', 'unknown')} | "
                      f"分辨率: {details.get('width', 0)}x{details.get('height', 0)}")
    
    # 提供转换建议
    print(f"\n💡 智能转换建议:")
    print("-" * 40)
    
    for result in video_analysis_results:
        if result['details']:
            suggestions = get_conversion_suggestions(
                result['details'], 
                result['has_alpha'], 
                result['alpha_type']
            )
            
            print(f"\n📹 {result['name']}:")
            for suggestion in suggestions:
                print(f"   {suggestion}")
    
    if not alpha_videos:
        print(f"\n🔧 系统建议:")
        print("   • 当前没有检测到Alpha视频")
        print("   • 可以使用以下工具生成测试视频:")
        print("     - generate_hevc_alpha_test.py (生成HEVC Alpha测试视频)")
        print("     - create_real_hevc_alpha.py (创建真实HEVC Alpha视频)")
        print("   • 推荐使用HEVC Alpha格式以获得最佳压缩和兼容性")
    
    print(f"\n🎉 HEVC Alpha检测功能已全面优化!")
    print("✨ 新增功能:")
    print("   • 扩展的HEVC编解码器识别 (hevc, h265, hvc1, hev1)")
    print("   • 支持10bit/12bit/16bit Alpha格式")
    print("   • 智能转换建议系统")
    print("   • 详细的视频流分析")
    print("💡 现在可以准确检测和分析各种HEVC Alpha视频格式!")

