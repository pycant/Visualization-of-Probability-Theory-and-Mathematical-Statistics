// Layout Manager - 布局管理器核心实现
// Core implementation of Layout Manager

import { 
  ILayoutManager, 
  LayoutMode, 
  LayoutState, 
  DeviceType,
  PanelDimensions 
} from '../types/LayoutTypes';
import { RatioCalculator } from './RatioCalculator';
import { DebugLogger } from './DebugLogger';

/**
 * 布局管理器 - 负责协调整个布局系统
 * Layout Manager - Coordinates the entire layout system
 */
export class LayoutManager implements ILayoutManager {
  private currentState: LayoutState;
  private ratioCalculator: RatioCalculator;
  private debugLogger: DebugLogger;
  private isInitialized: boolean = false;
  private debugMode: boolean = false;

  constructor() {
    this.ratioCalculator = new RatioCalculator();
    this.debugLogger = new DebugLogger();
    
    // 初始化默认状态
    this.currentState = {
      currentMode: LayoutMode.EXPERIENCE,
      deviceType: this.detectDeviceType(),
      dimensions: this.getDefaultDimensions(),
      isValid: false,
      timestamp: Date.now()
    };
  }

  /**
   * 初始化布局系统
   * Initialize layout system
   */
  initialize(): void {
    if (this.isInitialized) {
      if (this.debugMode) {
        this.debugLogger.logError({
          type: 'CALCULATION_ERROR',
          message: 'Layout system already initialized',
          timestamp: Date.now()
        });
      }
      return;
    }

    try {
      // 检测设备类型
      this.currentState.deviceType = this.detectDeviceType();
      
      // 初始化比例计算器
      this.ratioCalculator.initialize();
      
      // 设置初始布局
      this.recalculateLayout();
      
      this.isInitialized = true;
      
      if (this.debugMode) {
        console.log('[LayoutManager] System initialized successfully');
      }
    } catch (error) {
      const layoutError = {
        type: 'CALCULATION_ERROR' as const,
        message: `Failed to initialize layout system: ${error}`,
        timestamp: Date.now()
      };
      
      this.debugLogger.logError(layoutError);
      throw error;
    }
  }

  /**
   * 切换到指定模式
   * Switch to specified mode
   */
  switchToMode(mode: LayoutMode): void {
    if (!this.isInitialized) {
      throw new Error('Layout system not initialized');
    }

    const previousMode = this.currentState.currentMode;
    
    if (previousMode === mode) {
      if (this.debugMode) {
        console.log(`[LayoutManager] Already in ${mode} mode`);
      }
      return;
    }

    if (this.debugMode) {
      this.debugLogger.logModeSwitch(previousMode, mode);
    }

    const previousState = { ...this.currentState };
    this.currentState.currentMode = mode;
    this.currentState.timestamp = Date.now();

    // 重新计算布局
    this.recalculateLayout();

    if (this.debugMode) {
      this.debugLogger.logLayoutChange(previousState, this.currentState);
    }
  }

  /**
   * 强制重新计算布局
   * Force recalculate layout
   */
  recalculateLayout(): void {
    try {
      const targetRatio = this.ratioCalculator.calculateTargetRatio(
        this.currentState.currentMode,
        this.currentState.deviceType
      );

      // 获取当前面板尺寸
      const dimensions = this.ratioCalculator.getPanelDimensions();
      
      // 验证当前比例
      const isValid = this.ratioCalculator.validateCurrentRatio(targetRatio);
      
      if (!isValid) {
        // 应用正确的比例
        this.ratioCalculator.applyRatioToElements(targetRatio);
        
        // 重新获取尺寸
        this.currentState.dimensions = this.ratioCalculator.getPanelDimensions();
      } else {
        this.currentState.dimensions = dimensions;
      }

      this.currentState.isValid = true;
      this.currentState.timestamp = Date.now();

      if (this.debugMode) {
        console.log('[LayoutManager] Layout recalculated successfully', {
          mode: this.currentState.currentMode,
          targetRatio,
          actualRatio: this.currentState.dimensions.ratio,
          isValid: this.currentState.isValid
        });
      }
    } catch (error) {
      this.currentState.isValid = false;
      
      const layoutError = {
        type: 'CALCULATION_ERROR' as const,
        message: `Failed to recalculate layout: ${error}`,
        timestamp: Date.now()
      };
      
      this.debugLogger.logError(layoutError);
      
      if (this.debugMode) {
        console.error('[LayoutManager] Layout recalculation failed:', error);
      }
    }
  }

  /**
   * 获取当前布局状态
   * Get current layout state
   */
  getCurrentState(): LayoutState {
    return { ...this.currentState };
  }

  /**
   * 启用/禁用调试模式
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.debugLogger.setDebugMode(enabled);
    
    if (enabled) {
      console.log('[LayoutManager] Debug mode enabled');
    }
  }

  /**
   * 检测设备类型
   * Detect device type
   */
  private detectDeviceType(): DeviceType {
    const width = window.innerWidth;
    
    if (width >= 1024) {
      return DeviceType.DESKTOP;
    } else if (w