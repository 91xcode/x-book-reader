/**
 * 简单的事件分发器
 * 用于组件之间的通信
 */
class EventDispatcher {
  private listeners: Record<string, Function[]> = {};

  /**
   * 监听事件
   */
  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event: string, callback: Function) {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  /**
   * 分发事件
   */
  dispatch(event: string, data?: any) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// 导出单例实例
export const eventDispatcher = new EventDispatcher(); 