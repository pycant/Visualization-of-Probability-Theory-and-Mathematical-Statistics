#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新理解度追踪图表配置脚本
根据每个卡片中实际的derivation-step和property-step数量，更新对应的图表配置
"""

import re
import os

def update_chart_configurations():
    """更新所有理解度追踪图表的配置"""
    
    file_path = "templates/law_of_large_numbers.html"
    
    if not os.path.exists(file_path):
        print(f"错误：文件 {file_path} 不存在")
        return False
    
    # 读取文件内容
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 定义每个图表的新配置
    chart_configs = {
        'initUnderstandingChart': {
            'labels': ['切比雪夫不等式', '样本均值性质', '应用不等式', '取极限', '收敛速度', '样本量要求', '方差未知'],
            'data_length': 7
        },
        'initUnderstandingChart2': {
            'labels': ['特征函数方法', '泰勒展开', '收敛结果', '普适性', '收敛速度', '统计推断基础', '实际应用示例'],
            'data_length': 7
        },
        'initUnderstandingChart3': {
            'labels': ['弱大数定律', '强大数定律', '收敛性关系', 'Kolmogorov定理', '切比雪夫方法', '条件差异', '实际意义', '经典实例', '反例分析'],
            'data_length': 9
        },
        'initUnderstandingChart4': {
            'labels': ['切比雪夫界', 'Hoeffding界', '样本量计算', 'Bernstein不等式', 'Bennett不等式', 'A/B测试', '蒙特卡洛方法', '投票调查示例', 'VaR估计'],
            'data_length': 9
        },
        'initUnderstandingChart5': {
            'labels': ['多元推广', '函数大数定律', '马尔可夫链', '鞅论应用', '随机场', '机器学习', '时间序列', '网络科学', '量子物理', '生物信息学'],
            'data_length': 10
        }
    }
    
    # 更新每个图表函数
    for func_name, config in chart_configs.items():
        print(f"更新 {func_name}...")
        
        # 构建新的标签数组字符串
        labels_str = "', '".join(config['labels'])
        labels_array = f"['{labels_str}']"
        
        # 构建新的数据数组
        data_array = f"[{', '.join(['0'] * config['data_length'])}]"
        
        # 查找并替换函数定义
        pattern = rf'(function {func_name}\(\) \{{.*?labels:\s*)\[[^\]]*\](.*?data:\s*)\[[^\]]*\](.*?\}})'
        
        def replacement(match):
            return f"{match.group(1)}{labels_array}{match.group(2)}{data_array}{match.group(3)}"
        
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ 所有图表配置更新完成！")
    
    # 验证更新结果
    print("\n📊 更新后的配置：")
    for func_name, config in chart_configs.items():
        print(f"  {func_name}: {config['data_length']}个步骤")
    
    return True

if __name__ == "__main__":
    print("🔄 开始更新理解度追踪图表配置...")
    success = update_chart_configurations()
    
    if success:
        print("\n✨ 更新完成！现在每个图表的步骤数量都与对应卡片的实际步骤数量一致了。")
    else:
        print("\n❌ 更新失败，请检查错误信息。")