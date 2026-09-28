
export class KeyboardManager {
  constructor() {
    this.handlers = new Map();
    this.lastFocusedElement = null;
    this.modalTrapCleanup = null;
    this.announcerEl = null;
  }

  init({ announcerId = 'a11yAnnouncer' } = {}) {
    if (typeof document === 'undefined') return;
    this.announcerEl = document.getElementById(announcerId);
    this._attachGlobalListener();
  }

  announce(message) {
    if (!this.announcerEl && typeof document !== 'undefined') {
      this.announcerEl = document.getElementById('a11yAnnouncer');
    }
    if (this.announcerEl) {
      this.announcerEl.textContent = '';
      setTimeout(() => {
        this.announcerEl.textContent = message;
      }, 50);
    }
  }

  isTyping() {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || active.isContentEditable;
  }

  getActiveModal() {
    if (typeof document === 'undefined') return null;
    return document.querySelector('.modal-backdrop.active, .modal-backdrop.open');
  }

  openModal(modalElement) {
    if (!modalElement) return;
    this.lastFocusedElement = document.activeElement;
    modalElement.classList.add('active', 'open');
    modalElement.setAttribute('aria-hidden', 'false');

    const focusable = modalElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }

    const handleModalKey = (e) => {
      if (e.key === 'Tab') {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleModalKey);
    this.modalTrapCleanup = () => {
      modalElement.removeEventListener('keydown', handleModalKey);
    };
  }

  closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('active', 'open');
    modalElement.setAttribute('aria-hidden', 'true');
    if (this.modalTrapCleanup) {
      this.modalTrapCleanup();
      this.modalTrapCleanup = null;
    }
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
      this.lastFocusedElement = null;
    }
  }

  _attachGlobalListener() {
    document.addEventListener('keydown', (e) => {
      const isInput = this.isTyping();
      const activeModal = this.getActiveModal();

      if (e.key === 'Escape') {
        if (activeModal) {
          e.preventDefault();
          const closeBtn = activeModal.querySelector('.modal-close-btn') || activeModal.querySelector('#btnCloseSurprise, #btnClosePrefs, #btnCloseOnboarding, #btnCloseKeyboardHelp');
          if (closeBtn) closeBtn.click();
          else this.closeModal(activeModal);
          return;
        }
        if (this.handlers.has('escape') && !isInput) {
          this.handlers.get('escape')(e);
          return;
        }
      }

      if (isInput) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        if (this.handlers.has('help')) {
          this.handlers.get('help')(e);
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      if (isCtrlOrCmd && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (this.handlers.has('undo')) this.handlers.get('undo')(e);
        return;
      }
      if ((isCtrlOrCmd && e.shiftKey && (e.key === 'z' || e.key === 'Z')) || (isCtrlOrCmd && (e.key === 'y' || e.key === 'Y'))) {
        e.preventDefault();
        if (this.handlers.has('redo')) this.handlers.get('redo')(e);
        return;
      }

      if (isCtrlOrCmd && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        if (this.handlers.has('export')) this.handlers.get('export')(e);
        return;
      }

      if (isCtrlOrCmd && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (this.handlers.has('print')) this.handlers.get('print')(e);
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        const isBtn = document.activeElement && ['BUTTON', 'A', 'INPUT'].includes(document.activeElement.tagName);
        if (!isBtn && !activeModal && this.handlers.has('space')) {
          e.preventDefault();
          this.handlers.get('space')(e);
          return;
        }
      }

      if (this.handlers.has('stickerNudge') && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!activeModal && this.handlers.get('stickerNudge')(e)) {
          e.preventDefault();
          return;
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && this.handlers.has('delete')) {
        if (!activeModal && this.handlers.get('delete')(e)) {
          e.preventDefault();
          return;
        }
      }

      if ((e.key === 'r' || e.key === 'R') && !isCtrlOrCmd && this.handlers.has('rotate')) {
        if (!activeModal && this.handlers.get('rotate')(e)) {
          e.preventDefault();
          return;
        }
      }

      if (isCtrlOrCmd && (e.key === 'd' || e.key === 'D') && this.handlers.has('duplicate')) {
        if (!activeModal && this.handlers.get('duplicate')(e)) {
          e.preventDefault();
          return;
        }
      }

      if (isCtrlOrCmd && (e.key === ']' || e.key === '[') && this.handlers.has('layer')) {
        if (!activeModal && this.handlers.get('layer')(e)) {
          e.preventDefault();
          return;
        }
      }
    });
  }

  on(action, callback) {
    this.handlers.set(action, callback);
  }
}

export const keyboardManager = new KeyboardManager();
