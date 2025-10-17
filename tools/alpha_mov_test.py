import cv2
import numpy as np
from PIL import Image
import os

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

# 使用方法
if __name__ == "__main__":
    video_path = r"C:\Users\12919\Desktop\可视化教学案例\static\videos\均匀分布.mov"  # 替换为你的视频路径
    
    print("检查视频透明通道...")
    has_alpha = check_mov_alpha_channel_opencv(video_path)
    
    if has_alpha:
        print("\n进行详细分析...")
        detailed_alpha_analysis(video_path)
    else:
        print("视频不包含透明通道")