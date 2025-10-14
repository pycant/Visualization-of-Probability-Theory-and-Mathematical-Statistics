#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量为rating-section添加AI求助功能的脚本
"""

import re
import os

def add_ai_help_to_rating_sections(file_path):
    """为指定文件中的所有rating-section添加AI求助功能"""
    
    # AI求助功能的HTML模板
    ai_help_template = '''                  
                  <!-- AI求助功能区域 -->
                  <div class="ai-help-section hidden mt-4" data-step="{step_index}">
                    <div class="tool-header bg-dark-bg rounded-lg p-4 border border-gray-700 hover:border-neon-blue transition-all duration-300 cursor-pointer">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                          <div class="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                            <i class="fa fa-robot text-neon-blue"></i>
                          </div>
                          <div>
                            <h4 class="font-semibold text-white text-sm">AI智能助手</h4>
                            <p class="text-xs text-gray-400">获取这一步骤的帮助</p>
                          </div>
                        </div>
                        <i class="fa fa-chevron-down text-gray-400 transition-transform duration-300 ai-help-chevron"></i>
                      </div>
                    </div>
                    <div class="ai-help-content hidden mt-2 p-4 bg-dark-bg rounded-lg border border-gray-700">
                      <div class="mb-4">
                        <div class="flex space-x-2">
                          <input type="text" class="ai-help-input flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-neon-blue focus:outline-none" placeholder="请输入您关于这一步骤的问题...">
                          <button class="ai-help-send bg-neon-blue hover:bg-neon-purple text-dark-bg font-bold p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 border-glow" title="发送问题">
                            <i class="fa fa-paper-plane"></i>
                          </button>
                        </div>
                        <div class="ai-help-response mt-3 p-3 bg-gray-800 rounded-lg border border-gray-600 hidden">
                          <div class="text-sm text-gray-300"></div>
                        </div>
                      </div>
                    </div>
                  </div>'''
    
    try:
        # 读取文件内容
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 查找所有rating-section，但排除已经有AI求助功能的
        rating_sections = []
        lines = content.split('\n')
        
        step_index = 0
        i = 0
        while i < len(lines):
            line = lines[i]
            if '<div class="rating-section">' in line:
                print(f"找到rating-section在行 {i+1}")
                
                # 检查接下来的几行是否已经包含AI求助功能
                has_ai_help = False
                rating_section_end = -1
                
                for j in range(i, min(i + 100, len(lines))):
                    if 'ai-help-section' in lines[j]:
                        has_ai_help = True
                        print(f"  已有AI求助功能在行 {j+1}")
                        break
                    # 寻找rating-section的结束标签
                    if '</div>' in lines[j] and j > i + 5:  # 确保不是rating-buttons内的div
                        # 检查这是否是rating-section的结束
                        indent_level = len(lines[j]) - len(lines[j].lstrip())
                        section_indent = len(lines[i]) - len(lines[i].lstrip())
                        if indent_level <= section_indent:
                            rating_section_end = j
                            break
                
                if not has_ai_help and rating_section_end > 0:
                    print(f"  需要添加AI求助功能，rating-section结束于行 {rating_section_end+1}")
                    # 在rating-section结束前插入AI求助功能
                    ai_help_html = ai_help_template.format(step_index=step_index)
                    lines.insert(rating_section_end, ai_help_html)
                    step_index += 1
                    # 由于插入了内容，需要调整索引
                    i = rating_section_end + ai_help_html.count('\n') + 1
                elif has_ai_help:
                    print(f"  跳过，已有AI求助功能")
                else:
                    print(f"  未找到rating-section结束位置")
            i += 1
        
        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        print(f"成功为 {step_index} 个rating-section添加了AI求助功能")
        return True
        
    except Exception as e:
        print(f"处理文件时出错: {e}")
        return False

if __name__ == "__main__":
    file_path = "templates/law_of_large_numbers.html"
    if os.path.exists(file_path):
        add_ai_help_to_rating_sections(file_path)
    else:
        print(f"文件不存在: {file_path}")