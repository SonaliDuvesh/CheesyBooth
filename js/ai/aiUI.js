
import { aiManager } from './aiManager.js';
import { aiSettings } from './aiSettings.js';

export class AIUI {
  constructor() {
    this.selectedStyle = 'cute';
    this.selectedMood = 'fun';
    this.selectedGroupSize = 1;
    this._onCaptionSelectedCallback = null;
    this._onSessionPlanApplyCallback = null;
  }

  openCaptionModal(onSelectCaption) {
    this._onCaptionSelectedCallback = onSelectCaption;
    const modal = document.getElementById('aiCaptionModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    const firstStyleBtn = modal.querySelector('.ai-style-chip');
    if (firstStyleBtn) firstStyleBtn.focus();

    this.generateCaptions();
  }

  closeCaptionModal() {
    const modal = document.getElementById('aiCaptionModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    aiManager.cancelActiveRequest();
  }

  async generateCaptions() {
    const container = document.getElementById('aiCaptionResultsContainer');
    const loadingEl = document.getElementById('aiCaptionLoading');
    const regenBtn = document.getElementById('btnAiRegenCaptions');
    const announcer = document.getElementById('a11yAnnouncer');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (container) container.style.display = 'none';
    if (regenBtn) regenBtn.disabled = true;

    try {
      const captions = await aiManager.generateCaptions({
        style: this.selectedStyle,
        count: 3,
      });

      if (!captions || captions.length === 0) {
        if (loadingEl) loadingEl.style.display = 'none';
        return;
      }

      if (container) {
        container.innerHTML = captions.map((cap, i) => `
          <div class="ai-caption-card" data-caption="${cap.replace(/"/g, '&quot;')}">
            <p class="ai-caption-text">"${cap}"</p>
            <div class="ai-caption-actions">
              <button class="btn-caption-copy" title="Copy to clipboard" aria-label="Copy caption: ${cap}">📋 Copy</button>
              <button class="btn-caption-use" title="Use as photo stamp text" aria-label="Use caption: ${cap}">✓ Use</button>
            </div>
          </div>
        `).join('');

        container.querySelectorAll('.btn-caption-copy').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const card = e.target.closest('.ai-caption-card');
            const text = card?.getAttribute('data-caption');
            if (text) {
              navigator.clipboard?.writeText(text);
              btn.textContent = '✓ Copied!';
              setTimeout(() => { btn.textContent = '📋 Copy'; }, 1500);
            }
          });
        });

        container.querySelectorAll('.btn-caption-use').forEach((btn) => {
          btn.addEventListener('click', (e) => {
            const card = e.target.closest('.ai-caption-card');
            const text = card?.getAttribute('data-caption');
            if (text && this._onCaptionSelectedCallback) {
              this._onCaptionSelectedCallback(text);
              this.closeCaptionModal();
            }
          });
        });

        container.style.display = 'flex';
      }

      if (announcer) {
        announcer.textContent = `${captions.length} caption ideas ready.`;
      }
    } catch (err) {
      if (container) {
        container.innerHTML = `
          <div class="ai-error-notice">
            <span>⚠️</span>
            <span>Could not generate captions. Built-in fallbacks available.</span>
          </div>
        `;
        container.style.display = 'flex';
      }
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      if (regenBtn) regenBtn.disabled = false;
    }
  }

  openPlannerModal(onApplyPlan) {
    this._onSessionPlanApplyCallback = onApplyPlan;
    const modal = document.getElementById('aiPlannerModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');

    this.generateSessionPlan();
  }

  closePlannerModal() {
    const modal = document.getElementById('aiPlannerModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    aiManager.cancelActiveRequest();
  }

  async generateSessionPlan() {
    const loadingEl = document.getElementById('aiPlannerLoading');
    const previewEl = document.getElementById('aiPlannerPreview');
    const regenBtn = document.getElementById('btnAiRegenPlan');
    const announcer = document.getElementById('a11yAnnouncer');

    if (loadingEl) loadingEl.style.display = 'flex';
    if (previewEl) previewEl.style.display = 'none';
    if (regenBtn) regenBtn.disabled = true;

    try {
      const plan = await aiManager.planSession({
        mood: this.selectedMood,
        groupSize: this.selectedGroupSize,
      });

      if (!plan) return;

      if (previewEl) {
        previewEl.innerHTML = `
          <div class="ai-plan-card">
            <div class="ai-plan-header">
              <span class="ai-plan-badge">✦ Curated Proposal</span>
              <h4 class="ai-plan-title">${plan.title}</h4>
              <p class="ai-plan-desc">${plan.description}</p>
            </div>

            <div class="ai-plan-specs">
              <div class="ai-spec-pill"><span>🎨 Theme:</span> <strong>${plan.themeId}</strong></div>
              <div class="ai-spec-pill"><span>🎭 Mode:</span> <strong>${plan.modeId}</strong></div>
              <div class="ai-spec-pill"><span>⏱️ Timer:</span> <strong>${plan.countdown}s</strong></div>
              <div class="ai-spec-pill"><span>📸 Shots:</span> <strong>${plan.photoCount}</strong></div>
              <div class="ai-spec-pill"><span>🎞️ Filter:</span> <strong>${plan.filterId}</strong></div>
              <div class="ai-spec-pill"><span>▦ Layout:</span> <strong>${plan.layoutId}</strong></div>
            </div>

            <div class="ai-plan-actions">
              <button id="btnApplyAiPlanConfirm" class="btn-shutter" style="padding: 9px 20px; font-size: 13px;">
                <span>✓</span> Apply This Setup
              </button>
            </div>
          </div>
        `;

        document.getElementById('btnApplyAiPlanConfirm')?.addEventListener('click', () => {
          if (this._onSessionPlanApplyCallback) {
            this._onSessionPlanApplyCallback(plan);
          }
          this.closePlannerModal();
        });

        previewEl.style.display = 'block';
      }

      if (announcer) {
        announcer.textContent = `Session plan ready: ${plan.title}.`;
      }
    } catch (err) {
      if (previewEl) {
        previewEl.innerHTML = `
          <div class="ai-error-notice">
            <span>⚠️</span>
            <span>Unable to assemble session plan. Using default settings.</span>
          </div>
        `;
        previewEl.style.display = 'block';
      }
    } finally {
      if (loadingEl) loadingEl.style.display = 'none';
      if (regenBtn) regenBtn.disabled = false;
    }
  }

  initDOM() {

    document.querySelectorAll('.ai-style-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.ai-style-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedStyle = chip.getAttribute('data-style') || 'cute';
        this.generateCaptions();
      });
    });

    document.getElementById('btnCloseAiCaption')?.addEventListener('click', () => this.closeCaptionModal());
    document.getElementById('btnCancelAiCaption')?.addEventListener('click', () => this.closeCaptionModal());
    document.getElementById('btnAiRegenCaptions')?.addEventListener('click', () => this.generateCaptions());

    document.querySelectorAll('.ai-mood-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.ai-mood-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedMood = chip.getAttribute('data-mood') || 'fun';
        this.generateSessionPlan();
      });
    });

    document.querySelectorAll('.ai-group-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.ai-group-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedGroupSize = parseInt(chip.getAttribute('data-size') || '1', 10);
        this.generateSessionPlan();
      });
    });

    document.getElementById('btnCloseAiPlanner')?.addEventListener('click', () => this.closePlannerModal());
    document.getElementById('btnCancelAiPlanner')?.addEventListener('click', () => this.closePlannerModal());
    document.getElementById('btnAiRegenPlan')?.addEventListener('click', () => this.generateSessionPlan());

    this._bindSettingsControls();
  }

  _bindSettingsControls() {
    const masterToggle = document.getElementById('prefAiMasterToggle');
    const photoAiToggle = document.getElementById('prefAiPhotoToggle');
    const captionsToggle = document.getElementById('prefAiCaptionsToggle');
    const posesToggle = document.getElementById('prefAiPosesToggle');
    const themesToggle = document.getElementById('prefAiThemesToggle');

    if (masterToggle) {
      masterToggle.checked = aiSettings.get('enabled');
      masterToggle.addEventListener('change', (e) => {
        aiSettings.set('enabled', e.target.checked);
        this.updateSettingsStatusUI();
      });
    }

    if (photoAiToggle) {
      photoAiToggle.checked = aiSettings.get('photoAiEnabled');
      photoAiToggle.addEventListener('change', (e) => {
        aiSettings.set('photoAiEnabled', e.target.checked);
      });
    }

    if (captionsToggle) {
      captionsToggle.checked = aiSettings.get('captionsEnabled');
      captionsToggle.addEventListener('change', (e) => {
        aiSettings.set('captionsEnabled', e.target.checked);
      });
    }

    if (posesToggle) {
      posesToggle.checked = aiSettings.get('poseSuggestionsEnabled');
      posesToggle.addEventListener('change', (e) => {
        aiSettings.set('poseSuggestionsEnabled', e.target.checked);
      });
    }

    if (themesToggle) {
      themesToggle.checked = aiSettings.get('themeSuggestionsEnabled');
      themesToggle.addEventListener('change', (e) => {
        aiSettings.set('themeSuggestionsEnabled', e.target.checked);
      });
    }

    this.updateSettingsStatusUI();
  }

  updateSettingsStatusUI() {
    const statusBadge = document.getElementById('prefAiStatusBadge');
    if (!statusBadge) return;

    const status = aiManager.getStatus();
    if (status === 'disabled') {
      statusBadge.textContent = 'Disabled';
      statusBadge.style.background = 'rgba(100,100,100,0.15)';
      statusBadge.style.color = 'var(--color-charcoal-subtle)';
    } else if (status === 'offline-local-fallback') {
      statusBadge.textContent = 'Offline (Local Heuristics)';
      statusBadge.style.background = '#FFF3E0';
      statusBadge.style.color = '#E65100';
    } else {
      statusBadge.textContent = 'Available (Local Fallback Active)';
      statusBadge.style.background = '#E8F5E9';
      statusBadge.style.color = '#2E7D32';
    }
  }
}

export const aiUI = new AIUI();
