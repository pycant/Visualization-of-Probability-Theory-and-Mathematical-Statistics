// TypeScript 类型定义 - 面板布局系统
// Type definitions for Panel Layout System

/**
 * 布局模式枚举
 * Layout mode enumeration
 */
export enum LayoutMode {
  EXPERIENCE = 'experience',
  EXPERIMENT = 'experiment', 
  THEORY = 'theory'
}

/**
 * 设备类型枚举
 * Device type enumeration
 */
export enum DeviceType {
  DESKTOP = 'desktop',
  TABLET = 'tablet',
  MOBILE = 'mobile'
}

/**
 * 面板尺寸信息
 * Panel dimensions information
 */
export interface PanelDimensions {
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

/**
 * 布局状态
 * Layout state
 */
export interface LayoutState {
  currentMode: LayoutMode;
  deviceType: DeviceType;
  dimensions: PanelDimensions;
  isValid: boolean;
  timestamp: number;
}

/**
 * 布局错误信息
 * Layout error information
 */
export interface LayoutError {
  type: 'RATIO_MISMATCH' | 'ELEMENT_NOT_FOUND' | 'CALCULATION_ERROR';
  message: string;
  expectedRatio?: number;
  actualRatio?: number;
  timestamp: number;
}

/**
 * 恢复操作
 * Recovery action
 */
export interface RecoveryAction {
  type: 'RECALCULATE' | 'RESET_CSS' | 'FORCE_REFRESH';
  description: string;
  execute: () => void;
}

/**
 * Layout Manager 接口
 * Layout Manager interface
 */
export interface ILayoutManager {
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

/**
 * Ratio Calculator 接口
 * Ratio Calculator interface
 */
export interface IRatioCalculator {
  // 计算目标比例
  calculateTargetRatio(mode: LayoutMode, deviceType: DeviceType): number;
  
  // 验证当前比例是否正确
  validateCurrentRatio(expectedRatio: number): boolean;
  
  // 获取实际面板尺寸
  getPanelDimensions(): PanelDimensions;
  
  // 应用比例到DOM元素
  applyRatioToElements(ratio: number): void;
}

/**
 * Debug Logger 接口
 * Debug Logger interface
 */
export interface IDebugLogger {
  // 记录布局变化
  logLayoutChange(before: LayoutState, after: LayoutState): void;
  
  // 记录模式切换
  logModeSwitch(fromMode: LayoutMode, toMode: LayoutMode): void;
  
  // 记录错误和警告
  logError(error: LayoutError): void;
  
  // 提供恢复建议
  suggestRecovery(error: LayoutError): RecoveryAction[];
}

/**
 * 事件观察者接口
 * Event observer interface
 */
export interface IEventObserver {
  // 开始观察
  startObserving(): void;
  
  // 停止观察
  stopObserving(): void;
  
  // 处理事件
  handleEvent(event: Event): void;
}

/**
 * 布局策略接口
 * Layout strategy interface
 */
export interface ILayoutStrategy {
  // 应用布局策略
  applyLayout(state: LayoutState): void;
  
  // 检查是否适用于当前设备
  isApplicable(deviceType: DeviceType): boolean;
  
  // 获取推荐的面板比例
  getRecommendedRatio(): number;
}