
export class HistoryManager {
  constructor({ maxHistory = 60 } = {}) {
    this.maxHistory = maxHistory;
    this.undoStack = [];
    this.redoStack = [];
    this.listeners = new Set();
    this.isExecuting = false;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ canUndo: this.canUndo(), canRedo: this.canRedo() });
    return () => this.listeners.delete(callback);
  }

  _notify(lastAction = null, direction = null) {
    const state = {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      lastAction,
      direction,
    };
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (err) {
        console.error('History listener error:', err);
      }
    }
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  push(action) {
    if (this.isExecuting) return;
    if (!action || typeof action.undo !== 'function' || typeof action.redo !== 'function') {
      console.warn('Invalid action passed to HistoryManager.push:', action);
      return;
    }

    this.undoStack.push(action);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift(); 
    }

    this.redoStack = [];
    this._notify(action, 'push');
  }

  async undo() {
    if (!this.canUndo() || this.isExecuting) return false;

    const action = this.undoStack.pop();
    this.isExecuting = true;
    try {
      await action.undo();
      this.redoStack.push(action);
      this._notify(action, 'undo');
      return true;
    } catch (err) {
      console.error('Error executing undo for action:', action, err);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  async redo() {
    if (!this.canRedo() || this.isExecuting) return false;

    const action = this.redoStack.pop();
    this.isExecuting = true;
    try {
      await action.redo();
      this.undoStack.push(action);
      this._notify(action, 'redo');
      return true;
    } catch (err) {
      console.error('Error executing redo for action:', action, err);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
    this._notify(null, 'clear');
  }
}
