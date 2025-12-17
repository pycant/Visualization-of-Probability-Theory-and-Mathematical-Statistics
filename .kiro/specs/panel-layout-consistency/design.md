# Design Document

## Overview

本设计文档描述了一个面板布局一致性系统，用于解决 Chapter1 页面中讲解模式下视频面板和讲解面板在模式切换时比例和大小不一致的问题。该系统将确保在理论讲解模式下，视频面板与讲解面板始终保持 2:1 的比例关系，并在各种交互和设备环境下保持布局稳定性。

## Architecture

### 系统架构概述

面板布局一致性系统采用观察者模式和策略模式相结合的架构：

```
┌─────────────────────────────────────────────────────────────┐
│                    Panel Layout System                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  Layout Manager │  │ Ratio Calculator│  │ Debug Logger │ │
│  │                 │  │                 │  │              │ │
│  │ - Mode Tracking │  │ - Ratio Validation│ │ - Console Log│ │
│  │ - Event Handling│  │ - Responsive Logic│ │ - Error Track│ │
│  │ - DOM Updates   │  │ - Device Detection│ │ - Recovery   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Event Observers                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Mode Switch     │  │ Window Resize   │  │ Content      │ │
│  │ Observer        │  │ Observer        │  │ Observer     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Layout Strategies                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Desktop Layout  │  │ Tablet Layout   │  │ Mobile Layout│ │
│  │ Strategy        │  │ Strategy        │  │ Strategy     │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 核心组件

1. **Layout Manager**: 负责协调整个布局系统，管理模式状态和触发布局更新
2. **Ratio Calculator**: 计算和验证面板比例，处理响应式逻辑
3. **Debug Logger**: 提供调试功能，记录布局变化和错误信息
4. **Event Observers**: 监听各种可能影响布局的事件
5. **Layout Strategies**: 针对不同设备类型的布局策略实现

## Components and Interfaces

### Layout Manager Interface

```typescript
interface LayoutManager {
  // 初始化布局系统
  initialize(): void;
  
  // 切换到指定模式
  switchToMode(mode: LayoutMode): void;
  
  // 强制重新计算布局
  recalculateLayout(): void;
  
  // 获取当前布局状态
  getCurrentState(): LayoutState;
  
  // 启用/禁用调试模式
  setDebugMode(enabled: boolean): void;
}
```

### Ratio Calculator Interface

```typescript
interface RatioCalculator {
  // 计算目标比例
  calculateTargetRatio(mode: LayoutMode, deviceType: DeviceType): number;
  
  // 验证当前比例是否正确
  validateCurrentRatio(expectedRatio: number): boolean;
  
  // 获取实际面板尺寸
  getPanelDimensions(): PanelDimensions;
  
  // 应用比例到DOM元素
  applyRatioToElements(ratio: number): void;
}
```

### Debug Logger Interface

```typescript
interface DebugLogger {
  // 记录布局变化
  logLayoutChange(before: LayoutState, after: LayoutState): void;
  
  // 记录模式切换
  logModeSwitch(fromMode: LayoutMode, toMode: LayoutMode): void;
  
  // 记录错误和警告
  logError(error: LayoutError): void;
  
  // 提供恢复建议
  suggestRecovery(error: LayoutError): RecoveryAction[];
}
```

## Data Models

### 核心数据类型

```typescript
// 布局模式枚举
enum LayoutMode {
  EXPERIENCE = 'experience',
  EXPERIMENT = 'experiment', 
  THEORY = 'theory'
}

// 设备类型枚举
enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile'
}

// 面板尺寸信息
interface PanelDimensions {
  videoPanel: {
    width: number;
    height: number;
  };
  explanationPanel: {
    width: number;
    height: number;
  };
  ratio: number;
}

// 布局状态
interface LayoutState {
  currentMode: LayoutMode;
  deviceType: DeviceType;
  dimensions: PanelDimensions;
  isValid: boolean;
  timestamp: number;
}

// 布局错误信息
interface LayoutError {
  type: 'RATIO_MISMATCH' | 'ELEMENT_NOT_FOUND' | 'CALCULATION_ERROR';
  message: string;
  expectedRatio?: number;
  actualRatio?: number;
  timestamp: number;
}

// 恢复操作
interface RecoveryAction {
  type: 'RECALCULATE' | 'RESET_CSS' | 'FORCE_REFRESH';
  description: string;
  execute: () => void;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

在分析所有可测试的属性后，我识别出以下可以合并的冗余属性：
- 属性 1.1, 1.3 和 3.1 都涉及理论模式下的 2:1 比例设置，可以合并为一个综合属性
- 属性 1.2, 1.4 和 1.5 都关于比例保持不变，可以合并为一个不变性属性
- 属性 2.2, 2.3 和 2.4 都涉及调试日志记录，可以合并为一个日志属性
- 属性 3.2, 3.4 和 3.5 都关于响应式布局行为，可以合并为一个响应式属性

### 核心正确性属性

**Property 1: 理论模式比例一致性**
*For any* 理论讲解模式的激活，视频面板与讲解面板的宽度比例应该始终为 2:1
**Validates: Requirements 1.1, 1.3, 3.1**

**Property 2: 交互过程中比例不变性**
*For any* 用户交互操作（内容切换、窗口调整、面板内操作），在理论模式下面板比例应该保持不变
**Validates: Requirements 1.2, 1.4, 1.5**

**Property 3: 调试信息完整性**
*For any* 布局相关的操作（模式切换、比例计算、错误检测），调试系统应该记录完整的状态信息
**Validates: Requirements 2.2, 2.3, 2.4**

**Property 4: 响应式布局适应性**
*For any* 设备类型和屏幕尺寸变化，布局系统应该选择适当的布局策略并保持内容可读性
**Validates: Requirements 3.2, 3.4, 3.5**

**Property 5: 错误恢复有效性**
*For any* 检测到的布局异常，系统应该提供有效的恢复机制或自动修正
**Validates: Requirements 2.5**

**Property 6: 调试模式功能性**
*For any* 调试模式的启用，系统应该在控制台输出详细的布局变化日志
**Validates: Requirements 2.1**

**Property 7: 移动设备布局正确性**
*For any* 移动设备访问，系统应该采用垂直堆叠布局而不是水平比例布局
**Validates: Requirements 3.3**

## Error Handling

### 错误类型和处理策略

1. **比例不匹配错误 (RATIO_MISMATCH)**
   - 检测：定期验证实际比例与期望比例的差异
   - 处理：自动重新计算并应用正确的CSS样式
   - 恢复：如果自动修正失败，提供手动重置选项

2. **DOM元素未找到错误 (ELEMENT_NOT_FOUND)**
   - 检测：在尝试操作DOM元素前进行存在性检查
   - 处理：延迟执行或使用MutationObserver等待元素出现
   - 恢复：提供降级方案或用户提示

3. **计算错误 (CALCULATION_ERROR)**
   - 检测：验证计算结果的合理性（如比例值在有效范围内）
   - 处理：使用默认值或上一次有效的计算结果
   - 恢复：重新初始化计算器或刷新页面

### 错误恢复机制

```typescript
class ErrorRecoveryManager {
  private recoveryStrategies: Map<string, RecoveryStrategy>;
  
  // 注册恢复策略
  registerStrategy(errorType: string, strategy: RecoveryStrategy): void;
  
  // 执行恢复操作
  async recover(error: LayoutError): Promise<boolean>;
  
  // 获取恢复建议
  getRecoverySuggestions(error: LayoutError): RecoveryAction[];
}
```

## Testing Strategy

### 双重测试方法

本系统将采用单元测试和属性测试相结合的方法：

**单元测试覆盖：**
- 特定设备类型的布局计算
- 模式切换的DOM操作
- 错误处理的边界情况
- 调试日志的格式验证

**属性测试覆盖：**
- 使用 **fast-check** 作为属性测试库
- 每个属性测试运行最少 100 次迭代
- 生成随机的设备尺寸、模式切换序列和用户交互

### 属性测试实现要求

每个属性测试必须：
1. 使用注释标记对应的设计文档属性：`**Feature: panel-layout-consistency, Property X: [property_text]**`
2. 生成智能的测试数据（如合理的屏幕尺寸范围）
3. 验证系统在各种输入下的正确行为
4. 在测试失败时提供清晰的反例信息

### 测试环境配置

- **测试框架**: Jest + fast-check
- **DOM环境**: jsdom 用于模拟浏览器环境
- **设备模拟**: 使用 viewport 设置模拟不同设备
- **CSS测试**: 使用 getComputedStyle 验证实际应用的样式