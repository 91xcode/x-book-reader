/**
 * 高级事件分发器 - 参考readest项目实现
 * 支持同步和异步事件处理
 */
class EventDispatcher {
  private syncListeners: Map<string, Array<(event: CustomEvent) => boolean>>;
  private asyncListeners: Map<string, Set<(event: CustomEvent) => Promise<void> | void>>;

  constructor() {
    this.syncListeners = new Map();
    this.asyncListeners = new Map();
  }

  /**
   * 监听异步事件
   */
  on(event: string, callback: (event: CustomEvent) => Promise<void> | void): void {
    if (!this.asyncListeners.has(event)) {
      this.asyncListeners.set(event, new Set());
    }
    this.asyncListeners.get(event)!.add(callback);
  }

  /**
   * 移除异步事件监听
   */
  off(event: string, callback: (event: CustomEvent) => Promise<void> | void): void {
    this.asyncListeners.get(event)?.delete(callback);
  }

  /**
   * 分发异步事件
   */
  async dispatch(event: string, detail?: unknown): Promise<void> {
    const listeners = this.asyncListeners.get(event);
    if (listeners) {
      const customEvent = new CustomEvent(event, { detail });
      for (const listener of listeners) {
        try {
          await listener(customEvent);
        } catch (error) {
          console.error(`Error in async event listener for ${event}:`, error);
        }
      }
    }
  }

  /**
   * 监听同步事件
   */
  onSync(event: string, callback: (event: CustomEvent) => boolean): void {
    if (!this.syncListeners.has(event)) {
      this.syncListeners.set(event, []);
    }
    this.syncListeners.get(event)!.push(callback);
  }

  /**
   * 移除同步事件监听
   */
  offSync(event: string, callback: (event: CustomEvent) => boolean): void {
    const listeners = this.syncListeners.get(event);
    if (listeners) {
      this.syncListeners.set(
        event,
        listeners.filter((listener) => listener !== callback),
      );
    }
  }

  /**
   * 分发同步事件
   * @returns {boolean} 是否有监听器消费了该事件
   */
  dispatchSync(event: string, detail?: unknown): boolean {
    const listeners = this.syncListeners.get(event);
    if (listeners) {
      const customEvent = new CustomEvent(event, { detail });
      for (const listener of [...listeners].reverse()) {
        try {
          const consumed = listener(customEvent);
          if (consumed) {
            return true;
          }
        } catch (error) {
          console.error(`Error in sync event listener for ${event}:`, error);
        }
      }
    }
    return false;
  }

  /**
   * 移除所有监听器
   */
  removeAllListeners(event?: string) {
    if (event) {
      this.asyncListeners.delete(event);
      this.syncListeners.delete(event);
    } else {
      this.asyncListeners.clear();
      this.syncListeners.clear();
    }
  }
}

// 导出单例实例
export const eventDispatcher = new EventDispatcher(); 