import { browserSupport } from './compatibility/browserSupport.js';
import { feedbackManager } from './ui/feedbackManager.js';
import { easterEggManager } from './easterEggs/easterEggManager.js';
import { statisticsManager } from './statistics/statisticsManager.js';
import { StatisticsRenderer } from './statistics/statisticsRenderer.js';
import { themeManager } from './themes/themeManager.js';
import { aiManager } from './ai/aiManager.js';
import { aiUI } from './ai/aiUI.js';
import { aiSettings } from './ai/aiSettings.js';
import { soundManager } from './audio/soundManager.js';
import { CameraManager } from './camera/cameraManager.js';
import { PhotoManager } from './photos/photoManager.js';
import { SessionManager } from './session/sessionManager.js';
import { voiceTriggerManager } from './session/voiceTriggerManager.js';

import { CollageRenderer, STYLE_PRESETS } from './collage/collageRenderer.js';
import { COLLAGE_LAYOUTS, LAYOUT_CATEGORIES, getLayoutsByCategory } from './collage/layouts.js';
import { storageManager } from './storage/storageManager.js';
import { HistoryManager } from './history/historyManager.js';
import { FILTER_PRESETS, getFilterCSS, getRandomFilterId } from './filters/filterPresets.js';
import { preferenceManager, THEMES, PERSONALITY_MESSAGES } from './preferences/preferenceManager.js';
import { FUN_MODES, getFunMode } from './modes/funModes.js';
import { randomizerEngine, STYLE_FAMILIES } from './randomizer/randomizer.js';
import { mobileManager } from './mobile/mobileManager.js';
import { keyboardManager } from './accessibility/keyboardManager.js';
import { privacyManager } from './privacy/privacyManager.js';
import { recoveryManager } from './recovery/recoveryManager.js';
import { ExportManager } from './export/exportManager.js';
import { ExportCapabilityDetector } from './export/exportFormats.js';
import { PrintManager } from './print/printManager.js';
import { pwaManager } from './pwa/pwaManager.js';
import { performanceManager } from './performance/performanceManager.js';
import { imageCache } from './performance/imageCache.js';
import { filterCache } from './performance/filterCache.js';
import { errorManager } from './errors/errorManager.js';
import { ErrorCategory, ErrorSeverity, AppError } from './errors/errorTypes.js';
import {
  STICKER_PACKS,
  getAllBuiltInStickers,
  getRandomSticker,
  getFavorites,
  toggleFavorite,
  isFavorite,
  getRecents,
  addRecent,
  searchStickers,
} from './stickers/stickerLibrary.js';

document.addEventListener('DOMContentLoaded', async () => {

  const videoEl = document.getElementById('cameraVideo');
  const flashLayer = document.getElementById('flashLayer');
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownNumber = document.getElementById('countdownNumber');
  const statusBadge = document.getElementById('statusBadge');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const btnShutterCamera = document.getElementById('btnShutterCamera');
  const shutterCameraBtnText = document.getElementById('shutterCameraBtnText');
  const btnShutterVoice = document.getElementById('btnShutterVoice');
  const shutterVoiceBtnText = document.getElementById('shutterVoiceBtnText');
  const btnShutter = btnShutterCamera || document.getElementById('btnShutter');
  const shutterBtnText = shutterCameraBtnText || document.getElementById('shutterBtnText');

  const voiceModeOverlay = document.getElementById('voiceModeOverlay');
  const voiceHudTitle = document.getElementById('voiceHudTitle');
  const voiceHudProgress = document.getElementById('voiceHudProgress');
  const sessionCounterText = document.getElementById('sessionCounterText');
  const meterDotsContainer = document.getElementById('meterDots');
  const retakeModeLabel = document.getElementById('retakeModeLabel');
  const btnSoundToggle = document.getElementById('btnSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const btnSwitchCamera = document.getElementById('btnSwitchCamera');
  const filterTray = document.getElementById('filterTray');
  const activeFilterBadge = document.getElementById('activeFilterBadge');
  const cameraFallbackMsg = document.getElementById('cameraFallbackMsg');
  const btnRetryCamera = document.getElementById('btnRetryCamera');
  const sideStripDock = document.getElementById('sideStripDock');
  const viewfinderWrapper = document.getElementById('viewfinderWrapper');

  const headerBrandTitle = document.getElementById('headerBrandTitle');
  const headerBrandTag = document.getElementById('headerBrandTag');
  const btnOpenPreferences = document.getElementById('btnOpenPreferences');
  const welcomeBanner = document.getElementById('welcomeBanner');
  const welcomeGreetingText = document.getElementById('welcomeGreetingText');
  const welcomeSubtext = document.getElementById('welcomeSubtext');
  const btnApplyLastSetup = document.getElementById('btnApplyLastSetup');

  const boothSection = document.getElementById('boothSection');
  const reviewSection = document.getElementById('reviewSection');
  const collageSection = document.getElementById('collageSection');

  const photoDeskGrid = document.getElementById('photoDeskGrid');
  const btnRestartSession = document.getElementById('btnRestartSession');
  const btnProceedToCollage = document.getElementById('btnProceedToCollage');
  const collageCanvas = document.getElementById('collageCanvas');
  const layoutPicker = document.getElementById('layoutPicker');
  const colorSwatches = document.getElementById('colorSwatches');
  const spacingSlider = document.getElementById('spacingSlider');
  const spacingValText = document.getElementById('spacingValText');
  const stampTextInput = document.getElementById('stampTextInput');
  const stickersTray = document.getElementById('stickersTray');
  const btnDownloadGIF = document.getElementById('btnDownloadGIF');
  const btnDownloadPNG = document.getElementById('btnDownloadPNG');
  const btnCopyImage = document.getElementById('btnCopyImage');
  const btnBackToReview = document.getElementById('btnBackToReview');

  const collageAccordion = document.getElementById('collageAccordion');
  const btnSurpriseCollage = document.getElementById('btnSurpriseCollage');
  const presetStylesRibbon = document.getElementById('presetStylesRibbon');
  const layoutCategoryTabs = document.getElementById('layoutCategoryTabs');
  const aspectRatioGroup = document.getElementById('aspectRatioGroup');
  const frameStyleGroup = document.getElementById('frameStyleGroup');
  const photoShapeGroup = document.getElementById('photoShapeGroup');
  const customColorPicker = document.getElementById('customColorPicker');
  const paddingSlider = document.getElementById('paddingSlider');
  const paddingValText = document.getElementById('paddingValText');
  const borderRadiusSlider = document.getElementById('borderRadiusSlider');
  const borderRadiusValText = document.getElementById('borderRadiusValText');
  const slotInspector = document.getElementById('slotInspector');
  const slotInspectorTitle = document.getElementById('slotInspectorTitle');
  const btnResetSlotTransform = document.getElementById('btnResetSlotTransform');
  const slotZoomSlider = document.getElementById('slotZoomSlider');
  const slotZoomValText = document.getElementById('slotZoomValText');
  const slotPanXSlider = document.getElementById('slotPanXSlider');
  const slotPanXValText = document.getElementById('slotPanXValText');
  const slotPanYSlider = document.getElementById('slotPanYSlider');
  const slotPanYValText = document.getElementById('slotPanYValText');
  const btnSlotRotateCCW = document.getElementById('btnSlotRotateCCW');
  const btnSlotRotateCW = document.getElementById('btnSlotRotateCW');
  const btnSlotFlipH = document.getElementById('btnSlotFlipH');
  const btnSlotFlipV = document.getElementById('btnSlotFlipV');
  const slotFilterSelect = document.getElementById('slotFilterSelect');
  const slotSwapSelect = document.getElementById('slotSwapSelect');
  const btnSwapSlotConfirm = document.getElementById('btnSwapSlotConfirm');
  const footerAlignGroup = document.getElementById('footerAlignGroup');
  const footerFontSelect = document.getElementById('footerFontSelect');
  const slotOverlayContainer = document.getElementById('slotOverlayContainer');

  const onboardingModal = document.getElementById('onboardingModal');
  const obDisplayName = document.getElementById('obDisplayName');
  const obBoothName = document.getElementById('obBoothName');
  const obPersonalityGrid = document.getElementById('obPersonalityGrid');
  const obPhotoCountGroup = document.getElementById('obPhotoCountGroup');
  const obCountdownGroup = document.getElementById('obCountdownGroup');
  const btnSkipOnboarding = document.getElementById('btnSkipOnboarding');
  const btnPrevOnboarding = document.getElementById('btnPrevOnboarding');
  const btnNextOnboarding = document.getElementById('btnNextOnboarding');

  const preferencesModal = document.getElementById('preferencesModal');
  const btnClosePreferences = document.getElementById('btnClosePreferences');
  const btnDonePreferences = document.getElementById('btnDonePreferences');
  const prefTabs = document.getElementById('prefTabs');
  const prefDisplayName = document.getElementById('prefDisplayName');
  const prefBoothName = document.getElementById('prefBoothName');
  const prefGreeting = document.getElementById('prefGreeting');
  const prefPhotoCountGroup = document.getElementById('prefPhotoCountGroup');
  const prefCountdownGroup = document.getElementById('prefCountdownGroup');
  const prefPosePromptsGroup = document.getElementById('prefPosePromptsGroup');
  const prefDefaultLayout = document.getElementById('prefDefaultLayout');
  const prefDefaultFilter = document.getElementById('prefDefaultFilter');
  const prefDefaultFrameStyle = document.getElementById('prefDefaultFrameStyle');
  const prefThemesGrid = document.getElementById('prefThemesGrid');
  const prefPersonalityGrid = document.getElementById('prefPersonalityGrid');
  const prefAccentPicker = document.getElementById('prefAccentPicker');
  const prefToggleSound = document.getElementById('prefToggleSound');
  const prefVolumeSlider = document.getElementById('prefVolumeSlider');
  const prefVolumeVal = document.getElementById('prefVolumeVal');
  const prefSoundStyle = document.getElementById('prefSoundStyle');
  const prefAnimIntensity = document.getElementById('prefAnimIntensity');
  const prefPerformanceMode = document.getElementById('prefPerformanceMode');
  const prefToggleMirror = document.getElementById('prefToggleMirror');
  const favFiltersList = document.getElementById('favFiltersList');
  const favLayoutsList = document.getElementById('favLayoutsList');
  const favStickersList = document.getElementById('favStickersList');
  const btnExportPrefs = document.getElementById('btnExportPrefs');
  const importPrefsFile = document.getElementById('importPrefsFile');
  const btnResetPrefs = document.getElementById('btnResetPrefs');

  const funModesScroll = document.getElementById('funModesScroll');
  const activeModeEnergyBadge = document.getElementById('activeModeEnergyBadge');
  const activeModeBanner = document.getElementById('activeModeBanner');
  const activeModeDesc = document.getElementById('activeModeDesc');
  const activeModeSuggest = document.getElementById('activeModeSuggest');
  const activeModeBadge = document.getElementById('activeModeBadge');
  const sessionSummaryCard = document.getElementById('sessionSummaryCard');
  const summaryModeIcon = document.getElementById('summaryModeIcon');
  const summaryModeTitle = document.getElementById('summaryModeTitle');
  const summaryModeStats = document.getElementById('summaryModeStats');
  const summaryBadge = document.getElementById('summaryBadge');
  const prefDefaultFunMode = document.getElementById('prefDefaultFunMode');
  const btnZoomIn = document.getElementById('btnZoomIn');
  const btnZoomOut = document.getElementById('btnZoomOut');
  const zoomLevelText = document.getElementById('zoomLevelText');
  const cameraZoomBadge = document.getElementById('cameraZoomBadge');
  const liveZoomIndicator = document.getElementById('liveZoomIndicator');
  const liveZoomIndicatorText = document.getElementById('liveZoomIndicatorText');
  const btnUploadPhotos = document.getElementById('btnUploadPhotos');
  const uploadPhotosInput = document.getElementById('uploadPhotosInput');

  const btnSurpriseMe = document.getElementById('btnSurpriseMe');
  const surpriseModal = document.getElementById('surpriseModal');
  const btnCloseSurprise = document.getElementById('btnCloseSurprise');
  const btnTryAgainSurprise = document.getElementById('btnTryAgainSurprise');
  const btnCancelSurprise = document.getElementById('btnCancelSurprise');
  const btnApplySurprise = document.getElementById('btnApplySurprise');
  const surpriseFamilyIcon = document.getElementById('surpriseFamilyIcon');
  const surpriseFamilyTitle = document.getElementById('surpriseFamilyTitle');
  const surpriseFamilyTagline = document.getElementById('surpriseFamilyTagline');
  const surpriseValMode = document.getElementById('surpriseValMode');
  const surpriseValShots = document.getElementById('surpriseValShots');
  const surpriseValCountdown = document.getElementById('surpriseValCountdown');
  const surpriseValFilter = document.getElementById('surpriseValFilter');
  const surpriseValLayout = document.getElementById('surpriseValLayout');
  const surpriseValFrame = document.getElementById('surpriseValFrame');

  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  const btnReviewUndo = document.getElementById('btnReviewUndo');
  const btnReviewRedo = document.getElementById('btnReviewRedo');
  const historyToast = document.getElementById('historyToast');

  const cameraManager = new CameraManager(videoEl);
  const photoManager = new PhotoManager();
  const sessionManager = new SessionManager({ cameraManager, photoManager });
  const collageRenderer = new CollageRenderer(collageCanvas);
  const historyManager = new HistoryManager({ maxHistory: 80 });
  const exportManager = new ExportManager(collageRenderer);
  const printManager = new PrintManager(exportManager.exportRenderer, collageRenderer);

  const initialPhotoCount = preferenceManager.get('defaults.photoCount') || 4;
  photoManager.setTargetCount(initialPhotoCount);
  stampTextInput.value = collageRenderer.settings.stampText;

  const cameraConsentOverlay = document.getElementById('cameraConsentOverlay');
  const btnAllowCamera = document.getElementById('btnAllowCamera');
  const cameraBlockedOverlay = document.getElementById('cameraBlockedOverlay');
  const btnRetryCameraBlocked = document.getElementById('btnRetryCameraBlocked');
  const cameraPrivacyBadge = document.getElementById('cameraPrivacyBadge');
  const cameraPrivacyDot = document.getElementById('cameraPrivacyDot');
  const cameraPrivacyText = document.getElementById('cameraPrivacyText');
  const btnRefreshDataStats = document.getElementById('btnRefreshDataStats');
  const dataPhotoCountBadge = document.getElementById('dataPhotoCountBadge');
  const dataCollageCountBadge = document.getElementById('dataCollageCountBadge');
  const dataPrefsBadge = document.getElementById('dataPrefsBadge');
  const dataEngineBadge = document.getElementById('dataEngineBadge');
  const btnDeletePhotos = document.getElementById('btnDeletePhotos');
  const btnDeleteCollages = document.getElementById('btnDeleteCollages');
  const btnResetPrefsOnly = document.getElementById('btnResetPrefsOnly');
  const btnClearAllData = document.getElementById('btnClearAllData');
  const deleteConfirmModal = document.getElementById('deleteConfirmModal');
  const deleteConfirmTitle = document.getElementById('deleteConfirmTitle');
  const deleteConfirmDesc = document.getElementById('deleteConfirmDesc');
  const btnCloseDeleteConfirm = document.getElementById('btnCloseDeleteConfirm');
  const btnCancelDeleteConfirm = document.getElementById('btnCancelDeleteConfirm');
  const btnProceedDeleteConfirm = document.getElementById('btnProceedDeleteConfirm');
  const privacyToast = document.getElementById('privacyToast');
  const privacyToastIcon = document.getElementById('privacyToastIcon');
  const privacyToastText = document.getElementById('privacyToastText');

  const errorModal = document.getElementById('errorModal');
  const errorModalTitle = document.getElementById('errorModalTitle');
  const errorModalDesc = document.getElementById('errorModalDesc');
  const errorModalTip = document.getElementById('errorModalTip');
  const errorModalIcon = document.getElementById('errorModalIcon');
  const btnErrorModalPrimary = document.getElementById('btnErrorModalPrimary');
  const btnErrorModalSecondary = document.getElementById('btnErrorModalSecondary');
  const btnErrorModalClose = document.getElementById('btnErrorModalClose');
  const appErrorToast = document.getElementById('appErrorToast');
  const appErrorToastText = document.getElementById('appErrorToastText');
  const btnErrorToastAction = document.getElementById('btnErrorToastAction');
  const btnErrorToastDismiss = document.getElementById('btnErrorToastDismiss');

  const autosaveBadge = document.getElementById('autosaveBadge');
  const autosaveDot = document.getElementById('autosaveDot');
  const autosaveText = document.getElementById('autosaveText');
  const btnOpenProjects = document.getElementById('btnOpenProjects');
  const projectsCountBadge = document.getElementById('projectsCountBadge');
  const btnSaveProject = document.getElementById('btnSaveProject');
  const recoveryModal = document.getElementById('recoveryModal');
  const btnCloseRecoveryModal = document.getElementById('btnCloseRecoveryModal');
  const btnDiscardRecovery = document.getElementById('btnDiscardRecovery');
  const btnResumeRecovery = document.getElementById('btnResumeRecovery');
  const recoveryPhotoCount = document.getElementById('recoveryPhotoCount');
  const recoveryTimeAgo = document.getElementById('recoveryTimeAgo');
  const recoveryLayout = document.getElementById('recoveryLayout');
  const recoveryFilter = document.getElementById('recoveryFilter');
  const projectsModal = document.getElementById('projectsModal');
  const btnCloseProjectsModal = document.getElementById('btnCloseProjectsModal');
  const btnDoneProjects = document.getElementById('btnDoneProjects');
  const btnBackupCurrentProject = document.getElementById('btnBackupCurrentProject');
  const importProjectFile = document.getElementById('importProjectFile');
  const projectsGrid = document.getElementById('projectsGrid');
  const noProjectsMsg = document.getElementById('noProjectsMsg');
  const saveProjectModal = document.getElementById('saveProjectModal');
  const btnCloseSaveProjectModal = document.getElementById('btnCloseSaveProjectModal');
  const btnCancelSaveProject = document.getElementById('btnCancelSaveProject');
  const btnConfirmSaveProject = document.getElementById('btnConfirmSaveProject');
  const saveProjectNameInput = document.getElementById('saveProjectNameInput');

  const btnOpenExportStudio = document.getElementById('btnOpenExportStudio');
  const exportModal = document.getElementById('exportModal');
  const btnCloseExportModal = document.getElementById('btnCloseExportModal');
  const exportActiveFormatBadge = document.getElementById('exportActiveFormatBadge');
  const exportPresetsRibbon = document.getElementById('exportPresetsRibbon');
  const exportFormatGrid = document.getElementById('exportFormatGrid');
  const exportResolutionSelect = document.getElementById('exportResolutionSelect');
  const exportCustomDimsRow = document.getElementById('exportCustomDimsRow');
  const exportCustomWidth = document.getElementById('exportCustomWidth');
  const exportCustomHeight = document.getElementById('exportCustomHeight');
  const btnExportAspectLock = document.getElementById('btnExportAspectLock');
  const exportQualityRow = document.getElementById('exportQualityRow');
  const exportQualitySlider = document.getElementById('exportQualitySlider');
  const exportQualityVal = document.getElementById('exportQualityVal');
  const exportTransparentBgRow = document.getElementById('exportTransparentBgRow');
  const exportTransparentBgCheck = document.getElementById('exportTransparentBgCheck');
  const exportAnimatedOptionsRow = document.getElementById('exportAnimatedOptionsRow');
  const exportFpsSelect = document.getElementById('exportFpsSelect');
  const exportDurationSelect = document.getElementById('exportDurationSelect');
  const exportBatchScopeSelect = document.getElementById('exportBatchScopeSelect');
  const exportFilenameInput = document.getElementById('exportFilenameInput');
  const exportFilenameExtBadge = document.getElementById('exportFilenameExtBadge');
  const exportSummaryDims = document.getElementById('exportSummaryDims');
  const exportSummaryRatio = document.getElementById('exportSummaryRatio');
  const exportSummaryFormat = document.getElementById('exportSummaryFormat');
  const exportSummarySize = document.getElementById('exportSummarySize');
  const exportMemoryAlert = document.getElementById('exportMemoryAlert');
  const exportProgressContainer = document.getElementById('exportProgressContainer');
  const exportProgressStageText = document.getElementById('exportProgressStageText');
  const exportProgressPercentText = document.getElementById('exportProgressPercentText');
  const exportProgressBarFill = document.getElementById('exportProgressBarFill');
  const btnCancelExportOperation = document.getElementById('btnCancelExportOperation');
  const btnExportCopyClipboard = document.getElementById('btnExportCopyClipboard');
  const btnExportNativeShare = document.getElementById('btnExportNativeShare');
  const btnExportDownloadConfirm = document.getElementById('btnExportDownloadConfirm');

  const btnOpenPrintStudio = document.getElementById('btnOpenPrintStudio');
  const printModal = document.getElementById('printModal');
  const btnClosePrintModal = document.getElementById('btnClosePrintModal');
  const printActivePaperBadge = document.getElementById('printActivePaperBadge');
  const printActiveDpiBadge = document.getElementById('printActiveDpiBadge');
  const printPreviewCanvas = document.getElementById('printPreviewCanvas');
  const printGuideSafeCheck = document.getElementById('printGuideSafeCheck');
  const printGuideTrimCheck = document.getElementById('printGuideTrimCheck');
  const printGuideBleedCheck = document.getElementById('printGuideBleedCheck');
  const printPresetsRibbon = document.getElementById('printPresetsRibbon');
  const printPaperSizeSelect = document.getElementById('printPaperSizeSelect');
  const printCustomDimsRow = document.getElementById('printCustomDimsRow');
  const printCustomWidth = document.getElementById('printCustomWidth');
  const printCustomHeight = document.getElementById('printCustomHeight');
  const printCustomUnit = document.getElementById('printCustomUnit');
  const printDpiSelect = document.getElementById('printDpiSelect');
  const printOrientationSelect = document.getElementById('printOrientationSelect');
  const printLayoutModeSelect = document.getElementById('printLayoutModeSelect');
  const printFitModeRow = document.getElementById('printFitModeRow');
  const printFitModeSelect = document.getElementById('printFitModeSelect');
  const printMarginSelect = document.getElementById('printMarginSelect');
  const printBleedSelect = document.getElementById('printBleedSelect');
  const printPaperColorSelect = document.getElementById('printPaperColorSelect');
  const printBorderStyleSelect = document.getElementById('printBorderStyleSelect');
  const printCopiesInput = document.getElementById('printCopiesInput');
  const printSummaryPhysical = document.getElementById('printSummaryPhysical');
  const printSummaryPixels = document.getElementById('printSummaryPixels');
  const printSummaryMemory = document.getElementById('printSummaryMemory');
  const printQualityWarning = document.getElementById('printQualityWarning');
  const printQualityWarningText = document.getElementById('printQualityWarningText');
  const printMemoryWarning = document.getElementById('printMemoryWarning');
  const btnPrintSaveFile = document.getElementById('btnPrintSaveFile');
  const btnPrintCopyClipboard = document.getElementById('btnPrintCopyClipboard');
  const btnPrintNativeShare = document.getElementById('btnPrintNativeShare');
  const btnPrintExecuteConfirm = document.getElementById('btnPrintExecuteConfirm');

  const pwaConnectivityBadge = document.getElementById('pwaConnectivityBadge');
  const pwaInstallDescription = document.getElementById('pwaInstallDescription');
  const pwaInstallActionContainer = document.getElementById('pwaInstallActionContainer');
  const btnPwaInstallApp = document.getElementById('btnPwaInstallApp');
  const pwaInstalledNotice = document.getElementById('pwaInstalledNotice');
  const pwaIosGuidance = document.getElementById('pwaIosGuidance');
  const pwaUpdateBanner = document.getElementById('pwaUpdateBanner');
  const btnPwaUpdateReload = document.getElementById('btnPwaUpdateReload');
  const btnPwaUpdateDismiss = document.getElementById('btnPwaUpdateDismiss');

  let privacyToastTimeout = null;
  function showPrivacyToast(message, type = 'info', icon = '🔒') {
    if (!privacyToast || !privacyToastText) return;
    if (privacyToastTimeout) clearTimeout(privacyToastTimeout);
    privacyToastText.textContent = message;
    if (privacyToastIcon) privacyToastIcon.textContent = type === 'error' ? '⚠️' : icon;
    privacyToast.className = `privacy-toast active ${type === 'error' ? 'error' : ''}`;
    privacyToastTimeout = setTimeout(() => {
      privacyToast.classList.remove('active');
    }, 3200);
  }

  errorManager.initGlobalHandlers();
  window.__sayCheeseCompat = browserSupport;
  window.__sayCheeseFeedback = feedbackManager;
  window.__sayCheeseEasterEggs = easterEggManager;
  window.__sayCheeseStats = statisticsManager;
  window.__sayCheeseThemes = themeManager;
  easterEggManager.initInteractionListeners();
  themeManager.init();

  let errorToastTimeout = null;

  function showErrorToast(appError) {
    if (!appErrorToast || !appErrorToastText) return;
    if (errorToastTimeout) clearTimeout(errorToastTimeout);

    appErrorToastText.textContent = appError.userMessage || 'An unexpected issue occurred.';
    if (appError.actionLabel && typeof appError.action === 'function' && btnErrorToastAction) {
      btnErrorToastAction.textContent = appError.actionLabel;
      btnErrorToastAction.style.display = 'inline-block';
      btnErrorToastAction.onclick = () => {
        appErrorToast.style.display = 'none';
        try { appError.action(); } catch (e) {}
      };
    } else if (btnErrorToastAction) {
      btnErrorToastAction.style.display = 'none';
    }

    appErrorToast.style.display = 'flex';
    errorToastTimeout = setTimeout(() => {
      appErrorToast.style.display = 'none';
    }, 5000);
  }

  function showErrorDialog(appError) {
    if (!errorModal || !errorModalDesc) return;
    errorModalDesc.textContent = appError.userMessage || 'An unexpected error occurred.';

    if (errorModalTitle) {
      errorModalTitle.textContent = appError.severity === ErrorSeverity.FATAL ? 'Session Recovery Needed' : 'Action Needed';
    }

    if (errorModalTip) {
      if (appError.category === ErrorCategory.PERMISSION) {
        errorModalTip.textContent = 'Tip: Check your browser URL bar for the camera lock icon to grant access.';
        errorModalTip.style.display = 'block';
      } else if (appError.category === ErrorCategory.STORAGE) {
        errorModalTip.textContent = 'Tip: You can export your current photo strip as a PNG file at any time.';
        errorModalTip.style.display = 'block';
      } else {
        errorModalTip.style.display = 'none';
      }
    }

    if (btnErrorModalPrimary) {
      btnErrorModalPrimary.textContent = appError.actionLabel || 'Dismiss';
      btnErrorModalPrimary.onclick = () => {
        closeErrorModal();
        if (typeof appError.action === 'function') {
          try { appError.action(); } catch (e) {}
        }
      };
    }

    if (btnErrorModalSecondary) {
      if (appError.actionLabel && appError.actionLabel !== 'Dismiss') {
        btnErrorModalSecondary.style.display = 'inline-block';
        btnErrorModalSecondary.onclick = closeErrorModal;
      } else {
        btnErrorModalSecondary.style.display = 'none';
      }
    }

    openErrorModal();
  }

  function openErrorModal() {
    if (!errorModal) return;
    errorModal.classList.add('active');
    errorModal.setAttribute('aria-hidden', 'false');
    if (btnErrorModalPrimary) btnErrorModalPrimary.focus();
  }

  function closeErrorModal() {
    if (!errorModal) return;
    errorModal.classList.remove('active');
    errorModal.setAttribute('aria-hidden', 'true');
  }

  if (btnErrorModalClose) {
    btnErrorModalClose.addEventListener('click', closeErrorModal);
  }

  if (btnErrorToastDismiss) {
    btnErrorToastDismiss.addEventListener('click', () => {
      if (appErrorToast) appErrorToast.style.display = 'none';
    });
  }

  errorManager.subscribe((appError) => {
    if (appError.severity === ErrorSeverity.INFO) return;

    if (appError.category === ErrorCategory.PERMISSION || appError.category === ErrorCategory.CAMERA || appError.severity === ErrorSeverity.FATAL) {
      showErrorDialog(appError);
    } else {
      showErrorToast(appError);
    }
  });

  let toastTimeout = null;
  function showHistoryToast(message) {
    if (!historyToast) return;
    clearTimeout(toastTimeout);
    historyToast.textContent = message;
    historyToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      historyToast.classList.remove('show');
    }, 1800);
  }

  historyManager.subscribe(({ canUndo, canRedo, lastAction, direction }) => {
    if (btnUndo) btnUndo.disabled = !canUndo;
    if (btnRedo) btnRedo.disabled = !canRedo;
    if (btnReviewUndo) btnReviewUndo.disabled = !canUndo;
    if (btnReviewRedo) btnReviewRedo.disabled = !canRedo;

    if (direction === 'undo' && lastAction) {
      showHistoryToast(`↶ Undid "${lastAction.description || lastAction.type}"`);
    } else if (direction === 'redo' && lastAction) {
      showHistoryToast(`↷ Redid "${lastAction.description || lastAction.type}"`);
    }
  });

  if (btnUndo) btnUndo.addEventListener('click', () => { soundManager.playButtonClick(); historyManager.undo(); });
  if (btnRedo) btnRedo.addEventListener('click', () => { soundManager.playButtonClick(); historyManager.redo(); });
  if (btnReviewUndo) btnReviewUndo.addEventListener('click', () => { soundManager.playButtonClick(); historyManager.undo(); });
  if (btnReviewRedo) btnReviewRedo.addEventListener('click', () => { soundManager.playButtonClick(); historyManager.redo(); });

  window.addEventListener('keydown', (e) => {

    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const isUndo = (isMac ? e.metaKey : e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z';
    const isRedo = ((isMac ? e.metaKey : e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
                   (!isMac && e.ctrlKey && e.key.toLowerCase() === 'y');

    if (isUndo) {
      e.preventDefault();
      soundManager.playButtonClick();
      historyManager.undo();
      return;
    }

    if (isRedo) {
      e.preventDefault();
      soundManager.playButtonClick();
      historyManager.redo();
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      btnShutter.click();
      return;
    }

    if (currentActiveView === 'booth' && !e.ctrlKey && !e.metaKey) {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        soundManager.playButtonClick();
        const z = cameraManager.zoomIn(0.25);
        updateZoomDisplay(z);
        showHistoryToast(`Zoom: ${z.toFixed(1)}×`);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        soundManager.playButtonClick();
        const z = cameraManager.zoomOut(0.25);
        updateZoomDisplay(z);
        showHistoryToast(`Zoom: ${z.toFixed(1)}×`);
      }
    }
  });

  let currentActiveView = 'booth';

  function switchView(viewName) {
    currentActiveView = viewName;
    [boothSection, reviewSection, collageSection].forEach((sec) => sec.classList.remove('active'));
    document.body.classList.toggle('collage-mode', viewName === 'collage');

    if (viewName === 'booth') {
      stopGifPlaybackLoop();
      boothSection.classList.add('active');
      cameraManager.resumeCamera();
    } else if (viewName === 'review') {
      stopGifPlaybackLoop();
      cameraManager.pauseCamera(); 
      reviewSection.classList.add('active');
      renderReviewDesk();
    } else if (viewName === 'collage') {
      cameraManager.pauseCamera(); 
      collageSection.classList.add('active');
      updateCollagePreview();
      checkAndManageGifPlaybackLoop();
    }
    triggerImmediateAutosaveCheckpoint();
  }

  cameraManager.onStatusChange = ({ status, reason, isSimulated }) => {
    if (status === 'active') {
      if (cameraConsentOverlay) cameraConsentOverlay.style.display = 'none';
      if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'none';
      if (cameraFallbackMsg) cameraFallbackMsg.style.display = 'none';
      if (cameraPrivacyBadge && cameraPrivacyDot && cameraPrivacyText) {
        cameraPrivacyDot.className = 'privacy-dot';
        cameraPrivacyText.textContent = 'Camera Active';
      }
      statusDot.className = 'status-dot';
      statusText.textContent = 'READY';
      keyboardManager.announce('Camera active. Photos processed locally.');
    } else if (status === 'simulated') {
      if (cameraConsentOverlay) cameraConsentOverlay.style.display = 'none';
      if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'none';
      if (cameraFallbackMsg) cameraFallbackMsg.style.display = 'none';
      if (cameraPrivacyBadge && cameraPrivacyDot && cameraPrivacyText) {
        cameraPrivacyDot.className = 'privacy-dot simulated';
        cameraPrivacyText.textContent = 'Camera (Demo)';
      }
      statusDot.className = 'status-dot';
      statusText.textContent = 'DEMO FEED';
      keyboardManager.announce('Simulated camera preview active.');
    } else if (status === 'paused') {
      if (cameraPrivacyBadge && cameraPrivacyDot && cameraPrivacyText) {
        cameraPrivacyDot.className = 'privacy-dot paused';
        cameraPrivacyText.textContent = 'Camera Paused';
      }
    } else if (status === 'denied' || status === 'error') {
      if (cameraConsentOverlay) cameraConsentOverlay.style.display = 'none';
      if (cameraBlockedOverlay) {
        const descEl = document.getElementById('cameraBlockedReason');
        if (descEl && reason) descEl.textContent = reason;
        cameraBlockedOverlay.style.display = 'flex';
      }
      if (cameraPrivacyBadge && cameraPrivacyDot && cameraPrivacyText) {
        cameraPrivacyDot.className = 'privacy-dot paused';
        cameraPrivacyText.textContent = 'Camera Blocked';
      }
      statusDot.className = 'status-dot';
      statusText.textContent = 'BLOCKED';
      keyboardManager.announce('Camera access was blocked. Enable in your browser address bar.');
    }
  };

  if (cameraConsentOverlay) {
    cameraConsentOverlay.style.display = 'none';
  }
  cameraManager.startCamera().then((success) => {
    if (success && cameraConsentOverlay) {
      cameraConsentOverlay.style.display = 'none';
    }
  }).catch((err) => {
    console.warn('Initial camera auto-start notice:', err);
  });

  if (btnAllowCamera) {
    btnAllowCamera.addEventListener('click', async () => {
      soundManager.playButtonClick();
      if (cameraConsentOverlay) cameraConsentOverlay.style.display = 'none';
      const success = await cameraManager.startCamera();
      if (!success && cameraManager.permissionState === 'denied') {
        if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'flex';
      }
    });
  }

  if (btnRetryCameraBlocked) {
    btnRetryCameraBlocked.addEventListener('click', async () => {
      soundManager.playButtonClick();
      if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'none';
      const success = await cameraManager.startCamera();
      if (!success && cameraManager.permissionState === 'denied') {
        if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'flex';
      }
    });
  }

  btnRetryCamera.addEventListener('click', async () => {
    soundManager.playButtonClick();
    await cameraManager.startCamera();
  });

  btnSwitchCamera.addEventListener('click', async () => {
    soundManager.playButtonClick();
    await cameraManager.switchCamera();
  });

  btnSoundToggle.addEventListener('click', () => {
    const isMuted = soundManager.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
    btnSoundToggle.classList.toggle('active', !isMuted);
  });

  let zoomToastTimer = null;
  function updateZoomDisplay(level, showCenterToast = true) {
    const formatted = level.toFixed(1) + '×';
    if (zoomLevelText) zoomLevelText.textContent = formatted;
    if (cameraZoomBadge) {
      if (level > 1.0) {
        const pan = cameraManager.getPan ? cameraManager.getPan() : { panX: 0, panY: 0 };
        const isPanned = Math.abs(pan.panX) > 0.05 || Math.abs(pan.panY) > 0.05;
        cameraZoomBadge.textContent = '🔍 ' + formatted + (isPanned ? ' · ✋ Panned' : '');
        cameraZoomBadge.style.display = 'inline-flex';
        cameraZoomBadge.style.cursor = isPanned ? 'pointer' : 'default';
        cameraZoomBadge.title = isPanned ? 'Click to recenter camera view' : `Zoom level: ${formatted}`;
      } else {
        cameraZoomBadge.style.display = 'none';
      }
    }
    if (btnZoomOut) btnZoomOut.style.opacity = level <= 1.0 ? '0.45' : '1';
    if (btnZoomIn) btnZoomIn.style.opacity = level >= 3.0 ? '0.45' : '1';

    if (showCenterToast && liveZoomIndicator && liveZoomIndicatorText) {
      liveZoomIndicatorText.textContent = `🔍 ${formatted} ZOOM`;
      liveZoomIndicator.style.display = 'block';
      liveZoomIndicator.style.animation = 'none';
      void liveZoomIndicator.offsetWidth;
      liveZoomIndicator.style.animation = 'zoomPopAnim 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';

      clearTimeout(zoomToastTimer);
      zoomToastTimer = setTimeout(() => {
        if (liveZoomIndicator) liveZoomIndicator.style.display = 'none';
      }, 900);
    }
  }

  if (cameraZoomBadge) {
    cameraZoomBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      if (cameraManager.resetPan) {
        cameraManager.resetPan();
        updateZoomDisplay(cameraManager.getZoom(), false);
        showHistoryToast('Centered Live View 🎯');
      }
    });
  }

  if (btnZoomIn) {
    btnZoomIn.addEventListener('click', () => {
      soundManager.playButtonClick();
      const z = cameraManager.zoomIn(0.2);
      updateZoomDisplay(z);
      showHistoryToast(`Zoom: ${z.toFixed(1)}×`);
    });
  }

  if (btnZoomOut) {
    btnZoomOut.addEventListener('click', () => {
      soundManager.playButtonClick();
      const z = cameraManager.zoomOut(0.2);
      updateZoomDisplay(z);
      showHistoryToast(`Zoom: ${z.toFixed(1)}×`);
    });
  }

  let isViewfinderPanning = false;
  let viewfinderPanStartX = 0;
  let viewfinderPanStartY = 0;
  let viewfinderPanMoved = false;
  let justFinishedPanDrag = false;
  let activePinchDist = null;
  let initialPinchZoom = 1.0;

  if (viewfinderWrapper) {
    viewfinderWrapper.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.camera-consent-overlay') || e.target.closest('.camera-blocked-overlay')) {
        return;
      }
      if (cameraManager.getZoom && cameraManager.getZoom() > 1.0) {
        isViewfinderPanning = true;
        viewfinderPanStartX = e.clientX;
        viewfinderPanStartY = e.clientY;
        viewfinderPanMoved = false;
        viewfinderWrapper.classList.add('is-dragging-pan');
        try {
          if (viewfinderWrapper.setPointerCapture) {
            viewfinderWrapper.setPointerCapture(e.pointerId);
          }
        } catch (_) {}
      }
    });

    viewfinderWrapper.addEventListener('pointermove', (e) => {
      if (!isViewfinderPanning) return;
      const dx = e.clientX - viewfinderPanStartX;
      const dy = e.clientY - viewfinderPanStartY;
      if (Math.hypot(dx, dy) > 4) {
        viewfinderPanMoved = true;
      }
      viewfinderPanStartX = e.clientX;
      viewfinderPanStartY = e.clientY;
      if (cameraManager.panByPixels) {
        cameraManager.panByPixels(dx, dy, viewfinderWrapper.clientWidth, viewfinderWrapper.clientHeight);
        updateZoomDisplay(cameraManager.getZoom(), false);
      }
    });

    const endPan = (e) => {
      if (!isViewfinderPanning) return;
      isViewfinderPanning = false;
      viewfinderWrapper.classList.remove('is-dragging-pan');
      try {
        if (e && e.pointerId && viewfinderWrapper.releasePointerCapture) {
          viewfinderWrapper.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}
      if (viewfinderPanMoved) {
        justFinishedPanDrag = true;
        setTimeout(() => { justFinishedPanDrag = false; }, 160);
      }
    };

    viewfinderWrapper.addEventListener('pointerup', endPan);
    viewfinderWrapper.addEventListener('pointercancel', endPan);

    viewfinderWrapper.addEventListener('dblclick', (e) => {
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;
      if (cameraManager.getZoom && cameraManager.getZoom() > 1.0) {
        e.preventDefault();
        e.stopPropagation();
        if (cameraManager.resetPan) {
          cameraManager.resetPan();
          updateZoomDisplay(cameraManager.getZoom(), false);
          showHistoryToast('Centered Live View 🎯');
        }
      }
    });

    viewfinderWrapper.addEventListener('wheel', (e) => {
      if (e.target.closest('.modes-scroll-container') || e.target.closest('.filter-tray')) return;
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.2 : -0.2;
      const nextZ = delta > 0 ? cameraManager.zoomIn(0.2) : cameraManager.zoomOut(0.2);
      updateZoomDisplay(nextZ);
    }, { passive: false });

    viewfinderWrapper.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        activePinchDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        initialPinchZoom = cameraManager.getZoom ? cameraManager.getZoom() : 1.0;
      }
    }, { passive: true });

    viewfinderWrapper.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 2 && activePinchDist) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const scale = curDist / activePinchDist;
        const targetZoom = Math.min(Math.max(initialPinchZoom * scale, 1.0), 3.0);
        if (cameraManager.setZoom) {
          const z = cameraManager.setZoom(targetZoom);
          updateZoomDisplay(z, false);
        }
      }
    }, { passive: true });

    viewfinderWrapper.addEventListener('touchend', (e) => {
      if (!e.touches || e.touches.length < 2) {
        activePinchDist = null;
      }
    }, { passive: true });
  }

  async function handleUserUploadedPhotos(files) {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter(f => f.type.startsWith('image/') || /\.(png|jpe?g|webp|avif|gif|bmp|heic)$/i.test(f.name));
    if (fileList.length === 0) {
      feedbackManager.showToast('Please select valid image files (JPG, PNG, WebP, etc.).', { type: 'warning' });
      return;
    }

    feedbackManager.showToast(`Loading ${fileList.length} image${fileList.length > 1 ? 's' : ''}... ⏳`, { type: 'info', duration: 1800 });

    const loadedPhotos = [];

    for (const file of fileList) {
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('Failed to read image file'));
          reader.readAsDataURL(file);
        });

        const imgDim = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve({ width: img.naturalWidth || 1200, height: img.naturalHeight || 960 });
          img.onerror = () => resolve({ width: 1200, height: 960 });
          img.src = dataUrl;
        });

        loadedPhotos.push({
          imageData: dataUrl,
          width: imgDim.width,
          height: imgDim.height,
          timestamp: Date.now(),
        });
      } catch (err) {
        console.warn('Error reading photo upload:', err);
      }
    }

    if (loadedPhotos.length === 0) {
      feedbackManager.showToast('Unable to load the selected images.', { type: 'error' });
      return;
    }

    for (const p of loadedPhotos) {
      photoManager.addPhoto(p);
    }

    photoManager.setTargetCount(Math.max(photoManager.photos.length, 2));

    soundManager.playButtonClick();
    easterEggManager.onSessionCompleted();

    switchView('review');
    renderReviewDesk();
    if (collageSection.classList.contains('active')) {
      updateCollagePreview();
    }

    feedbackManager.showToast(`✨ ${loadedPhotos.length} photo${loadedPhotos.length > 1 ? 's' : ''} added! Ready to build your strip 📸`, { type: 'success', duration: 3500 });
    showHistoryToast(`Loaded ${loadedPhotos.length} uploaded photo${loadedPhotos.length > 1 ? 's' : ''}`);

    storageManager.saveSession('latest_session', photoManager.getAll());
    preferenceManager.recordSession({
      photoCount: photoManager.targetCount,
      countdown: 0,
      funMode: sessionManager.currentMode?.id || 'classic',
      layout: collageRenderer.settings.layoutId || 'vertical-strip',
      filter: collageRenderer.settings.filter || 'warm-vintage',
      frameColor: collageRenderer.settings.backgroundColor || '#FAF6EE',
    });
  }

  if (btnUploadPhotos && uploadPhotosInput) {
    btnUploadPhotos.addEventListener('click', () => {
      soundManager.playButtonClick();
      uploadPhotosInput.click();
    });

    uploadPhotosInput.addEventListener('change', async (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await handleUserUploadedPhotos(files);
      }
      uploadPhotosInput.value = '';
    });
  }

  if (viewfinderWrapper) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      viewfinderWrapper.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        viewfinderWrapper.classList.add('is-drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      viewfinderWrapper.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        viewfinderWrapper.classList.remove('is-drag-over');
      }, false);
    });

    viewfinderWrapper.addEventListener('drop', async (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        await handleUserUploadedPhotos(dt.files);
      }
    });
  }

  const posePromptBanner = document.getElementById('posePromptBanner');
  const posePromptText = document.getElementById('posePromptText');

  sessionManager.onPosePrompt = (promptText, photoIndex) => {
    if (posePromptBanner && posePromptText) {
      posePromptText.textContent = promptText;
      posePromptBanner.style.display = 'flex';
    }
  };

  sessionManager.onMysteryReveal = (revealedText) => {
    if (posePromptBanner && posePromptText) {
      posePromptText.textContent = `✨ REVEAL: ${revealedText}`;
      posePromptBanner.style.display = 'flex';
    }
  };

  sessionManager.onFreezeCue = (isFrozen) => {
    if (posePromptBanner && posePromptText) {
      posePromptText.textContent = isFrozen ? '🧊 FREEZE! HOLD STILL!' : 'MOVE AROUND... 🏃';
      posePromptBanner.style.display = 'flex';
    }
  };

  sessionManager.onCountdownTick = (remainingSeconds) => {
    mobileManager.hapticCountdownTick();
    if (remainingSeconds > 0) {
      countdownOverlay.classList.add('active');
      countdownNumber.textContent = remainingSeconds;
      countdownNumber.classList.remove('tick-pop');
      void countdownNumber.offsetWidth; 
      countdownNumber.classList.add('tick-pop');
      statusDot.className = 'status-dot capturing';
      statusText.textContent = `COUNTDOWN ${remainingSeconds}S`;
    } else {
      countdownOverlay.classList.remove('active');
      countdownNumber.classList.remove('tick-pop');
      statusDot.className = 'status-dot capturing';
      statusText.textContent = 'SMILE! 📸';
    }
  };

  sessionManager.onFlashTrigger = () => {
    mobileManager.hapticShutterSnap();
    countdownOverlay.classList.remove('active');
    if (posePromptBanner) posePromptBanner.style.display = 'none';
    flashLayer.classList.remove('flashing');
    void flashLayer.offsetWidth; 
    flashLayer.classList.add('flashing');
  };

  sessionManager.onPhotoCaptured = (index, frameData) => {
    const slot = document.getElementById(`sideSlot${index}`);
    if (slot) {
      slot.classList.add('developing');
      slot.innerHTML = `<img src="${frameData}" alt="Photo ${index + 1}" />`;
      setTimeout(() => slot.classList.remove('developing'), 700);
    }
    statisticsManager.recordCapture();
    easterEggManager.onPhotoCaptured();
  };

  sessionManager.onStateChange = (state, { currentCount, targetCount, retakeIndex, isPaused, prompt, triggerMode }) => {
    updateMeterDots(currentCount, targetCount, retakeIndex);

    const isVoice = triggerMode === 'voice' || sessionManager.triggerMode === 'voice';

    if (state === 'idle') {
      countdownOverlay.classList.remove('active');
      if (voiceModeOverlay) voiceModeOverlay.style.display = 'none';
      if (posePromptBanner) posePromptBanner.style.display = 'none';
      statusDot.className = 'status-dot';
      statusText.textContent = 'READY';
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'CAMERA';
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'VOICE';
      if (btnShutterCamera) btnShutterCamera.disabled = false;
      if (btnShutterVoice) {
        btnShutterVoice.disabled = false;
        btnShutterVoice.classList.remove('listening');
      }
      retakeModeLabel.style.display = 'none';
    } else if (state === 'starting' || state === 'ready') {
      if (retakeIndex >= 0) {
        statisticsManager.recordRetake();
      } else {
        collageRenderer.clearStickers();
        collageRenderer.settings.slotTransforms = {};
        if (!statisticsManager.currentSession || statisticsManager.currentSession.isCompleted) {
          statisticsManager.startSession({
            mode: sessionManager.currentMode.id,
            modeName: sessionManager.currentMode.name,
            targetCount: photoManager.targetCount,
            countdown: isVoice ? 0 : sessionManager.countdownSeconds,
          });
        }
      }
      if (btnShutterCamera) btnShutterCamera.disabled = true;
      if (btnShutterVoice) btnShutterVoice.disabled = true;

      if (isVoice) {
        if (voiceModeOverlay) {
          voiceModeOverlay.style.display = 'flex';
          voiceModeOverlay.classList.remove('trigger-detected');
          if (voiceHudTitle) voiceHudTitle.textContent = 'Preparing Voice Mode... 🎙️';
          if (voiceHudProgress) voiceHudProgress.textContent = `Target: ${photoManager.targetCount} Photos`;
        }
        if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'STARTING...';
        if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'CAMERA';
      } else {
        if (voiceModeOverlay) voiceModeOverlay.style.display = 'none';
        if (shutterCameraBtnText) shutterCameraBtnText.textContent = retakeIndex >= 0 ? 'RETAKING...' : 'GET READY...';
        if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'VOICE';
      }
      retakeModeLabel.style.display = retakeIndex >= 0 ? 'inline-block' : 'none';
    } else if (state === 'listening') {
      countdownOverlay.classList.remove('active');
      statusDot.className = 'status-dot active';
      statusText.textContent = 'LISTENING 🎙️';
      if (voiceModeOverlay) {
        voiceModeOverlay.style.display = 'flex';
        voiceModeOverlay.classList.remove('trigger-detected');
        if (voiceHudTitle) voiceHudTitle.textContent = 'Say "Say Cheese" 📸';
        if (voiceHudProgress) voiceHudProgress.textContent = `Shot ${currentCount + 1} of ${targetCount}`;
      }
      if (btnShutterVoice) {
        btnShutterVoice.disabled = false;
        btnShutterVoice.classList.add('listening');
      }
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'LISTENING...';
      if (btnShutterCamera) btnShutterCamera.disabled = false;
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'SNAP';
    } else if (state === 'triggered') {
      statusText.textContent = 'CHEESE! 🧀';
      if (voiceModeOverlay) {
        voiceModeOverlay.classList.add('trigger-detected');
        if (voiceHudTitle) voiceHudTitle.textContent = '🧀 CHEESE! Snapping...';
      }
      if (btnShutterVoice) {
        btnShutterVoice.classList.remove('listening');
      }
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'CHEESE! 📸';
    } else if (state === 'prompt') {
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'READY...';
      if (btnShutterCamera) btnShutterCamera.disabled = false;
    } else if (state === 'countdown') {
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'SNAP NOW';
      if (btnShutterCamera) btnShutterCamera.disabled = false;
    } else if (state === 'capturing') {
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'CAPTURING...';
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'CAPTURING...';
      if (btnShutterCamera) btnShutterCamera.disabled = true;
      if (btnShutterVoice) btnShutterVoice.disabled = true;
    } else if (state === 'captured') {
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = '✓ SAVED';
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = '✓ SAVED';
      if (btnShutterCamera) btnShutterCamera.disabled = true;
      if (btnShutterVoice) btnShutterVoice.disabled = true;
    } else if (state === 'paused') {
      countdownOverlay.classList.remove('active');
      if (voiceModeOverlay) voiceModeOverlay.style.display = 'none';
      statusText.textContent = 'PAUSED';
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'RESUME';
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'RESUME';
      if (btnShutterCamera) btnShutterCamera.disabled = false;
      if (btnShutterVoice) {
        btnShutterVoice.disabled = false;
        btnShutterVoice.classList.remove('listening');
      }
    } else if (state === 'review') {
      mobileManager.hapticSuccess();
      easterEggManager.onSessionCompleted();
      countdownOverlay.classList.remove('active');
      if (voiceModeOverlay) voiceModeOverlay.style.display = 'none';
      if (posePromptBanner) posePromptBanner.style.display = 'none';
      statusDot.className = 'status-dot';
      statusText.textContent = 'REVIEW';
      if (btnShutterVoice) btnShutterVoice.classList.remove('listening');
      if (shutterCameraBtnText) shutterCameraBtnText.textContent = 'CAMERA';
      if (shutterVoiceBtnText) shutterVoiceBtnText.textContent = 'VOICE';
      switchView('review');
      storageManager.saveSession('latest_session', photoManager.getAll());
      preferenceManager.recordSession({
        photoCount: photoManager.targetCount,
        countdown: isVoice ? 0 : sessionManager.countdownSeconds,
        funMode: sessionManager.currentMode.id,
        layout: collageRenderer.settings.layoutId || 'vertical-strip',
        filter: collageRenderer.settings.filter || 'warm-vintage',
        frameColor: collageRenderer.settings.backgroundColor || '#FAF6EE',
      });

      const reviewSub = document.getElementById('reviewSubtitle');
      if (reviewSub) {
        reviewSub.textContent = sessionManager.currentMode.completionMessage || preferenceManager.getMessages().sessionDone || 'Retake any photo, delete unwanted shots, or reorder before building your strip.';
      }

      renderSessionSummaryCard();
    }
  };

  async function ensureCameraActiveForSession() {
    if (!cameraManager.isCameraActive) {
      if (cameraConsentOverlay) cameraConsentOverlay.style.display = 'none';
      const success = await cameraManager.startCamera();
      if (!success && cameraManager.permissionState === 'denied') {
        if (cameraBlockedOverlay) cameraBlockedOverlay.style.display = 'flex';
        return false;
      }
    }
    return true;
  }

  if (btnShutterCamera) {
    btnShutterCamera.addEventListener('click', async () => {
      if (!mobileManager.canTriggerShutter()) return;
      soundManager.playButtonClick();
      mobileManager.hapticTap();

      const cameraReady = await ensureCameraActiveForSession();
      if (!cameraReady) return;

      if (sessionManager.state === 'idle') {
        sessionManager.startSession({ triggerMode: 'camera' });
      } else if (sessionManager.state === 'paused') {
        sessionManager.resumeSession();
      } else if (sessionManager.state === 'countdown' || sessionManager.state === 'prompt' || sessionManager.state === 'listening') {
        sessionManager.snapImmediately();
      }
    });
  }

  if (viewfinderWrapper) {
    viewfinderWrapper.addEventListener('click', (e) => {
      if (justFinishedPanDrag) return;
      if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('.camera-consent-overlay') || e.target.closest('.camera-blocked-overlay') || e.target.closest('.live-zoom-indicator')) {
        return;
      }
      if (btnShutterCamera && !btnShutterCamera.disabled) {
        btnShutterCamera.click();
      }
    });
  }

  if (btnShutterVoice) {
    btnShutterVoice.addEventListener('click', async () => {
      if (!mobileManager.canTriggerShutter()) return;
      soundManager.playButtonClick();
      mobileManager.hapticTap();

      if (!voiceTriggerManager.checkSupport()) {
        feedbackManager.showToast('Voice recognition is not supported in this browser. You can use Camera mode or Chrome/Edge.', { type: 'warning', duration: 4000 });
        return;
      }

      const cameraReady = await ensureCameraActiveForSession();
      if (!cameraReady) return;

      try {
        await voiceTriggerManager.requestPermission();
      } catch (err) {
        if (err.code === 'PERMISSION_DENIED') {
          feedbackManager.showToast('Microphone access was denied. Please allow microphone permissions to use Voice Mode.', { type: 'error', duration: 4000 });
        } else {
          feedbackManager.showToast('Microphone is unavailable for Voice Mode. Camera mode is still available.', { type: 'error', duration: 3500 });
        }
        return;
      }

      if (sessionManager.state === 'idle') {
        sessionManager.startSession({ triggerMode: 'voice' });
      } else if (sessionManager.state === 'paused') {
        sessionManager.resumeSession();
      } else if (sessionManager.state === 'listening') {
        sessionManager.snapImmediately();
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (sessionManager.state === 'countdown' || sessionManager.state === 'prompt' || sessionManager.state === 'starting') {
        sessionManager.pauseSession();
      }
      cameraManager.pauseCamera();
    } else {
      if (boothSection.classList.contains('active')) {
        cameraManager.resumeCamera();
      }
    }
  });

  const btnCustomTargetShots = document.getElementById('btnCustomTargetShots');
  const customShotsModal = document.getElementById('customShotsModal');
  const modalCustomShotsInput = document.getElementById('modalCustomShotsInput');
  const modalCustomShotsError = document.getElementById('modalCustomShotsError');
  const btnCancelCustomShots = document.getElementById('btnCancelCustomShots');
  const btnCloseCustomShotsModal = document.getElementById('btnCloseCustomShotsModal');
  const btnConfirmCustomShots = document.getElementById('btnConfirmCustomShots');

  const btnCustomCountdown = document.getElementById('btnCustomCountdown');
  const customCountdownModal = document.getElementById('customCountdownModal');
  const modalCustomCountdownInput = document.getElementById('modalCustomCountdownInput');
  const modalCustomCountdownError = document.getElementById('modalCustomCountdownError');
  const btnCancelCustomCountdown = document.getElementById('btnCancelCustomCountdown');
  const btnCloseCustomCountdownModal = document.getElementById('btnCloseCustomCountdownModal');
  const btnConfirmCustomCountdown = document.getElementById('btnConfirmCustomCountdown');

  let currentCustomShots = 8;
  let currentCustomCountdown = 5;

  function openCustomShotsModal() {
    if (!customShotsModal) return;
    if (modalCustomShotsInput) {
      modalCustomShotsInput.value = currentCustomShots;
    }
    if (modalCustomShotsError) {
      modalCustomShotsError.textContent = '';
      modalCustomShotsError.style.display = 'none';
    }
    customShotsModal.classList.add('active', 'open');
    customShotsModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      if (modalCustomShotsInput) {
        modalCustomShotsInput.focus();
        modalCustomShotsInput.select();
      }
    }, 50);
  }

  function closeCustomShotsModal() {
    if (!customShotsModal) return;
    customShotsModal.classList.remove('active', 'open');
    customShotsModal.setAttribute('aria-hidden', 'true');
    if (btnCustomTargetShots) btnCustomTargetShots.focus();
  }

  function confirmCustomShots() {
    if (!modalCustomShotsInput) return;
    const rawVal = modalCustomShotsInput.value.trim();
    const val = Number.parseInt(rawVal, 10);
    if (!Number.isInteger(val) || val < 1 || val > 30 || String(val) !== rawVal) {
      if (modalCustomShotsError) {
        modalCustomShotsError.textContent = 'Please enter a whole number between 1 and 30.';
        modalCustomShotsError.style.display = 'block';
      }
      modalCustomShotsInput.focus();
      return;
    }

    currentCustomShots = val;
    setBoothPhotoCount(val);
    closeCustomShotsModal();
    soundManager.playButtonClick();
  }

  function openCustomCountdownModal() {
    if (!customCountdownModal) return;
    if (modalCustomCountdownInput) {
      modalCustomCountdownInput.value = currentCustomCountdown;
    }
    if (modalCustomCountdownError) {
      modalCustomCountdownError.textContent = '';
      modalCustomCountdownError.style.display = 'none';
    }
    customCountdownModal.classList.add('active', 'open');
    customCountdownModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      if (modalCustomCountdownInput) {
        modalCustomCountdownInput.focus();
        modalCustomCountdownInput.select();
      }
    }, 50);
  }

  function closeCustomCountdownModal() {
    if (!customCountdownModal) return;
    customCountdownModal.classList.remove('active', 'open');
    customCountdownModal.setAttribute('aria-hidden', 'true');
    if (btnCustomCountdown) btnCustomCountdown.focus();
  }

  function confirmCustomCountdown() {
    if (!modalCustomCountdownInput) return;
    const rawVal = modalCustomCountdownInput.value.trim();
    const val = Number.parseInt(rawVal, 10);
    if (!Number.isInteger(val) || val < 1 || val > 60 || String(val) !== rawVal) {
      if (modalCustomCountdownError) {
        modalCustomCountdownError.textContent = 'Please enter a whole number between 1 and 60 seconds.';
        modalCustomCountdownError.style.display = 'block';
      }
      modalCustomCountdownInput.focus();
      return;
    }

    currentCustomCountdown = val;
    setBoothCountdown(val);
    closeCustomCountdownModal();
    soundManager.playButtonClick();
  }

  document.getElementById('targetCountGroup').addEventListener('click', (e) => {
    const btn = e.target.closest('.pill-btn');
    if (!btn || sessionManager.state !== 'idle') return;
    soundManager.playButtonClick();

    if (btn.dataset.count === 'custom') {
      openCustomShotsModal();
    } else {
      const count = parseInt(btn.dataset.count, 10);
      setBoothPhotoCount(count);
    }
  });

  if (btnCancelCustomShots) btnCancelCustomShots.addEventListener('click', closeCustomShotsModal);
  if (btnCloseCustomShotsModal) btnCloseCustomShotsModal.addEventListener('click', closeCustomShotsModal);
  if (btnConfirmCustomShots) btnConfirmCustomShots.addEventListener('click', confirmCustomShots);
  if (modalCustomShotsInput) {
    modalCustomShotsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmCustomShots();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCustomShotsModal();
      }
    });
  }

  const countdownSecGroup = document.getElementById('countdownSecGroup');
  if (countdownSecGroup) {
    countdownSecGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();

      if (btn.dataset.seconds === 'custom') {
        openCustomCountdownModal();
      } else {
        setBoothCountdown(parseInt(btn.dataset.seconds, 10));
      }
    });
  }

  if (btnCancelCustomCountdown) btnCancelCustomCountdown.addEventListener('click', closeCustomCountdownModal);
  if (btnCloseCustomCountdownModal) btnCloseCustomCountdownModal.addEventListener('click', closeCustomCountdownModal);
  if (btnConfirmCustomCountdown) btnConfirmCustomCountdown.addEventListener('click', confirmCustomCountdown);
  if (modalCustomCountdownInput) {
    modalCustomCountdownInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmCustomCountdown();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeCustomCountdownModal();
      }
    });
  }

  if (btnCustomTargetShots) {
    btnCustomTargetShots.addEventListener('click', (e) => {
      e.stopPropagation();
      openCustomShotsModal();
    });
  }

  if (btnCustomCountdown) {
    btnCustomCountdown.addEventListener('click', (e) => {
      e.stopPropagation();
      openCustomCountdownModal();
    });
  }

  if (customShotsModal) {
    customShotsModal.addEventListener('click', (e) => {
      if (e.target === customShotsModal) {
        closeCustomShotsModal();
      }
    });
  }

  if (customCountdownModal) {
    customCountdownModal.addEventListener('click', (e) => {
      if (e.target === customCountdownModal) {
        closeCustomCountdownModal();
      }
    });
  }

  const posePromptGroup = document.getElementById('posePromptGroup');
  if (posePromptGroup) {
    posePromptGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#posePromptGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sessionManager.setPosePromptMode(btn.dataset.mode);
    });
  }

  const collageFilterTray = document.getElementById('collageFilterTray');
  const filterIntensitySlider = document.getElementById('filterIntensitySlider');
  const filterIntensityValText = document.getElementById('filterIntensityValText');
  const btnSurpriseFilter = document.getElementById('btnSurpriseFilter');

  function applyVideoFilter(filterName, intensity = 80) {
    if (videoEl) {
      videoEl.style.filter = getFilterCSS(filterName, intensity);
    }
  }

  async function setAppFilter(filterId, intensity = null, pushHistory = true) {
    const prevFilter = collageRenderer.settings.filter;
    const prevIntensity = collageRenderer.settings.filterIntensity || 80;
    const targetIntensity = intensity !== null ? intensity : (FILTER_PRESETS[filterId]?.defaultIntensity || 80);

    const apply = async (fId, inten) => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === fId));
      photoManager.setFilter(fId);
      collageRenderer.updateSettings({ filter: fId, filterIntensity: inten });

      const activeChip = document.querySelector(`.filter-chip[data-filter="${fId}"]`);
      if (activeChip && activeFilterBadge) {
        activeFilterBadge.textContent = activeChip.textContent.toUpperCase();
      }

      if (filterIntensitySlider) filterIntensitySlider.value = inten;
      if (filterIntensityValText) filterIntensityValText.textContent = `${inten}%`;

      applyVideoFilter(fId, inten);
      if (collageSection.classList.contains('active')) {
        await updateCollagePreview();
      }
    };

    await apply(filterId, targetIntensity);

    if (pushHistory && (prevFilter !== filterId || prevIntensity !== targetIntensity)) {
      historyManager.push({
        type: 'filter-change',
        description: `Applied ${FILTER_PRESETS[filterId]?.name || filterId} filter`,
        undo: async () => apply(prevFilter, prevIntensity),
        redo: async () => apply(filterId, targetIntensity),
      });
    }
  }

  if (filterTray) {
    filterTray.addEventListener('click', async (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      soundManager.playButtonClick();
      await setAppFilter(chip.dataset.filter);
    });
  }

  if (collageFilterTray) {
    collageFilterTray.addEventListener('click', async (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      soundManager.playButtonClick();
      await setAppFilter(chip.dataset.filter);
    });
  }

  if (btnSurpriseFilter) {
    btnSurpriseFilter.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const randomFilter = randomizerEngine.generateFilterSurprise();
      await setAppFilter(randomFilter);
      showHistoryToast(`🎨 Surprise Filter: ${FILTER_PRESETS[randomFilter]?.name || randomFilter}`);
    });
  }

  let filterIntensityBefore = collageRenderer.settings.filterIntensity || 80;
  if (filterIntensitySlider) {
    filterIntensitySlider.addEventListener('focus', () => {
      filterIntensityBefore = parseInt(filterIntensitySlider.value, 10);
    });

    filterIntensitySlider.addEventListener('input', async (e) => {
      const val = parseInt(e.target.value, 10);
      if (filterIntensityValText) filterIntensityValText.textContent = `${val}%`;
      collageRenderer.updateSettings({ filterIntensity: val });
      applyVideoFilter(collageRenderer.settings.filter, val);
      if (collageSection.classList.contains('active')) {
        await updateCollagePreview();
      }
    });

    filterIntensitySlider.addEventListener('change', (e) => {
      const valAfter = parseInt(e.target.value, 10);
      const valBefore = filterIntensityBefore;
      if (valBefore === valAfter) return;

      const curFilter = collageRenderer.settings.filter;
      historyManager.push({
        type: 'filter-intensity',
        description: `Adjusted filter intensity (${valAfter}%)`,
        undo: async () => {
          if (filterIntensitySlider) filterIntensitySlider.value = valBefore;
          if (filterIntensityValText) filterIntensityValText.textContent = `${valBefore}%`;
          collageRenderer.updateSettings({ filterIntensity: valBefore });
          applyVideoFilter(curFilter, valBefore);
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
        redo: async () => {
          if (filterIntensitySlider) filterIntensitySlider.value = valAfter;
          if (filterIntensityValText) filterIntensityValText.textContent = `${valAfter}%`;
          collageRenderer.updateSettings({ filterIntensity: valAfter });
          applyVideoFilter(curFilter, valAfter);
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
      });
      filterIntensityBefore = valAfter;
    });
  }

  function updateMeterDots(current, target, retakeIdx) {
    const curNum = String(Math.min(current + 1, target)).padStart(2, '0');
    const totNum = String(target).padStart(2, '0');
    sessionCounterText.textContent = `PHOTO ${curNum} / ${totNum}`;
    meterDotsContainer.innerHTML = '';

    for (let i = 0; i < target; i++) {
      const dot = document.createElement('span');
      dot.className = 'meter-dot';
      if (i < current) {
        dot.classList.add('filled');
      } else if (i === current || (retakeIdx >= 0 && i === retakeIdx)) {
        dot.classList.add('current');
      }
      meterDotsContainer.appendChild(dot);
    }

    const sideDock = document.getElementById('sideStripDock');
    const photos = photoManager.getAll();
    if (sideDock) {
      const currentSlots = sideDock.querySelectorAll('.side-photo-slot');
      if (currentSlots.length !== target) {
        const footer = sideDock.querySelector('.side-strip-footer');
        sideDock.innerHTML = '';
        for (let i = 0; i < target; i++) {
          const s = document.createElement('div');
          s.className = 'side-photo-slot';
          s.id = `sideSlot${i}`;
          sideDock.appendChild(s);
        }
        if (footer) sideDock.appendChild(footer);
        else {
          const f = document.createElement('div');
          f.className = 'side-strip-footer';
          f.textContent = 'SNAP PREVIEW';
          sideDock.appendChild(f);
        }
      }

      for (let i = 0; i < target; i++) {
        const slot = document.getElementById(`sideSlot${i}`);
        if (slot) {
          if (photos[i]) {
            slot.innerHTML = `<img src="${photos[i].imageData}" alt="Photo ${i + 1}" />`;
          } else {
            slot.innerHTML = '';
          }
        }
      }
    }
  }

  photoManager.subscribe((photos, target) => {
    updateMeterDots(photos.length, target, sessionManager.retakeIndex);
    triggerImmediateAutosaveCheckpoint();
  });

  function renderReviewDesk() {
    const photos = photoManager.getAll();
    photoDeskGrid.innerHTML = '';
    photoDeskGrid.dataset.count = photos.length;

    if (photos.length === 0) {
      photoDeskGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding:40px; color: var(--color-charcoal-subtle);">No photos taken yet. Start a session!</p>`;
      return;
    }

    photos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.className = 'photo-card';

      card.innerHTML = `
        <div class="photo-card-frame">
          <img src="${photo.imageData}" class="photo-card-img" alt="Snap ${index + 1}" />
          <span class="photo-badge">#${index + 1}</span>
        </div>
        <div class="photo-card-actions">
          <div class="reorder-btns">
            <button class="card-action-btn" data-action="move-left" data-index="${index}" ${index === 0 ? 'disabled' : ''} title="Move Earlier">◀</button>
            <button class="card-action-btn" data-action="move-right" data-index="${index}" ${index === photos.length - 1 ? 'disabled' : ''} title="Move Later">▶</button>
          </div>
          <button class="card-action-btn retake" data-action="retake" data-index="${index}" title="Retake this photo">↺ Retake</button>
          <button class="card-action-btn delete" data-action="delete" data-index="${index}" title="Delete this photo">✕</button>
        </div>
      `;

      photoDeskGrid.appendChild(card);
    });
  }

  photoDeskGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.card-action-btn');
    if (!btn) return;
    soundManager.playButtonClick();

    const action = btn.dataset.action;
    const index = parseInt(btn.dataset.index, 10);

    if (action === 'retake') {
      switchView('booth');
      sessionManager.startRetake(index);
    } else if (action === 'delete') {
      const photos = photoManager.getAll();
      const deletedPhoto = photos[index];
      if (!deletedPhoto) return;

      photoManager.deletePhoto(index);
      renderReviewDesk();
      if (collageSection.classList.contains('active')) updateCollagePreview();

      historyManager.push({
        type: 'photo-delete',
        description: 'Deleted photo',
        undo: async () => {
          photoManager.insertPhotoAt(index, deletedPhoto);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
        redo: async () => {
          photoManager.deletePhoto(index);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
      });
    } else if (action === 'move-left' && index > 0) {
      photoManager.reorderPhoto(index, index - 1);
      renderReviewDesk();
      if (collageSection.classList.contains('active')) updateCollagePreview();

      historyManager.push({
        type: 'photo-reorder',
        description: 'Reordered photos',
        undo: async () => {
          photoManager.reorderPhoto(index - 1, index);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
        redo: async () => {
          photoManager.reorderPhoto(index, index - 1);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
      });
    } else if (action === 'move-right' && index < photoManager.count - 1) {
      photoManager.reorderPhoto(index, index + 1);
      renderReviewDesk();
      if (collageSection.classList.contains('active')) updateCollagePreview();

      historyManager.push({
        type: 'photo-reorder',
        description: 'Reordered photos',
        undo: async () => {
          photoManager.reorderPhoto(index + 1, index);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
        redo: async () => {
          photoManager.reorderPhoto(index, index + 1);
          renderReviewDesk();
          if (collageSection.classList.contains('active')) await updateCollagePreview();
        },
      });
    }
  });

  btnRestartSession.addEventListener('click', () => {
    soundManager.playButtonClick();
    historyManager.clear();
    collageRenderer.clearStickers();
    collageRenderer.settings.slotTransforms = {};
    switchView('booth');
    sessionManager.startSession();
  });

  btnProceedToCollage.addEventListener('click', () => {
    soundManager.playButtonClick();
    switchView('collage');
  });

  const canvasContainer = document.getElementById('canvasContainer');
  const canvasStickersLayer = document.getElementById('canvasStickersLayer');
  const activeStampsList = document.getElementById('activeStampsList');
  const activeStampsCountLabel = document.getElementById('activeStampsCountLabel');
  const btnClearStamps = document.getElementById('btnClearStamps');

  const stickerPackTabs = document.getElementById('stickerPackTabs');
  const stickerSearchInput = document.getElementById('stickerSearchInput');
  const btnSurpriseSticker = document.getElementById('btnSurpriseSticker');

  const stickerInspector = document.getElementById('stickerInspector');
  const inspectorTitle = document.getElementById('inspectorTitle');
  const btnInspectorFav = document.getElementById('btnInspectorFav');
  const btnInspectorDeselect = document.getElementById('btnInspectorDeselect');
  const btnFlipH = document.getElementById('btnFlipH');
  const btnFlipV = document.getElementById('btnFlipV');
  const btnDuplicateSticker = document.getElementById('btnDuplicateSticker');
  const btnToggleLock = document.getElementById('btnToggleLock');
  const btnLayerFront = document.getElementById('btnLayerFront');
  const btnLayerForward = document.getElementById('btnLayerForward');
  const btnLayerBackward = document.getElementById('btnLayerBackward');
  const btnLayerBack = document.getElementById('btnLayerBack');
  const stickerOpacitySlider = document.getElementById('stickerOpacitySlider');
  const stickerOpacityValText = document.getElementById('stickerOpacityValText');

  let activePackId = 'cute';
  let selectedStickerId = null;
  let selectedSlotIndex = -1;
  let lastSlotDownTime = 0;
  let lastSlotDownIndex = -1;
  let isDoubleHoldingSlot = false;
  let activeLayoutCat = 'all';
  let collagePreviewRafId = null;
  let collageAutosaveTimer = null;
  let liveGifPlaybackRafId = null;
  let liveGifPlaybackStartTime = null;

  function stopGifPlaybackLoop() {
    if (liveGifPlaybackRafId) {
      cancelAnimationFrame(liveGifPlaybackRafId);
      liveGifPlaybackRafId = null;
    }
  }

  function checkAndManageGifPlaybackLoop() {
    if (currentActiveView !== 'collage' || !collageRenderer.hasGifStickers()) {
      stopGifPlaybackLoop();
      return;
    }
    if (liveGifPlaybackRafId) return; 

    liveGifPlaybackStartTime = performance.now();
    const stepGifLoop = async (now) => {
      if (currentActiveView !== 'collage' || !collageRenderer.hasGifStickers()) {
        liveGifPlaybackRafId = null;
        return;
      }
      const timeOffset = (now - liveGifPlaybackStartTime) / 1000;
      const photos = photoManager.getAll();
      if (photos.length > 0 && !isRenderingCanvas) {
        await collageRenderer.render(photos, timeOffset);
      }
      liveGifPlaybackRafId = requestAnimationFrame(stepGifLoop);
    };
    liveGifPlaybackRafId = requestAnimationFrame(stepGifLoop);
  }

  async function updateCollagePreview(options = {}) {
    const skipDom = options && options.skipDom === true;
    const immediate = options && options.immediate === true;
    const photos = photoManager.getAll();
    if (photos.length === 0) return;

    const executeRender = async () => {
      const wrapper = document.querySelector('.collage-canvas-wrapper');
      if (wrapper) {
        wrapper.dataset.photoCount = photos.length;
        if (photos.length >= 7) {
          wrapper.dataset.countTier = 'high';
        } else if (photos.length >= 5) {
          wrapper.dataset.countTier = 'medium';
        } else {
          wrapper.dataset.countTier = 'standard';
        }
      }
      await collageRenderer.render(photos);
      if (canvasContainer && collageCanvas) {
        const cW = collageCanvas.width || 1200;
        const cH = collageCanvas.height || 1600;
        canvasContainer.style.aspectRatio = `${cW} / ${cH}`;
      }
      if (!skipDom) {
        renderInteractiveStickers();
        renderActiveStampsList();
        renderSlotOverlays();
        updateSlotInspectorUI();
        updateInspectorUI();
        updateAccordionSummaries();
      }
      saveCollageAutosave();
      checkAndManageGifPlaybackLoop();
    };

    if (immediate || typeof requestAnimationFrame === 'undefined') {
      await executeRender();
    } else {
      if (collagePreviewRafId) cancelAnimationFrame(collagePreviewRafId);
      collagePreviewRafId = requestAnimationFrame(async () => {
        collagePreviewRafId = null;
        await executeRender();
      });
    }
  }

  function saveCollageAutosave() {
    if (collageAutosaveTimer) clearTimeout(collageAutosaveTimer);
    collageAutosaveTimer = setTimeout(() => {
      try {
        const stateToSave = {
          settings: {
            layoutId: collageRenderer.settings.layoutId,
            aspectRatio: collageRenderer.settings.aspectRatio,
            frameColor: collageRenderer.settings.frameColor,
            frameStyle: collageRenderer.settings.frameStyle,
            photoShape: collageRenderer.settings.photoShape,
            paperTexture: collageRenderer.settings.paperTexture,
            spacing: collageRenderer.settings.spacing,
            padding: collageRenderer.settings.padding,
            borderRadius: collageRenderer.settings.borderRadius,
            stampText: collageRenderer.settings.stampText,
            showStamp: collageRenderer.settings.showStamp,
            filter: collageRenderer.settings.filter,
            filterIntensity: collageRenderer.settings.filterIntensity,
            textColor: collageRenderer.settings.textColor,
            fontFamily: collageRenderer.settings.fontFamily,
            footerAlignment: collageRenderer.settings.footerAlignment,
            slotTransforms: collageRenderer.settings.slotTransforms,
            stickers: collageRenderer.settings.stickers,
          },
        };
        localStorage.setItem('say_cheese_collage_autosave', JSON.stringify(stateToSave));
        triggerDebouncedAutosave();
      } catch (e) {

      }
    }, 200);
  }

  function restoreCollageAutosave() {
    try {
      const saved = localStorage.getItem('say_cheese_collage_autosave');
      if (!saved) {
        collageRenderer.clearStickers();
        return;
      }
      const parsed = JSON.parse(saved);
      if (parsed && parsed.settings) {
        const { stickers, slotTransforms, ...safeSettings } = parsed.settings;
        collageRenderer.updateSettings(safeSettings);
        collageRenderer.clearStickers();
        if (spacingSlider && collageRenderer.settings.spacing !== undefined) {
          spacingSlider.value = collageRenderer.settings.spacing;
          spacingValText.textContent = `${collageRenderer.settings.spacing}px`;
        }
        if (paddingSlider && collageRenderer.settings.padding !== undefined) {
          paddingSlider.value = collageRenderer.settings.padding;
          paddingValText.textContent = `${collageRenderer.settings.padding}px`;
        }
        if (borderRadiusSlider && collageRenderer.settings.borderRadius !== undefined) {
          borderRadiusSlider.value = collageRenderer.settings.borderRadius;
          borderRadiusValText.textContent = `${collageRenderer.settings.borderRadius}px`;
        }
        if (stampTextInput && collageRenderer.settings.stampText !== undefined) {
          stampTextInput.value = collageRenderer.settings.stampText;
        }
        if (footerFontSelect) {
          footerFontSelect.value = collageRenderer.settings.fontFamily || 'Space Grotesk';
        }
      } else {
        collageRenderer.clearStickers();
      }
    } catch (e) {
      collageRenderer.clearStickers();
    }
  }

  function renderLayoutPicker(catId = 'all') {
    if (!layoutPicker) return;
    const layouts = getLayoutsByCategory(catId);
    layoutPicker.innerHTML = '';
    const currentLayoutId = collageRenderer.settings.layoutId;

    layouts.forEach((layout) => {
      const card = document.createElement('div');
      card.className = `layout-card ${layout.id === currentLayoutId ? 'active' : ''}`;
      card.dataset.layout = layout.id;

      let iconHTML = '';
      if (layout.id === 'vertical-strip' || layout.id === 'film-vertical') {
        iconHTML = `<div class="layout-icon" style="grid-template-rows: repeat(${layout.defaultSlotsCount || 4}, 1fr);">`;
        for (let i = 0; i < (layout.defaultSlotsCount || 4); i++) iconHTML += '<span class="slot"></span>';
        iconHTML += '</div>';
      } else if (layout.id === 'grid-2x2') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;"><span class="slot"></span><span class="slot"></span><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'horizontal-strip') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: repeat(4, 1fr); height: 28px;"><span class="slot"></span><span class="slot"></span><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'featured-3plus1') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1.5fr 1fr; grid-template-rows: 1fr 1fr 1fr;"><span class="slot" style="grid-row: span 3;"></span><span class="slot"></span><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'grid-2x3') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr);">';
        for (let i = 0; i < 6; i++) iconHTML += '<span class="slot"></span>';
        iconHTML += '</div>';
      } else if (layout.id === 'duo-editorial') {
        iconHTML = '<div class="layout-icon" style="grid-template-rows: 1fr 1fr;"><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'trio-minimal') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1fr 1fr; grid-template-rows: 1.2fr 1fr;"><span class="slot" style="grid-column: span 2;"></span><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'asymmetric-fun') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1.2fr 1fr; grid-template-rows: 1.2fr 1fr;"><span class="slot"></span><span class="slot"></span><span class="slot"></span><span class="slot"></span></div>';
      } else if (layout.id === 'circles-strip') {
        iconHTML = '<div class="layout-icon" style="grid-template-rows: repeat(4, 1fr);"><span class="slot" style="border-radius:50%;"></span><span class="slot" style="border-radius:50%;"></span><span class="slot" style="border-radius:50%;"></span><span class="slot" style="border-radius:50%;"></span></div>';
      } else if (layout.id === 'heart-mosaic') {
        iconHTML = '<div class="layout-icon" style="display:flex; align-items:center; justify-content:center; font-size:16px;">💖</div>';
      } else if (layout.id === 'star-quad') {
        iconHTML = '<div class="layout-icon" style="display:flex; align-items:center; justify-content:center; font-size:16px;">⭐</div>';
      } else if (layout.id === 'oval-portrait') {
        iconHTML = '<div class="layout-icon" style="grid-template-rows: 1fr 1fr;"><span class="slot" style="border-radius:50%;"></span><span class="slot" style="border-radius:50%;"></span></div>';
      } else if (layout.id === 'arch-gallery') {
        iconHTML = '<div class="layout-icon" style="grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;"><span class="slot" style="border-radius:6px 6px 2px 2px;"></span><span class="slot" style="border-radius:6px 6px 2px 2px;"></span><span class="slot" style="border-radius:6px 6px 2px 2px;"></span><span class="slot" style="border-radius:6px 6px 2px 2px;"></span></div>';
      } else {
        iconHTML = '<div class="layout-icon">';
        for (let i = 0; i < (layout.defaultSlotsCount || 4); i++) iconHTML += '<span class="slot"></span>';
        iconHTML += '</div>';
      }

      card.innerHTML = `
        ${iconHTML}
        <span>${layout.name}</span>
      `;

      card.addEventListener('click', async () => {
        soundManager.playButtonClick();
        const prevLayout = collageRenderer.settings.layoutId;
        const newLayout = layout.id;
        if (prevLayout === newLayout) return;

        const applyLayout = async (lId) => {
          document.querySelectorAll('.layout-card').forEach(c => c.classList.toggle('active', c.dataset.layout === lId));
          collageRenderer.settings.slotTransforms = {};
          selectedSlotIndex = -1;
          const targetLayout = COLLAGE_LAYOUTS[lId];
          const newSettings = { layoutId: lId };
          if (targetLayout) {
            if (targetLayout.aspectRatio) {
              const aspect = targetLayout.aspectRatio === '1:3.2' ? 'strip' : targetLayout.aspectRatio;
              newSettings.aspectRatio = aspect;
              document.querySelectorAll('#aspectRatioGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === aspect));
            }
            if (targetLayout.category === 'shapes') {
              if (lId === 'circles-strip') newSettings.photoShape = 'circle';
              else if (lId === 'heart-mosaic') newSettings.photoShape = 'heart';
              else if (lId === 'star-quad') newSettings.photoShape = 'star';
              else if (lId === 'oval-portrait') newSettings.photoShape = 'ellipse';
              else if (lId === 'arch-gallery') newSettings.photoShape = 'arch';
            } else {
              if (!['rounded', 'rectangle', 'square'].includes(collageRenderer.settings.photoShape)) {
                newSettings.photoShape = 'rounded';
              }
            }
            if (newSettings.photoShape) {
              document.querySelectorAll('#photoShapeGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.shape === newSettings.photoShape));
            }
          }
          collageRenderer.updateSettings(newSettings);
          updateSlotInspectorUI();
          updateAccordionSummaries();
          await updateCollagePreview();
        };

        await applyLayout(newLayout);
        historyManager.push({
          type: 'layout-change',
          description: `Changed layout to ${layout.name}`,
          undo: async () => applyLayout(prevLayout),
          redo: async () => applyLayout(newLayout),
        });
      });

      layoutPicker.appendChild(card);
    });
  }

  let activeSettingsSection = 'layout';

  function setActiveSettingsSection(sectionName) {
    activeSettingsSection = sectionName;
    const accordionItems = document.querySelectorAll('#collageAccordion .accordion-item');
    if (!accordionItems || accordionItems.length === 0) return;

    accordionItems.forEach((item) => {
      const header = item.querySelector('.accordion-header');
      const body = item.querySelector('.accordion-body');
      const isTarget = header && header.dataset.section === sectionName;

      item.classList.toggle('active', isTarget);
      if (header) {
        header.setAttribute('aria-expanded', isTarget ? 'true' : 'false');
        const chevron = header.querySelector('.accordion-chevron');
        if (chevron) {
          chevron.textContent = isTarget ? '▼' : '▶';
        }
      }
      if (body) {
        if (isTarget) {
          body.removeAttribute('hidden');
          if (sectionName === 'slot') {
            updateSlotInspectorUI();
          }
        } else {
          body.setAttribute('hidden', '');
        }
      }
    });

    updateAccordionSummaries();
  }

  function toggleAccordionSection(sectionName) {
    if (activeSettingsSection === sectionName) {
      setActiveSettingsSection(null);
    } else {
      setActiveSettingsSection(sectionName);
    }
  }

  function openAccordionSection(sectionName) {
    setActiveSettingsSection(sectionName);
  }

  function switchWorkbenchCategory(tabName) {
    setActiveSettingsSection(tabName);
  }

  function updateAccordionSummaries() {
    const s = collageRenderer.settings;
    if (!s) return;

    const accSummary_layout = document.getElementById('accSummary_layout');
    if (accSummary_layout) {
      const layoutObj = typeof getLayoutById === 'function' ? getLayoutById(s.layoutId) : null;
      const layoutName = layoutObj ? layoutObj.name : (s.layoutId || '4-Strip');
      accSummary_layout.textContent = layoutName;
    }

    const accSummary_dimensions = document.getElementById('accSummary_dimensions');
    if (accSummary_dimensions) {
      const aspectLabel = s.aspectRatio === 'strip' ? 'Strip' : s.aspectRatio;
      accSummary_dimensions.textContent = `${aspectLabel} · ${s.spacing ?? 16}px gap · ${s.padding ?? 24}px pad`;
    }

    const accSummary_frame = document.getElementById('accSummary_frame');
    if (accSummary_frame) {
      const styleName = s.frameStyle ? (s.frameStyle.charAt(0).toUpperCase() + s.frameStyle.slice(1)) : 'Clean';
      const shapeName = s.photoShape ? (s.photoShape.charAt(0).toUpperCase() + s.photoShape.slice(1)) : 'Rounded';
      accSummary_frame.textContent = `${styleName} · ${shapeName}`;
    }

    const accSummary_filter = document.getElementById('accSummary_filter');
    if (accSummary_filter) {
      const filterName = s.filter ? s.filter.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Original';
      accSummary_filter.textContent = `${filterName} · ${s.filterIntensity ?? 80}%`;
    }

    const accSummary_slot = document.getElementById('accSummary_slot');
    if (accSummary_slot) {
      if (selectedSlotIndex < 0) {
        accSummary_slot.textContent = 'Slot #1 · 1.0x';
      } else {
        const transform = collageRenderer.getSlotTransform(selectedSlotIndex) || {};
        const zoomText = `${(transform.zoom || 1.0).toFixed(1)}x`;
        accSummary_slot.textContent = `Slot #${selectedSlotIndex + 1} · ${zoomText}`;
      }
    }

    const accSummary_stamp = document.getElementById('accSummary_stamp');
    if (accSummary_stamp) {
      if (s.showStamp === false) {
        accSummary_stamp.textContent = 'Hidden (Off)';
      } else {
        const text = (s.stampText || '').trim();
        const align = (s.textAlign || s.footerAlignment || 'center').toUpperCase();
        accSummary_stamp.textContent = text ? `${text.length > 18 ? text.slice(0, 16) + '…' : text} · ${align}` : `No Text · ${align}`;
      }
    }

    const accSummary_stickers = document.getElementById('accSummary_stickers');
    if (accSummary_stickers) {
      const count = (s.stickers || []).length;
      accSummary_stickers.textContent = count === 0 ? '0 active stamps' : `${count} active stamp${count === 1 ? '' : 's'}`;
    }
  }

  let rafRenderId = null;
  let isRenderingCanvas = false;
  let hasPendingCanvasRender = false;

  function rafCanvasRender() {
    if (isRenderingCanvas) {
      hasPendingCanvasRender = true;
      return;
    }
    if (rafRenderId) cancelAnimationFrame(rafRenderId);
    rafRenderId = requestAnimationFrame(async () => {
      rafRenderId = null;
      isRenderingCanvas = true;
      try {
        const photos = photoManager.getAll();
        if (photos.length > 0) {
          await collageRenderer.render(photos);
          if (collageCanvas) {
            collageCanvas.style.width = '';
            collageCanvas.style.height = '';
          }
        }
      } finally {
        isRenderingCanvas = false;
        if (hasPendingCanvasRender) {
          hasPendingCanvasRender = false;
          rafCanvasRender();
        }
      }
    });
  }

  if (typeof ResizeObserver !== 'undefined' && collageCanvas) {
    const wrapper = collageCanvas.parentElement;
    if (wrapper) {
      const ro = new ResizeObserver(() => {
        if (collageSection && collageSection.classList.contains('active')) {
          renderSlotOverlays();
          renderInteractiveStickers();
        }
      });
      ro.observe(wrapper);
    }
  }

  window.addEventListener('resize', () => {
    if (collageSection && collageSection.classList.contains('active')) {
      renderSlotOverlays();
      renderInteractiveStickers();
    }
  });

  const activeZoomAnimations = new Map();

  function smoothZoomSlot(slotIndex, targetZoom, options = {}) {
    const duration = options.duration !== undefined ? options.duration : 160;
    const curTransform = collageRenderer.getSlotTransform(slotIndex);
    const startZoom = curTransform.zoom || 1.0;
    const clampedTarget = Math.max(1.0, Math.min(2.5, +Number(targetZoom).toFixed(3)));

    if (activeZoomAnimations.has(slotIndex)) {
      cancelAnimationFrame(activeZoomAnimations.get(slotIndex));
      activeZoomAnimations.delete(slotIndex);
    }

    if (Math.abs(startZoom - clampedTarget) < 0.005 || duration <= 0) {
      collageRenderer.setSlotTransform(slotIndex, { zoom: clampedTarget });
      updateSlotInspectorUI();
      rafCanvasRender();
      if (options.onComplete) options.onComplete();
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      const ease = 1 - Math.pow(1 - progress, 3);
      const currentZoom = +(startZoom + (clampedTarget - startZoom) * ease).toFixed(3);

      collageRenderer.setSlotTransform(slotIndex, { zoom: currentZoom });
      updateSlotInspectorUI();
      rafCanvasRender();

      if (progress < 1) {
        const frameId = requestAnimationFrame(step);
        activeZoomAnimations.set(slotIndex, frameId);
      } else {
        activeZoomAnimations.delete(slotIndex);
        collageRenderer.setSlotTransform(slotIndex, { zoom: clampedTarget });
        updateSlotInspectorUI();
        rafCanvasRender();
        if (options.onComplete) options.onComplete();
      }
    };

    const frameId = requestAnimationFrame(step);
    activeZoomAnimations.set(slotIndex, frameId);
  }

  function selectSlot(slotIndex) {
    const computedSlots = collageRenderer.getLastComputedSlots();
    const totalSlots = (computedSlots && computedSlots.length > 0) ? computedSlots.length : (photoManager.count || 4);
    if (totalSlots === 0) return;

    if (slotIndex < 0 || slotIndex >= totalSlots) {
      selectedSlotIndex = 0;
    } else {
      selectedSlotIndex = slotIndex;
    }

    if (slotOverlayContainer) {
      slotOverlayContainer.querySelectorAll('.slot-click-target').forEach((b) => {
        const bIdx = parseInt(b.dataset.slotIndex, 10);
        b.classList.toggle('selected', bIdx === selectedSlotIndex);
      });
    }

    if (activeSettingsSection !== 'slot') {
      setActiveSettingsSection('slot');
    }

    updateSlotInspectorUI();
  }

  function renderSlotOverlays() {
    if (!slotOverlayContainer || !collageCanvas) return;
    slotOverlayContainer.innerHTML = '';
    const computedSlots = collageRenderer.getLastComputedSlots();
    if (!computedSlots || computedSlots.length === 0) return;

    const canvasW = collageCanvas.width || 1;
    const canvasH = collageCanvas.height || 1;

    slotOverlayContainer.style.left = '0px';
    slotOverlayContainer.style.top = '0px';
    slotOverlayContainer.style.width = '100%';
    slotOverlayContainer.style.height = '100%';

    computedSlots.forEach((slot) => {
      const box = document.createElement('div');
      box.dataset.slotIndex = slot.index;
      box.className = `slot-click-target ${slot.index === selectedSlotIndex ? 'selected' : ''}`;
      box.style.left = `${(slot.x / canvasW) * 100}%`;
      box.style.top = `${(slot.y / canvasH) * 100}%`;
      box.style.width = `${(slot.width / canvasW) * 100}%`;
      box.style.height = `${(slot.height / canvasH) * 100}%`;
      const rawRadius = collageRenderer.settings.borderRadius !== undefined ? collageRenderer.settings.borderRadius : 8;
      const currentShape = slot.shape || collageRenderer.settings.photoShape || 'rounded';
      if (currentShape === 'circle') {
        box.style.borderRadius = '50%';
      } else if (currentShape === 'ellipse') {
        box.style.borderRadius = '50% / 50%';
      } else if (currentShape === 'arch') {
        const archPercentY = Math.min(50, Math.round((slot.width / 2 / (slot.height || 1)) * 100));
        const bRad = Math.max(0, Math.round((rawRadius / 16) * 10));
        box.style.borderRadius = `50% 50% ${bRad}px ${bRad}px / ${archPercentY}% ${archPercentY}% ${bRad}px ${bRad}px`;
      } else if (currentShape === 'rectangle' || currentShape === 'square') {
        box.style.borderRadius = '0px';
      } else {
        const bRad = Math.max(0, Math.round((rawRadius / 16) * 12));
        box.style.borderRadius = `${bRad}px`;
      }
      box.setAttribute('draggable', 'true');
      box.setAttribute('title', `Photo #${slot.index + 1}: Click to edit in inspector, drag to pan / swap`);

      const badge = document.createElement('span');
      badge.className = 'slot-badge-indicator';
      badge.textContent = `#${slot.index + 1}`;
      box.appendChild(badge);

      ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach((cornerClass) => {
        const handle = document.createElement('span');
        handle.className = `slot-corner-handle ${cornerClass}`;
        handle.setAttribute('title', 'Drag corner to resize / zoom photo in slot');
        box.appendChild(handle);

        const onCornerPointerDown = (e) => {
          if (e.button && e.button !== 0) return;
          e.preventDefault();
          e.stopPropagation();

          selectSlot(slot.index);

          const curTransform = collageRenderer.getSlotTransform(slot.index);
          const startBoxScale = curTransform.boxScale !== undefined ? curTransform.boxScale : 1.0;

          const rect = box.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const startClientX = e.touches ? e.touches[0].clientX : e.clientX;
          const startClientY = e.touches ? e.touches[0].clientY : e.clientY;
          const startDist = Math.hypot(startClientX - centerX, startClientY - centerY) || 1;

          let targetBoxScale = startBoxScale;

          const onCornerMove = (moveEvt) => {
            if (moveEvt.cancelable) moveEvt.preventDefault();
            const curClientX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const curClientY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;

            const curDist = Math.hypot(curClientX - centerX, curClientY - centerY);
            const scaleFactor = curDist / startDist;
            targetBoxScale = Math.max(0.35, Math.min(3.0, +(startBoxScale * scaleFactor).toFixed(3)));

            collageRenderer.setSlotTransform(slot.index, { boxScale: targetBoxScale });
            updateSlotInspectorUI();
            rafCanvasRender();

            const computedSlots = collageRenderer.getLastComputedSlots();
            const curSlot = computedSlots.find(s => s.index === slot.index);
            if (curSlot && collageCanvas) {
              const canvasW = collageCanvas.width || 1;
              const canvasH = collageCanvas.height || 1;
              box.style.left = `${(curSlot.x / canvasW) * 100}%`;
              box.style.top = `${(curSlot.y / canvasH) * 100}%`;
              box.style.width = `${(curSlot.width / canvasW) * 100}%`;
              box.style.height = `${(curSlot.height / canvasH) * 100}%`;
            }
          };

          const onCornerUp = async () => {
            document.removeEventListener('mousemove', onCornerMove);
            document.removeEventListener('mouseup', onCornerUp);
            document.removeEventListener('touchmove', onCornerMove);
            document.removeEventListener('touchend', onCornerUp);
            document.removeEventListener('touchcancel', onCornerUp);

            if (Math.abs(startBoxScale - targetBoxScale) > 0.02) {
              historyManager.push({
                type: 'slot-resize',
                description: `Resized photo frame #${slot.index + 1}`,
                undo: async () => {
                  collageRenderer.setSlotTransform(slot.index, { boxScale: startBoxScale });
                  renderSlotOverlays();
                  await updateCollagePreview();
                },
                redo: async () => {
                  collageRenderer.setSlotTransform(slot.index, { boxScale: targetBoxScale });
                  renderSlotOverlays();
                  await updateCollagePreview();
                },
              });
            }
            const photos = photoManager.getAll();
            await collageRenderer.render(photos);
            selectSlot(slot.index);
          };

          document.addEventListener('mousemove', onCornerMove);
          document.addEventListener('mouseup', onCornerUp);
          document.addEventListener('touchmove', onCornerMove, { passive: false });
          document.addEventListener('touchend', onCornerUp);
          document.addEventListener('touchcancel', onCornerUp);
        };

        handle.addEventListener('mousedown', onCornerPointerDown);
        handle.addEventListener('touchstart', onCornerPointerDown, { passive: false });
      });

      box.addEventListener('click', (e) => {
        if (e.target.closest('.slot-corner-handle')) return;
        e.stopPropagation();
        soundManager.playButtonClick();
        selectSlot(slot.index);
      });

      box.addEventListener('dblclick', (e) => {
        if (e.target.closest('.slot-corner-handle')) return;
        e.stopPropagation();
        e.preventDefault();
        soundManager.playButtonClick();
        selectSlot(slot.index);
        const curTransform = collageRenderer.getSlotTransform(slot.index);
        const targetZoom = (curTransform.zoom || 1.0) > 1.08 ? 1.0 : 1.5;
        smoothZoomSlot(slot.index, targetZoom, {
          duration: 180,
          onComplete: () => {
            selectSlot(slot.index);
          }
        });
      });

      let isShiftingBox = false;
      let hasShifted = false;

      const onBoxPointerDown = (e) => {
        if (e.target.closest('.slot-corner-handle')) return;
        if (e.button !== undefined && e.button !== 0) return; 

        const now = performance.now();
        const isSecondDown = (lastSlotDownIndex === slot.index && (now - lastSlotDownTime) < 450);
        lastSlotDownTime = now;
        lastSlotDownIndex = slot.index;

        selectSlot(slot.index);

        if (isSecondDown) {
          isDoubleHoldingSlot = true;
          soundManager.playButtonClick();
        }

        const startX = e.touches ? e.touches[0].clientX : e.clientX;
        const startY = e.touches ? e.touches[0].clientY : e.clientY;
        const curTransform = collageRenderer.getSlotTransform(slot.index);
        const initialOffsetX = curTransform.boxOffsetX || 0;
        const initialOffsetY = curTransform.boxOffsetY || 0;

        const canvasW = collageCanvas.width || 1;
        const canvasH = collageCanvas.height || 1;
        const containerRect = canvasContainer ? canvasContainer.getBoundingClientRect() : collageCanvas.getBoundingClientRect();
        const scaleRatioX = canvasW / (containerRect.width || 1);
        const scaleRatioY = canvasH / (containerRect.height || 1);

        isShiftingBox = true;
        hasShifted = false;

        const onBoxPointerMove = (moveEvt) => {
          if (!isShiftingBox) return;
          const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
          const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;
          const dx = curX - startX;
          const dy = curY - startY;

          if (Math.hypot(dx, dy) > 2) {
            hasShifted = true;
            if (moveEvt.cancelable) moveEvt.preventDefault();

            selectSlot(slot.index);

            const newOffsetX = Math.round(initialOffsetX + dx * scaleRatioX);
            const newOffsetY = Math.round(initialOffsetY + dy * scaleRatioY);

            collageRenderer.setSlotTransform(slot.index, { boxOffsetX: newOffsetX, boxOffsetY: newOffsetY });
            rafCanvasRender();

            const computedSlots = collageRenderer.getLastComputedSlots();
            const curSlot = computedSlots.find(s => s.index === slot.index);
            if (curSlot && collageCanvas) {
              box.style.left = `${(curSlot.x / canvasW) * 100}%`;
              box.style.top = `${(curSlot.y / canvasH) * 100}%`;
              box.style.width = `${(curSlot.width / canvasW) * 100}%`;
              box.style.height = `${(curSlot.height / canvasH) * 100}%`;
            }
          }
        };

        const onBoxPointerUp = async () => {
          if (!isShiftingBox) return;
          isShiftingBox = false;

          document.removeEventListener('mousemove', onBoxPointerMove);
          document.removeEventListener('mouseup', onBoxPointerUp);
          document.removeEventListener('touchmove', onBoxPointerMove);
          document.removeEventListener('touchend', onBoxPointerUp);
          document.removeEventListener('touchcancel', onBoxPointerUp);

          const curTransform = collageRenderer.getSlotTransform(slot.index);
          const afterOffsetX = curTransform.boxOffsetX || 0;
          const afterOffsetY = curTransform.boxOffsetY || 0;

          if (hasShifted && (Math.abs(initialOffsetX - afterOffsetX) > 2 || Math.abs(initialOffsetY - afterOffsetY) > 2)) {
            historyManager.push({
              type: 'slot-move',
              description: `Shifted photo frame #${slot.index + 1}`,
              undo: async () => {
                collageRenderer.setSlotTransform(slot.index, { boxOffsetX: initialOffsetX, boxOffsetY: initialOffsetY });
                renderSlotOverlays();
                await updateCollagePreview();
              },
              redo: async () => {
                collageRenderer.setSlotTransform(slot.index, { boxOffsetX: afterOffsetX, boxOffsetY: afterOffsetY });
                renderSlotOverlays();
                await updateCollagePreview();
              },
            });
          }

          if (hasShifted) {
            const photos = photoManager.getAll();
            await collageRenderer.render(photos);
          }

          if (isDoubleHoldingSlot) {
            isDoubleHoldingSlot = false;
          }

          selectSlot(slot.index);
        };

        document.addEventListener('mousemove', onBoxPointerMove);
        document.addEventListener('mouseup', onBoxPointerUp);
        document.addEventListener('touchmove', onBoxPointerMove, { passive: false });
        document.addEventListener('touchend', onBoxPointerUp);
        document.addEventListener('touchcancel', onBoxPointerUp);
      };

      box.addEventListener('mousedown', onBoxPointerDown);
      box.addEventListener('touchstart', onBoxPointerDown, { passive: false });

      slotOverlayContainer.appendChild(box);
    });
  }

  function updateSlotInspectorUI() {
    if (!slotInspector) return;
    const computedSlots = collageRenderer.getLastComputedSlots();
    const totalSlots = (computedSlots && computedSlots.length > 0) ? computedSlots.length : (photoManager.count || 4);

    if (totalSlots === 0) {
      if (slotInspectorTitle) slotInspectorTitle.textContent = 'Photo Slot (No photos captured)';
      return;
    }

    if (selectedSlotIndex < 0 || selectedSlotIndex >= totalSlots) {
      selectedSlotIndex = 0;
    }

    const transform = collageRenderer.getSlotTransform(selectedSlotIndex) || { zoom: 1.0, panX: 0, panY: 0, rotation: 0, flipH: false, flipV: false, filter: '' };
    if (slotInspectorTitle) {
      slotInspectorTitle.textContent = `Photo Slot #${selectedSlotIndex + 1} (Editing)`;
    }

    const slotSelectorChips = document.getElementById('slotSelectorChips');
    if (slotSelectorChips) {
      slotSelectorChips.innerHTML = '';
      for (let i = 0; i < totalSlots; i++) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `slot-chip-btn ${i === selectedSlotIndex ? 'active' : ''}`;
        chip.textContent = `Photo #${i + 1}`;
        chip.title = `Select and edit Photo #${i + 1}`;
        chip.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          soundManager.playButtonClick();
          selectSlot(i);
        });
        slotSelectorChips.appendChild(chip);
      }
    }

    if (slotZoomSlider) {
      slotZoomSlider.value = Math.round((transform.zoom || 1.0) * 100);
      if (slotZoomValText) slotZoomValText.textContent = `${(transform.zoom || 1.0).toFixed(1)}x`;
    }

    if (slotPanXSlider) {
      slotPanXSlider.value = transform.panX || 0;
      if (slotPanXValText) slotPanXValText.textContent = `${(transform.panX || 0) > 0 ? '+' : ''}${transform.panX || 0}%`;
    }

    if (slotPanYSlider) {
      slotPanYSlider.value = transform.panY || 0;
      if (slotPanYValText) slotPanYValText.textContent = `${(transform.panY || 0) > 0 ? '+' : ''}${transform.panY || 0}%`;
    }

    if (slotFilterSelect) {
      slotFilterSelect.value = transform.filter || '';
    }

    if (slotSwapSelect) {
      slotSwapSelect.innerHTML = '';
      let added = 0;
      for (let i = 0; i < totalSlots; i++) {
        if (i !== selectedSlotIndex) {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = `Slot #${i + 1}`;
          slotSwapSelect.appendChild(opt);
          added++;
        }
      }
      if (added === 0) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = 'Only 1 slot';
        slotSwapSelect.appendChild(opt);
      }
    }

    const accSummary_slot = document.getElementById('accSummary_slot');
    if (accSummary_slot) {
      const zoomText = `${(transform.zoom || 1.0).toFixed(1)}x`;
      accSummary_slot.textContent = `Slot #${selectedSlotIndex + 1} · ${zoomText}`;
    }
  }

  function renderStickerTray() {
    if (!stickersTray) return;
    stickersTray.innerHTML = '';

    const searchQuery = stickerSearchInput ? stickerSearchInput.value.trim() : '';
    let itemsToRender = [];

    if (searchQuery) {
      itemsToRender = searchStickers(searchQuery);
    } else if (activePackId === 'favs') {
      itemsToRender = getFavorites();
    } else if (activePackId === 'recents') {
      itemsToRender = getRecents();
    } else if (activePackId === 'all') {
      itemsToRender = getAllBuiltInStickers();
    } else {
      const pack = STICKER_PACKS.find((p) => p.id === activePackId);
      itemsToRender = pack ? pack.stickers : STICKER_PACKS[0].stickers;
    }

    if (itemsToRender.length === 0) {
      stickersTray.innerHTML = `<span style="font-size: 11px; color: var(--color-charcoal-subtle); padding: 8px;">No stickers found.</span>`;
      return;
    }

    itemsToRender.forEach((item) => {
      const btn = document.createElement('button');
      btn.className = 'sticker-item';
      btn.title = `Add ${item.label || item.emoji || 'Sticker'}`;

      if (item.imgSrc) {
        btn.dataset.img = item.imgSrc;
        btn.innerHTML = `<img src="${item.imgSrc}" style="width: 24px; height: 24px; object-fit: contain; pointer-events: none;" alt="Sticker" />`;
      } else {
        btn.dataset.emoji = item.emoji || '✨';
        btn.textContent = item.emoji || '✨';
      }

      btn.addEventListener('click', async () => {
        soundManager.playButtonClick();
        addRecent(item);
        let newSticker = null;
        if (item.imgSrc) {
          const isGif = item.type === 'gif' || item.imgSrc.toLowerCase().includes('.gif');
          newSticker = await collageRenderer.addSticker(item.imgSrc, isGif ? 'gif' : 'image');
        } else {
          newSticker = await collageRenderer.addSticker(item.emoji, 'emoji');
        }

        if (newSticker) {
          selectedStickerId = newSticker.id;
          historyManager.push({
            type: 'sticker-add',
            description: `Added ${item.label || item.emoji || 'stamp'}`,
            undo: async () => {
              collageRenderer.removeSticker(newSticker.id);
              if (selectedStickerId === newSticker.id) selectedStickerId = null;
              await updateCollagePreview();
            },
            redo: async () => {
              if (!collageRenderer.settings.stickers.some(s => s.id === newSticker.id)) {
                collageRenderer.settings.stickers.push(newSticker);
              }
              selectedStickerId = newSticker.id;
              await updateCollagePreview();
            },
          });
        }

        await updateCollagePreview();
      });

      stickersTray.appendChild(btn);
    });
  }

  if (stickerPackTabs) {
    stickerPackTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.pack-tab-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      document.querySelectorAll('.pack-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePackId = btn.dataset.pack;
      if (stickerSearchInput) stickerSearchInput.value = '';
      renderStickerTray();
    });
  }

  if (stickerSearchInput) {
    stickerSearchInput.addEventListener('input', () => {
      renderStickerTray();
    });
  }

  if (btnSurpriseSticker) {
    btnSurpriseSticker.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const surpriseSticker = randomizerEngine.generateStickerSurprise();
      if (!surpriseSticker) return;

      addRecent(surpriseSticker);
      const newSticker = await collageRenderer.addSticker(surpriseSticker.emoji, surpriseSticker.type || 'emoji');
      if (newSticker) {
        selectedStickerId = newSticker.id;
        historyManager.push({
          type: 'sticker-add',
          description: `Surprise stamp (${surpriseSticker.emoji})`,
          undo: async () => {
            collageRenderer.removeSticker(newSticker.id);
            if (selectedStickerId === newSticker.id) selectedStickerId = null;
            await updateCollagePreview();
          },
          redo: async () => {
            if (!collageRenderer.settings.stickers.some(s => s.id === newSticker.id)) {
              collageRenderer.settings.stickers.push(newSticker);
            }
            selectedStickerId = newSticker.id;
            await updateCollagePreview();
          },
        });
        showHistoryToast(`✨ Added surprise stamp: ${surpriseSticker.emoji}`);
      }

      await updateCollagePreview();
    });
  }

  renderStickerTray();

  function selectSticker(stickerId) {
    selectedStickerId = stickerId;
    if (canvasStickersLayer) {
      canvasStickersLayer.querySelectorAll('.canvas-sticker-node').forEach(n => {
        n.classList.toggle('selected', n.dataset.id === stickerId);
      });
    }
    if (stickerId) switchWorkbenchCategory('stickers');
    updateInspectorUI();
  }

  function deselectSticker() {
    selectedStickerId = null;
    if (canvasStickersLayer) {
      canvasStickersLayer.querySelectorAll('.canvas-sticker-node').forEach(n => {
        n.classList.remove('selected');
      });
    }
    updateInspectorUI();
  }

  function deselectSlot() {
    selectedSlotIndex = -1;
    if (slotOverlayContainer) {
      slotOverlayContainer.querySelectorAll('.slot-click-target').forEach(b => {
        b.classList.remove('selected');
      });
    }
    const slotSelectorChips = document.getElementById('slotSelectorChips');
    if (slotSelectorChips) {
      slotSelectorChips.querySelectorAll('.slot-chip-btn').forEach(c => c.classList.remove('active'));
    }
  }

  document.addEventListener('pointerdown', (e) => {

    const isStickerTarget = e.target.closest('.canvas-sticker-node') ||
                            e.target.closest('#stickerInspector') ||
                            e.target.closest('.sticker-item-btn') ||
                            e.target.closest('.sticker-pack-tabs') ||
                            e.target.closest('.custom-text-stamp-box') ||
                            e.target.closest('.sticker-shelf');

    if (selectedStickerId && !isStickerTarget) {
      deselectSticker();
    }

    const isSlotTarget = e.target.closest('.slot-click-target') ||
                         e.target.closest('#slotInspector') ||
                         e.target.closest('#accBody_slot') ||
                         e.target.closest('#accItem_slot') ||
                         e.target.closest('#accContent_slot') ||
                         e.target.closest('#collageCanvas') ||
                         e.target.closest('.collage-canvas-wrapper') ||
                         e.target.closest('.collage-workbench') ||
                         e.target.closest('.workbench-panel') ||
                         e.target.closest('.collage-sidebar') ||
                         e.target.closest('#collageAccordion');

    if (selectedSlotIndex >= 0 && !isSlotTarget) {
      deselectSlot();
    }
  });

  window.addEventListener('pointerup', () => {
    if (isDoubleHoldingSlot) {
      isDoubleHoldingSlot = false;
    }
  });

  window.addEventListener('touchend', () => {
    if (isDoubleHoldingSlot) {
      isDoubleHoldingSlot = false;
    }
  });

  function updateInspectorUI() {
    if (!stickerInspector) return;
    const stickers = collageRenderer.settings.stickers || [];
    const sticker = stickers.find(s => s.id === selectedStickerId);

    if (!sticker) {
      stickerInspector.style.display = 'none';
      return;
    }

    stickerInspector.style.display = 'flex';
    if (inspectorTitle) {
      inspectorTitle.textContent = `Stamp: ${sticker.emoji || 'Sticker'}`;
    }

    if (btnFlipH) btnFlipH.classList.toggle('active', !!sticker.flipX);
    if (btnFlipV) btnFlipV.classList.toggle('active', !!sticker.flipY);
    if (btnToggleLock) {
      btnToggleLock.classList.toggle('active', !!sticker.locked);
      btnToggleLock.innerHTML = sticker.locked ? '🔒 Locked' : '🔓 Lock';
    }

    if (btnInspectorFav) {
      const fav = isFavorite(sticker.emoji || sticker.imgSrc);
      btnInspectorFav.textContent = fav ? '❤️' : '♡';
      btnInspectorFav.title = fav ? 'Remove from Favorites' : 'Add to Favorites';
    }

    const opacityPercent = Math.round((sticker.opacity !== undefined ? sticker.opacity : 1.0) * 100);
    if (stickerOpacitySlider) stickerOpacitySlider.value = opacityPercent;
    if (stickerOpacityValText) stickerOpacityValText.textContent = `${opacityPercent}%`;

  }

  const btnNudgeLeft = document.getElementById('btnNudgeLeft');
  const btnNudgeRight = document.getElementById('btnNudgeRight');
  const btnNudgeUp = document.getElementById('btnNudgeUp');
  const btnNudgeDown = document.getElementById('btnNudgeDown');
  const btnRotatePreset = document.getElementById('btnRotatePreset');

  const nudgeSticker = async (dx, dy) => {
    const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
    if (!sticker) return;
    soundManager.playButtonClick();
    mobileManager.hapticTap();
    sticker.xRatio = Math.max(0.02, Math.min(0.98, (sticker.xRatio || 0.5) + dx));
    sticker.yRatio = Math.max(0.02, Math.min(0.98, (sticker.yRatio || 0.5) + dy));
    await updateCollagePreview();
    keyboardManager.announce(`Stamp position moved to ${Math.round(sticker.xRatio * 100)}%, ${Math.round(sticker.yRatio * 100)}%`);
  };

  if (btnNudgeLeft) btnNudgeLeft.addEventListener('click', () => nudgeSticker(-0.02, 0));
  if (btnNudgeRight) btnNudgeRight.addEventListener('click', () => nudgeSticker(0.02, 0));
  if (btnNudgeUp) btnNudgeUp.addEventListener('click', () => nudgeSticker(0, -0.02));
  if (btnNudgeDown) btnNudgeDown.addEventListener('click', () => nudgeSticker(0, 0.02));
  if (btnRotatePreset) {
    btnRotatePreset.addEventListener('click', async () => {
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;
      soundManager.playButtonClick();
      mobileManager.hapticTap();
      sticker.rotation = ((sticker.rotation || 0) + 45) % 360;
      await updateCollagePreview();
      keyboardManager.announce(`Stamp rotated to ${sticker.rotation} degrees`);
    });
  }

  if (btnInspectorDeselect) {
    btnInspectorDeselect.addEventListener('click', () => {
      soundManager.playButtonClick();
      deselectSticker();
    });
  }

  if (btnInspectorFav) {
    btnInspectorFav.addEventListener('click', () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;
      toggleFavorite(sticker);
      updateInspectorUI();
      if (activePackId === 'favs') renderStickerTray();
    });
  }

  if (btnFlipH) {
    btnFlipH.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;

      collageRenderer.flipSticker(sticker.id, 'x');
      const curFlipX = sticker.flipX;

      historyManager.push({
        type: 'sticker-flip-x',
        description: 'Flipped stamp horizontally',
        undo: async () => {
          collageRenderer.flipSticker(sticker.id, 'x');
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.flipSticker(sticker.id, 'x');
          await updateCollagePreview();
        },
      });

      await updateCollagePreview();
    });
  }

  if (btnFlipV) {
    btnFlipV.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;

      collageRenderer.flipSticker(sticker.id, 'y');
      const curFlipY = sticker.flipY;

      historyManager.push({
        type: 'sticker-flip-y',
        description: 'Flipped stamp vertically',
        undo: async () => {
          collageRenderer.flipSticker(sticker.id, 'y');
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.flipSticker(sticker.id, 'y');
          await updateCollagePreview();
        },
      });

      await updateCollagePreview();
    });
  }

  if (btnDuplicateSticker) {
    btnDuplicateSticker.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;

      const duplicated = collageRenderer.duplicateSticker(sticker.id);
      if (duplicated) {
        selectedStickerId = duplicated.id;
        historyManager.push({
          type: 'sticker-duplicate',
          description: 'Duplicated stamp',
          undo: async () => {
            collageRenderer.removeSticker(duplicated.id);
            selectedStickerId = sticker.id;
            await updateCollagePreview();
          },
          redo: async () => {
            if (!collageRenderer.settings.stickers.some(s => s.id === duplicated.id)) {
              collageRenderer.settings.stickers.push(duplicated);
            }
            selectedStickerId = duplicated.id;
            await updateCollagePreview();
          },
        });
      }

      await updateCollagePreview();
    });
  }

  if (btnToggleLock) {
    btnToggleLock.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;

      const isLocked = collageRenderer.toggleStickerLock(sticker.id);
      historyManager.push({
        type: 'sticker-lock',
        description: isLocked ? 'Locked stamp' : 'Unlocked stamp',
        undo: async () => {
          collageRenderer.toggleStickerLock(sticker.id);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.toggleStickerLock(sticker.id);
          await updateCollagePreview();
        },
      });

      await updateCollagePreview();
    });
  }

  const wireLayerButton = (btnEl, direction, desc) => {
    if (!btnEl) return;
    btnEl.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;

      const prevOrder = (collageRenderer.settings.stickers || []).map(s => s.id);
      collageRenderer.reorderStickerLayer(sticker.id, direction);
      const newOrder = (collageRenderer.settings.stickers || []).map(s => s.id);

      historyManager.push({
        type: 'sticker-layer',
        description: desc,
        undo: async () => {
          const map = new Map((collageRenderer.settings.stickers || []).map(s => [s.id, s]));
          collageRenderer.settings.stickers = prevOrder.map(id => map.get(id)).filter(Boolean);
          await updateCollagePreview();
        },
        redo: async () => {
          const map = new Map((collageRenderer.settings.stickers || []).map(s => [s.id, s]));
          collageRenderer.settings.stickers = newOrder.map(id => map.get(id)).filter(Boolean);
          await updateCollagePreview();
        },
      });

      await updateCollagePreview();
    });
  };

  wireLayerButton(btnLayerFront, 'front', 'Brought stamp to front');
  wireLayerButton(btnLayerForward, 'up', 'Brought stamp forward');
  wireLayerButton(btnLayerBackward, 'down', 'Sent stamp backward');
  wireLayerButton(btnLayerBack, 'back', 'Sent stamp to back');

  let opacityBefore = 1.0;
  if (stickerOpacitySlider) {
    stickerOpacitySlider.addEventListener('focus', () => {
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      opacityBefore = sticker ? (sticker.opacity !== undefined ? sticker.opacity : 1.0) : 1.0;
    });

    stickerOpacitySlider.addEventListener('input', async (e) => {
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;
      const val = parseInt(e.target.value, 10);
      if (stickerOpacityValText) stickerOpacityValText.textContent = `${val}%`;
      collageRenderer.setStickerOpacity(sticker.id, val / 100);

      const photos = photoManager.getAll();
      if (photos.length > 0) await collageRenderer.render(photos);
      renderInteractiveStickers();
    });

    stickerOpacitySlider.addEventListener('change', (e) => {
      const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
      if (!sticker) return;
      const valAfter = parseInt(e.target.value, 10) / 100;
      const valBefore = opacityBefore;
      if (Math.abs(valBefore - valAfter) < 0.01) return;

      historyManager.push({
        type: 'sticker-opacity',
        description: `Changed stamp opacity (${Math.round(valAfter * 100)}%)`,
        undo: async () => {
          collageRenderer.setStickerOpacity(sticker.id, valBefore);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setStickerOpacity(sticker.id, valAfter);
          await updateCollagePreview();
        },
      });
      opacityBefore = valAfter;
    });
  }

  function renderInteractiveStickers() {
    if (!canvasStickersLayer || !collageCanvas) return;
    canvasStickersLayer.innerHTML = '';
    const rect = collageCanvas.getBoundingClientRect();
    const displayW = collageCanvas.offsetWidth || rect.width;
    const displayH = collageCanvas.offsetHeight || rect.height;
    canvasStickersLayer.style.left = `${collageCanvas.offsetLeft || 0}px`;
    canvasStickersLayer.style.top = `${collageCanvas.offsetTop || 0}px`;
    canvasStickersLayer.style.width = `${displayW}px`;
    canvasStickersLayer.style.height = `${displayH}px`;
    const stickers = collageRenderer.settings.stickers || [];

    stickers.forEach((sticker) => {
      if (sticker.hidden) return;

      const node = document.createElement('div');
      const isSelected = selectedStickerId === sticker.id;
      node.className = 'canvas-sticker-node' + 
                       (isSelected ? ' selected' : '') + 
                       (sticker.locked ? ' locked' : '');
      node.dataset.id = sticker.id;

      const baseSize = sticker.size || 54;
      const previewScale = (baseSize / 54) * 36;
      const aspect = sticker.aspectRatio || 1.0;
      let nodeW, nodeH;
      if (aspect >= 1) {
        nodeW = previewScale * 1.4 * aspect;
        nodeH = previewScale * 1.4;
      } else {
        nodeW = previewScale * 1.4;
        nodeH = (previewScale * 1.4) / aspect;
      }

      const boxW = Math.max(64, Math.round(nodeW + 18));
      const boxH = Math.max(64, Math.round(nodeH + 18));
      node.style.width = `${boxW}px`;
      node.style.height = `${boxH}px`;
      node.style.left = `${sticker.x * 100}%`;
      node.style.top = `${sticker.y * 100}%`;
      node.style.opacity = sticker.opacity !== undefined ? sticker.opacity : 1.0;
      node.title = sticker.locked ? 'Locked Stamp (Select to unlock)' : 'Drag anywhere to move stamp freely; use handles to rotate & resize';

      const flipTransform = `scale(${sticker.flipX ? -1 : 1}, ${sticker.flipY ? -1 : 1}) rotate(${sticker.rotation || 0}deg)`;

      let contentHTML = '';
      if ((sticker.type === 'image' || sticker.type === 'gif' || sticker.imgSrc) && sticker.imgSrc) {
        contentHTML = `<img src="${sticker.imgSrc}" class="sticker-img" draggable="false" style="width: ${nodeW}px; height: ${nodeH}px; object-fit: contain; transform: ${flipTransform}; display: block; pointer-events: none; user-select: none;" alt="Sticker" />`;
      } else {
        contentHTML = `<span class="sticker-emoji" style="font-size: ${previewScale}px; transform: ${flipTransform}; pointer-events: none; user-select: none;">${sticker.emoji}</span>`;
      }

      const lockBadgeHTML = sticker.locked ? `<span class="sticker-lock-badge" title="Locked">🔒</span>` : '';

      node.innerHTML = `
        <button type="button" class="sticker-rotate-btn" title="Drag to rotate/tilt" aria-label="Rotate stamp">↻</button>
        <button type="button" class="sticker-del-btn" title="Remove stamp" aria-label="Delete stamp">✕</button>
        ${contentHTML}
        ${lockBadgeHTML}
        <span class="sticker-resize-handle" title="Drag to resize stamp" aria-label="Resize stamp">⤡</span>
      `;

      const emojiSpan = node.querySelector('.sticker-emoji');
      const imgElem = node.querySelector('.sticker-img');

      const updateNodeTransform = () => {
        const curScale = ((sticker.size || 54) / 54) * 36;
        const curAspect = sticker.aspectRatio || 1.0;
        let curW, curH;
        if (curAspect >= 1) {
          curW = curScale * 1.4 * curAspect;
          curH = curScale * 1.4;
        } else {
          curW = curScale * 1.4;
          curH = (curScale * 1.4) / curAspect;
        }
        const curFlipTransform = `scale(${sticker.flipX ? -1 : 1}, ${sticker.flipY ? -1 : 1}) rotate(${sticker.rotation || 0}deg)`;
        if (emojiSpan) {
          emojiSpan.style.fontSize = `${curScale}px`;
          emojiSpan.style.transform = curFlipTransform;
        }
        if (imgElem) {
          imgElem.style.width = `${curW}px`;
          imgElem.style.height = `${curH}px`;
          imgElem.style.transform = curFlipTransform;
        }
        const curBoxW = Math.max(64, Math.round(curW + 18));
        const curBoxH = Math.max(64, Math.round(curH + 18));
        node.style.width = `${curBoxW}px`;
        node.style.height = `${curBoxH}px`;
        node.style.left = `${sticker.x * 100}%`;
        node.style.top = `${sticker.y * 100}%`;
        node.style.opacity = sticker.opacity !== undefined ? sticker.opacity : 1.0;
      };

      let wheelStartTransform = null;
      let wheelCommitTimeout = null;

      node.addEventListener('wheel', (e) => {
        if (sticker.locked) return;
        e.preventDefault();
        e.stopPropagation();

        selectSticker(sticker.id);

        if (!wheelStartTransform) {
          wheelStartTransform = { size: sticker.size || 54, rotation: sticker.rotation || 0 };
        }

        if (e.ctrlKey) {
          const zoomDelta = -e.deltaY * 0.8;
          sticker.size = Math.max(22, Math.min(220, (sticker.size || 54) + zoomDelta));
          collageRenderer.updateStickerSize(sticker.id, sticker.size);
        } else if (e.shiftKey || e.altKey) {
          const rotDelta = e.deltaY * 0.4;
          sticker.rotation = ((sticker.rotation || 0) + rotDelta) % 360;
          collageRenderer.updateStickerRotation(sticker.id, sticker.rotation);
        } else {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            const sizeDelta = -e.deltaY * 0.4;
            sticker.size = Math.max(22, Math.min(220, (sticker.size || 54) + sizeDelta));
            collageRenderer.updateStickerSize(sticker.id, sticker.size);
          }
          if (Math.abs(e.deltaX) > 2) {
            const rotDelta = e.deltaX * 0.4;
            sticker.rotation = ((sticker.rotation || 0) + rotDelta) % 360;
            collageRenderer.updateStickerRotation(sticker.id, sticker.rotation);
          }
        }

        updateNodeTransform();
        debouncedCanvasRender();

        clearTimeout(wheelCommitTimeout);
        wheelCommitTimeout = setTimeout(() => {
          if (wheelStartTransform) {
            const finalTransform = { size: sticker.size || 54, rotation: sticker.rotation || 0 };
            const beforeTr = { ...wheelStartTransform };
            if (Math.abs(beforeTr.size - finalTransform.size) > 2 || Math.abs(beforeTr.rotation - finalTransform.rotation) > 2) {
              historyManager.push({
                type: 'sticker-transform',
                description: 'Adjusted stamp',
                undo: async () => {
                  collageRenderer.updateStickerTransform(sticker.id, beforeTr);
                  await updateCollagePreview();
                },
                redo: async () => {
                  collageRenderer.updateStickerTransform(sticker.id, finalTransform);
                  await updateCollagePreview();
                },
              });
            }
            wheelStartTransform = null;
          }
        }, 350);
      }, { passive: false });

      let isDragging = false;
      let dragStartPos = null;

      const onPointerDown = (e) => {
        if (e.target.closest('.sticker-del-btn') || 
            e.target.closest('.sticker-rotate-btn') || 
            e.target.closest('.sticker-resize-handle')) {
          return;
        }

        selectSticker(sticker.id);

        if (sticker.locked) return;

        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        dragStartPos = { x: sticker.x, y: sticker.y };
        node.style.zIndex = '100';

        const containerRect = canvasContainer.getBoundingClientRect();
        const cWidth = containerRect.width || 1;
        const cHeight = containerRect.height || 1;

        const startMouseX = e.touches ? e.touches[0].clientX : e.clientX;
        const startMouseY = e.touches ? e.touches[0].clientY : e.clientY;
        const startStickerX = sticker.x;
        const startStickerY = sticker.y;

        const onPointerMove = (moveEvent) => {
          if (!isDragging) return;
          if (moveEvent.cancelable) moveEvent.preventDefault();
          const curX = moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX;
          const curY = moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY;

          const deltaX = (curX - startMouseX) / cWidth;
          const deltaY = (curY - startMouseY) / cHeight;
          const newX = Math.max(-0.05, Math.min(1.05, startStickerX + deltaX));
          const newY = Math.max(-0.05, Math.min(1.05, startStickerY + deltaY));

          sticker.x = newX;
          sticker.y = newY;
          collageRenderer.updateStickerPosition(sticker.id, newX, newY);
          node.style.left = `${newX * 100}%`;
          node.style.top = `${newY * 100}%`;
          rafCanvasRender();
        };

        const onPointerUp = async () => {
          if (isDragging) {
            isDragging = false;
            node.style.zIndex = '';
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('mouseup', onPointerUp);
            document.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('touchend', onPointerUp);
            document.removeEventListener('touchcancel', onPointerUp);

            const beforePos = dragStartPos;
            const afterPos = { x: sticker.x, y: sticker.y };
            dragStartPos = null;

            if (beforePos && (Math.abs(beforePos.x - afterPos.x) > 0.003 || Math.abs(beforePos.y - afterPos.y) > 0.003)) {
              historyManager.push({
                type: 'sticker-move',
                description: 'Moved stamp',
                undo: async () => {
                  collageRenderer.updateStickerPosition(sticker.id, beforePos.x, beforePos.y);
                  await updateCollagePreview();
                },
                redo: async () => {
                  collageRenderer.updateStickerPosition(sticker.id, afterPos.x, afterPos.y);
                  await updateCollagePreview();
                },
              });
            }

            const photos = photoManager.getAll();
            await collageRenderer.render(photos);
          }
        };

        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('mouseup', onPointerUp);
        document.addEventListener('touchmove', onPointerMove, { passive: false });
        document.addEventListener('touchend', onPointerUp);
        document.addEventListener('touchcancel', onPointerUp);
      };

      node.addEventListener('mousedown', onPointerDown);
      node.addEventListener('touchstart', onPointerDown, { passive: false });

      const rotateBtn = node.querySelector('.sticker-rotate-btn');
      if (rotateBtn) {
        const onRotateStart = (e) => {
          if (sticker.locked) return;
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();

          const beforeRot = sticker.rotation || 0;
          const rect = node.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const onRotateMove = (moveEvt) => {
            if (moveEvt.cancelable) moveEvt.preventDefault();
            const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;

            const rad = Math.atan2(curY - centerY, curX - centerX);
            const deg = Math.round(rad * (180 / Math.PI) + 90);

            sticker.rotation = deg;
            collageRenderer.updateStickerRotation(sticker.id, deg);
            updateNodeTransform();
            rafCanvasRender();
          };

          const onRotateUp = async () => {
            document.removeEventListener('mousemove', onRotateMove);
            document.removeEventListener('mouseup', onRotateUp);
            document.removeEventListener('touchmove', onRotateMove);
            document.removeEventListener('touchend', onRotateUp);
            document.removeEventListener('touchcancel', onRotateUp);

            const afterRot = sticker.rotation || 0;
            if (Math.abs(beforeRot - afterRot) > 1) {
              historyManager.push({
                type: 'sticker-rotate',
                description: 'Rotated stamp',
                undo: async () => {
                  collageRenderer.updateStickerRotation(sticker.id, beforeRot);
                  await updateCollagePreview();
                },
                redo: async () => {
                  collageRenderer.updateStickerRotation(sticker.id, afterRot);
                  await updateCollagePreview();
                },
              });
            }

            const photos = photoManager.getAll();
            await collageRenderer.render(photos);
          };

          document.addEventListener('mousemove', onRotateMove);
          document.addEventListener('mouseup', onRotateUp);
          document.addEventListener('touchmove', onRotateMove, { passive: false });
          document.addEventListener('touchend', onRotateUp);
          document.addEventListener('touchcancel', onRotateUp);
        };

        rotateBtn.addEventListener('mousedown', onRotateStart);
        rotateBtn.addEventListener('touchstart', onRotateStart, { passive: false });
      }

      const resizeHandle = node.querySelector('.sticker-resize-handle');
      if (resizeHandle) {
        const onResizeStart = (e) => {
          if (sticker.locked) return;
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();

          const beforeSize = sticker.size || 54;
          const rect = node.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const onResizeMove = (moveEvt) => {
            if (moveEvt.cancelable) moveEvt.preventDefault();
            const curX = moveEvt.touches ? moveEvt.touches[0].clientX : moveEvt.clientX;
            const curY = moveEvt.touches ? moveEvt.touches[0].clientY : moveEvt.clientY;
            const dist = Math.hypot(curX - centerX, curY - centerY);

            const newSize = Math.max(22, Math.min(220, Math.round(dist * 2.2)));
            sticker.size = newSize;
            collageRenderer.updateStickerSize(sticker.id, newSize);
            updateNodeTransform();
            rafCanvasRender();
          };

          const onResizeUp = async () => {
            document.removeEventListener('mousemove', onResizeMove);
            document.removeEventListener('mouseup', onResizeUp);
            document.removeEventListener('touchmove', onResizeMove);
            document.removeEventListener('touchend', onResizeUp);
            document.removeEventListener('touchcancel', onResizeUp);

            const afterSize = sticker.size || 54;
            if (Math.abs(beforeSize - afterSize) > 2) {
              historyManager.push({
                type: 'sticker-resize',
                description: 'Resized stamp',
                undo: async () => {
                  collageRenderer.updateStickerSize(sticker.id, beforeSize);
                  await updateCollagePreview();
                },
                redo: async () => {
                  collageRenderer.updateStickerSize(sticker.id, afterSize);
                  await updateCollagePreview();
                },
              });
            }

            const photos = photoManager.getAll();
            await collageRenderer.render(photos);
          };

          document.addEventListener('mousemove', onResizeMove);
          document.addEventListener('mouseup', onResizeUp);
          document.addEventListener('touchmove', onResizeMove, { passive: false });
          document.addEventListener('touchend', onResizeUp);
          document.addEventListener('touchcancel', onResizeUp);
        };

        resizeHandle.addEventListener('mousedown', onResizeStart);
        resizeHandle.addEventListener('touchstart', onResizeStart, { passive: false });
      }

      const delBtn = node.querySelector('.sticker-del-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          soundManager.playButtonClick();

          const removedSticker = { ...sticker };
          collageRenderer.removeSticker(sticker.id);
          selectedStickerId = null;

          historyManager.push({
            type: 'sticker-delete',
            description: 'Removed stamp',
            undo: async () => {
              if (!collageRenderer.settings.stickers.some(s => s.id === removedSticker.id)) {
                collageRenderer.settings.stickers.push(removedSticker);
              }
              selectedStickerId = removedSticker.id;
              await updateCollagePreview();
            },
            redo: async () => {
              collageRenderer.removeSticker(removedSticker.id);
              selectedStickerId = null;
              await updateCollagePreview();
            },
          });

          await updateCollagePreview();
        });
      }

      canvasStickersLayer.appendChild(node);
    });
  }

  function debouncedCanvasRender() {
    rafCanvasRender();
  }

  window.addEventListener('keydown', async (e) => {
    if (!selectedStickerId || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
    if (!sticker) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      deselectSticker();
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      soundManager.playButtonClick();
      const duplicated = collageRenderer.duplicateSticker(sticker.id);
      if (duplicated) {
        selectedStickerId = duplicated.id;
        historyManager.push({
          type: 'sticker-duplicate',
          description: 'Duplicated stamp',
          undo: async () => {
            collageRenderer.removeSticker(duplicated.id);
            selectedStickerId = sticker.id;
            await updateCollagePreview();
          },
          redo: async () => {
            if (!collageRenderer.settings.stickers.some(s => s.id === duplicated.id)) {
              collageRenderer.settings.stickers.push(duplicated);
            }
            selectedStickerId = duplicated.id;
            await updateCollagePreview();
          },
        });
      }
      await updateCollagePreview();
      return;
    }

    if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      soundManager.playButtonClick();
      collageRenderer.flipSticker(sticker.id, 'x');
      historyManager.push({
        type: 'sticker-flip-x',
        description: 'Flipped stamp horizontally',
        undo: async () => {
          collageRenderer.flipSticker(sticker.id, 'x');
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.flipSticker(sticker.id, 'x');
          await updateCollagePreview();
        },
      });
      await updateCollagePreview();
      return;
    }

    if (e.key.toLowerCase() === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      soundManager.playButtonClick();
      collageRenderer.flipSticker(sticker.id, 'y');
      historyManager.push({
        type: 'sticker-flip-y',
        description: 'Flipped stamp vertically',
        undo: async () => {
          collageRenderer.flipSticker(sticker.id, 'y');
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.flipSticker(sticker.id, 'y');
          await updateCollagePreview();
        },
      });
      await updateCollagePreview();
      return;
    }

    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && !e.altKey && !sticker.locked) {
      e.preventDefault();
      const step = e.shiftKey ? 0.03 : 0.008;
      const beforePos = { x: sticker.x, y: sticker.y };
      let deltaX = 0;
      let deltaY = 0;

      if (e.key === 'ArrowLeft') deltaX = -step;
      if (e.key === 'ArrowRight') deltaX = step;
      if (e.key === 'ArrowUp') deltaY = -step;
      if (e.key === 'ArrowDown') deltaY = step;

      const afterPos = {
        x: Math.max(0.05, Math.min(0.95, sticker.x + deltaX)),
        y: Math.max(0.05, Math.min(0.95, sticker.y + deltaY)),
      };

      collageRenderer.updateStickerPosition(sticker.id, afterPos.x, afterPos.y);
      await updateCollagePreview();

      historyManager.push({
        type: 'sticker-move',
        description: 'Nudged stamp',
        undo: async () => {
          collageRenderer.updateStickerPosition(sticker.id, beforePos.x, beforePos.y);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.updateStickerPosition(sticker.id, afterPos.x, afterPos.y);
          await updateCollagePreview();
        },
      });
      return;
    }

    if ((e.key === '+' || e.key === '=') && !sticker.locked) {
      e.preventDefault();
      const beforeSize = sticker.size || 54;
      const afterSize = Math.min(200, beforeSize + 6);
      sticker.size = afterSize;
      collageRenderer.updateStickerSize(sticker.id, afterSize);
      await updateCollagePreview();

      historyManager.push({
        type: 'sticker-resize',
        description: 'Resized stamp',
        undo: async () => {
          collageRenderer.updateStickerSize(sticker.id, beforeSize);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.updateStickerSize(sticker.id, afterSize);
          await updateCollagePreview();
        },
      });
    } else if ((e.key === '-' || e.key === '_') && !sticker.locked) {
      e.preventDefault();
      const beforeSize = sticker.size || 54;
      const afterSize = Math.max(22, beforeSize - 6);
      sticker.size = afterSize;
      collageRenderer.updateStickerSize(sticker.id, afterSize);
      await updateCollagePreview();

      historyManager.push({
        type: 'sticker-resize',
        description: 'Resized stamp',
        undo: async () => {
          collageRenderer.updateStickerSize(sticker.id, beforeSize);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.updateStickerSize(sticker.id, afterSize);
          await updateCollagePreview();
        },
      });
    } else if ((e.key === '[' || (e.altKey && e.key === 'ArrowLeft')) && !sticker.locked) {
      e.preventDefault();
      const beforeRot = sticker.rotation || 0;
      const afterRot = (beforeRot - 10) % 360;
      sticker.rotation = afterRot;
      collageRenderer.updateStickerRotation(sticker.id, afterRot);
      await updateCollagePreview();

      historyManager.push({
        type: 'sticker-rotate',
        description: 'Rotated stamp',
        undo: async () => {
          collageRenderer.updateStickerRotation(sticker.id, beforeRot);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.updateStickerRotation(sticker.id, afterRot);
          await updateCollagePreview();
        },
      });
    } else if ((e.key === ']' || (e.altKey && e.key === 'ArrowRight')) && !sticker.locked) {
      e.preventDefault();
      const beforeRot = sticker.rotation || 0;
      const afterRot = (beforeRot + 10) % 360;
      sticker.rotation = afterRot;
      collageRenderer.updateStickerRotation(sticker.id, afterRot);
      await updateCollagePreview();

      historyManager.push({
        type: 'sticker-rotate',
        description: 'Rotated stamp',
        undo: async () => {
          collageRenderer.updateStickerRotation(sticker.id, beforeRot);
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.updateStickerRotation(sticker.id, afterRot);
          await updateCollagePreview();
        },
      });
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      soundManager.playButtonClick();
      const removedSticker = { ...sticker };
      collageRenderer.removeSticker(sticker.id);
      selectedStickerId = null;

      historyManager.push({
        type: 'sticker-delete',
        description: 'Removed stamp',
        undo: async () => {
          if (!collageRenderer.settings.stickers.some(s => s.id === removedSticker.id)) {
            collageRenderer.settings.stickers.push(removedSticker);
          }
          selectedStickerId = removedSticker.id;
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.removeSticker(removedSticker.id);
          selectedStickerId = null;
          await updateCollagePreview();
        },
      });

      await updateCollagePreview();
    }
  });

  function renderActiveStampsList() {
    if (!activeStampsList) return;
    const stickers = collageRenderer.settings.stickers || [];
    activeStampsCountLabel.textContent = `Active Stamps (${stickers.length})`;

    if (stickers.length === 0) {
      activeStampsList.innerHTML = `<span style="font-size: 11px; color: var(--color-charcoal-subtle); padding: 4px;">No stamps added yet. Tap an emoji above!</span>`;
      btnClearStamps.style.display = 'none';
      return;
    }

    btnClearStamps.style.display = 'inline-block';
    activeStampsList.innerHTML = '';

    stickers.forEach((sticker) => {
      const chip = document.createElement('div');
      const isSelected = selectedStickerId === sticker.id;
      chip.className = 'active-stamp-chip' + (isSelected ? ' selected' : '');

      let iconHTML = '';
      if (sticker.imgSrc) {
        iconHTML = `<img src="${sticker.imgSrc}" style="width: 18px; height: 18px; object-fit: contain; border-radius: 3px; display: inline-block; vertical-align: middle;" alt="Stamp" />`;
      } else {
        iconHTML = `<span>${sticker.emoji}</span>`;
      }

      const lockBadge = sticker.locked ? `<span class="lock-badge">🔒</span>` : '';

      chip.innerHTML = `
        ${iconHTML}
        ${lockBadge}
        <span class="remove-x" title="Delete this stamp">✕</span>
      `;
      chip.title = `Click to select & inspect ${sticker.emoji || 'stamp'}`;

      chip.addEventListener('click', (e) => {
        if (e.target.closest('.remove-x')) return;
        soundManager.playButtonClick();
        selectSticker(sticker.id);
      });

      const removeX = chip.querySelector('.remove-x');
      removeX.addEventListener('click', async (e) => {
        e.stopPropagation();
        soundManager.playButtonClick();
        const removedSticker = { ...sticker };
        collageRenderer.removeSticker(sticker.id);
        if (selectedStickerId === sticker.id) selectedStickerId = null;

        historyManager.push({
          type: 'sticker-delete',
          description: 'Removed stamp',
          undo: async () => {
            if (!collageRenderer.settings.stickers.some(s => s.id === removedSticker.id)) {
              collageRenderer.settings.stickers.push(removedSticker);
            }
            selectedStickerId = removedSticker.id;
            await updateCollagePreview();
          },
          redo: async () => {
            collageRenderer.removeSticker(removedSticker.id);
            if (selectedStickerId === removedSticker.id) selectedStickerId = null;
            await updateCollagePreview();
          },
        });

        await updateCollagePreview();
      });

      activeStampsList.appendChild(chip);
    });
  }

  btnClearStamps.addEventListener('click', async () => {
    soundManager.playButtonClick();
    const previousStickers = (collageRenderer.settings.stickers || []).map(s => ({ ...s }));
    if (previousStickers.length === 0) return;

    collageRenderer.clearStickers();
    selectedStickerId = null;

    historyManager.push({
      type: 'stickers-clear',
      description: 'Cleared all stamps',
      undo: async () => {
        collageRenderer.settings.stickers = previousStickers.map(s => ({ ...s }));
        await updateCollagePreview();
      },
      redo: async () => {
        collageRenderer.clearStickers();
        selectedStickerId = null;
        await updateCollagePreview();
      },
    });

    await updateCollagePreview();
  });

  if (collageAccordion) {
    collageAccordion.addEventListener('click', (e) => {
      const header = e.target.closest('.accordion-header');
      if (!header) return;
      soundManager.playButtonClick();
      const section = header.dataset.section;
      if (section) {
        toggleAccordionSection(section);
      }
    });

    collageAccordion.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const header = e.target.closest('.accordion-header');
        if (header) {
          e.preventDefault();
          header.click();
        }
      }
    });
  }

  if (layoutCategoryTabs) {
    layoutCategoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.layout-cat-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      document.querySelectorAll('.layout-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLayoutCat = btn.dataset.cat;
      renderLayoutPicker(activeLayoutCat);
    });
  }

  if (presetStylesRibbon) {
    presetStylesRibbon.addEventListener('click', async (e) => {
      const card = e.target.closest('.preset-style-card');
      if (!card) return;
      soundManager.playButtonClick();

      const presetId = card.dataset.preset;
      const preset = STYLE_PRESETS.find(p => p.id === presetId);
      if (!preset) return;

      const previousSettings = { ...collageRenderer.settings };

      const applyPreset = async (pId) => {
        document.querySelectorAll('.preset-style-card').forEach(c => c.classList.toggle('active', c.dataset.preset === pId));
        collageRenderer.settings.slotTransforms = {};
        selectedSlotIndex = -1;
        collageRenderer.applyStylePreset(pId);

        if (spacingSlider) {
          spacingSlider.value = collageRenderer.settings.spacing;
          spacingValText.textContent = `${collageRenderer.settings.spacing}px`;
        }
        if (paddingSlider) {
          paddingSlider.value = collageRenderer.settings.padding;
          paddingValText.textContent = `${collageRenderer.settings.padding}px`;
        }
        if (borderRadiusSlider) {
          borderRadiusSlider.value = collageRenderer.settings.borderRadius;
          borderRadiusValText.textContent = `${collageRenderer.settings.borderRadius}px`;
        }
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === collageRenderer.settings.frameColor));
        document.querySelectorAll('#aspectRatioGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === collageRenderer.settings.aspectRatio));
        document.querySelectorAll('#frameStyleGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.style === collageRenderer.settings.frameStyle));
        document.querySelectorAll('#collageFilterTray .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === collageRenderer.settings.filter));
        if (footerFontSelect) footerFontSelect.value = collageRenderer.settings.fontFamily || 'Space Grotesk';

        updateSlotInspectorUI();
        renderLayoutPicker(activeLayoutCat);
        await updateCollagePreview();
      };

      await applyPreset(presetId);
      historyManager.push({
        type: 'preset-apply',
        description: `Applied preset "${preset.name}"`,
        undo: async () => {
          collageRenderer.updateSettings(previousSettings);
          renderLayoutPicker(activeLayoutCat);
          await updateCollagePreview();
        },
        redo: async () => applyPreset(presetId),
      });
    });
  }

  if (btnSurpriseCollage) {
    btnSurpriseCollage.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const previousSettings = JSON.parse(JSON.stringify(collageRenderer.settings));
      const photos = photoManager.getAll();
      const surpriseConfig = randomizerEngine.generateCollageSurprise(photos.length || 4);

      const applySurprise = async (cfg) => {
        collageRenderer.settings.slotTransforms = {};
        selectedSlotIndex = -1;
        collageRenderer.updateSettings({
          layout: cfg.layoutId,
          aspectRatio: cfg.aspectRatio,
          frameStyle: cfg.frameStyle,
          frameColor: cfg.frameColor,
          spacing: cfg.spacing,
          padding: cfg.padding,
          borderRadius: cfg.borderRadius,
          filter: cfg.filterId,
          filterIntensity: cfg.filterIntensity,
          fontFamily: cfg.fontFamily,
          stampText: cfg.stampText,
          textAlign: cfg.textAlign,
        });

        if (cfg.stickers && cfg.stickers.length > 0) {
          cfg.stickers.forEach(st => {
            if (!collageRenderer.settings.stickers.some(s => s.id === st.id)) {
              collageRenderer.settings.stickers.push(st);
            }
          });
        }

        if (spacingSlider) {
          spacingSlider.value = collageRenderer.settings.spacing;
          spacingValText.textContent = `${collageRenderer.settings.spacing}px`;
        }
        if (paddingSlider) {
          paddingSlider.value = collageRenderer.settings.padding;
          paddingValText.textContent = `${collageRenderer.settings.padding}px`;
        }
        if (borderRadiusSlider) {
          borderRadiusSlider.value = collageRenderer.settings.borderRadius;
          borderRadiusValText.textContent = `${collageRenderer.settings.borderRadius}px`;
        }
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === collageRenderer.settings.frameColor));
        document.querySelectorAll('#aspectRatioGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === collageRenderer.settings.aspectRatio));
        document.querySelectorAll('#frameStyleGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.style === collageRenderer.settings.frameStyle));
        document.querySelectorAll('#collageFilterTray .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === collageRenderer.settings.filter));
        if (footerFontSelect) footerFontSelect.value = collageRenderer.settings.fontFamily || 'Space Grotesk';

        updateSlotInspectorUI();
        renderLayoutPicker(activeLayoutCat);
        await updateCollagePreview();
      };

      await applySurprise(surpriseConfig);
      historyManager.push({
        type: 'surprise-collage',
        description: `Surprise Print (${surpriseConfig.familyName})`,
        undo: async () => {
          collageRenderer.updateSettings(previousSettings);
          renderLayoutPicker(activeLayoutCat);
          await updateCollagePreview();
        },
        redo: async () => applySurprise(surpriseConfig),
      });
      showHistoryToast(`🎲 Surprise ${surpriseConfig.familyName} style applied!`);
    });
  }

  if (aspectRatioGroup) {
    aspectRatioGroup.addEventListener('click', async (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();

      const prevAspect = collageRenderer.settings.aspectRatio;
      const newAspect = btn.dataset.aspect;
      if (prevAspect === newAspect) return;

      const applyAspect = async (aspect) => {
        document.querySelectorAll('#aspectRatioGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.aspect === aspect));
        collageRenderer.settings.slotTransforms = {};
        selectedSlotIndex = -1;
        collageRenderer.updateSettings({ aspectRatio: aspect });
        updateSlotInspectorUI();
        await updateCollagePreview();
      };

      await applyAspect(newAspect);
      historyManager.push({
        type: 'aspect-ratio-change',
        description: `Changed aspect ratio to ${newAspect}`,
        undo: async () => applyAspect(prevAspect),
        redo: async () => applyAspect(newAspect),
      });
    });
  }

  if (frameStyleGroup) {
    frameStyleGroup.addEventListener('click', async (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();

      const prevStyle = collageRenderer.settings.frameStyle;
      const newStyle = btn.dataset.style;
      if (prevStyle === newStyle) return;

      const applyFrameStyle = async (fStyle) => {
        document.querySelectorAll('#frameStyleGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.style === fStyle));
        collageRenderer.settings.slotTransforms = {};
        selectedSlotIndex = -1;
        collageRenderer.updateSettings({ frameStyle: fStyle });
        updateSlotInspectorUI();
        await updateCollagePreview();
      };

      await applyFrameStyle(newStyle);
      historyManager.push({
        type: 'frame-style-change',
        description: `Changed frame style to ${newStyle}`,
        undo: async () => applyFrameStyle(prevStyle),
        redo: async () => applyFrameStyle(newStyle),
      });
    });
  }

  if (photoShapeGroup) {
    photoShapeGroup.addEventListener('click', async (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();

      const prevShape = collageRenderer.settings.photoShape || 'rounded';
      const newShape = btn.dataset.shape;
      if (prevShape === newShape) return;

      const applyShape = async (shape) => {
        document.querySelectorAll('#photoShapeGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.shape === shape));
        collageRenderer.settings.slotTransforms = {};
        selectedSlotIndex = -1;
        collageRenderer.updateSettings({ photoShape: shape });
        updateSlotInspectorUI();
        await updateCollagePreview();
      };

      await applyShape(newShape);
      historyManager.push({
        type: 'photo-shape-change',
        description: `Changed photo cutout shape to ${newShape}`,
        undo: async () => applyShape(prevShape),
        redo: async () => applyShape(newShape),
      });
    });
  }

  if (customColorPicker) {
    let customColBefore = collageRenderer.settings.frameColor;
    customColorPicker.addEventListener('focus', () => {
      customColBefore = collageRenderer.settings.frameColor;
    });

    customColorPicker.addEventListener('input', async (e) => {
      const hex = e.target.value;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      collageRenderer.updateSettings({ frameColor: hex });
      await updateCollagePreview();
    });

    customColorPicker.addEventListener('change', (e) => {
      const hexAfter = e.target.value;
      if (customColBefore === hexAfter) return;
      const beforeCol = customColBefore;
      const afterCol = hexAfter;

      historyManager.push({
        type: 'custom-color-change',
        description: 'Picked custom paper color',
        undo: async () => {
          customColorPicker.value = beforeCol;
          collageRenderer.updateSettings({ frameColor: beforeCol });
          await updateCollagePreview();
        },
        redo: async () => {
          customColorPicker.value = afterCol;
          collageRenderer.updateSettings({ frameColor: afterCol });
          await updateCollagePreview();
        },
      });
      customColBefore = hexAfter;
    });
  }

  colorSwatches.addEventListener('click', async (e) => {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;
    soundManager.playButtonClick();

    const prevColor = collageRenderer.settings.frameColor;
    const prevText = collageRenderer.settings.textColor;
    const newColor = swatch.dataset.color;
    const newText = swatch.dataset.text;
    if (prevColor === newColor) return;

    const applyColor = async (col, txt) => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === col));
      collageRenderer.updateSettings({ frameColor: col, textColor: txt });
      await updateCollagePreview();
    };

    await applyColor(newColor, newText);
    historyManager.push({
      type: 'color-change',
      description: 'Changed frame color',
      undo: async () => applyColor(prevColor, prevText),
      redo: async () => applyColor(newColor, newText),
    });
  });

  let spacingBefore = collageRenderer.settings.spacing;
  spacingSlider.addEventListener('focus', () => {
    spacingBefore = collageRenderer.settings.spacing;
  });

  spacingSlider.addEventListener('input', async (e) => {
    const val = parseInt(e.target.value, 10);
    spacingValText.textContent = `${val}px`;
    collageRenderer.updateSettings({ spacing: val });
    await updateCollagePreview({ skipDom: true });
  });

  spacingSlider.addEventListener('change', (e) => {
    const spacingAfter = parseInt(e.target.value, 10);
    updateCollagePreview({ skipDom: false });
    if (spacingBefore === spacingAfter) return;
    const beforeVal = spacingBefore;
    const afterVal = spacingAfter;

    historyManager.push({
      type: 'spacing-change',
      description: 'Changed photo spacing',
      undo: async () => {
        spacingSlider.value = beforeVal;
        spacingValText.textContent = `${beforeVal}px`;
        collageRenderer.updateSettings({ spacing: beforeVal });
        await updateCollagePreview();
      },
      redo: async () => {
        spacingSlider.value = afterVal;
        spacingValText.textContent = `${afterVal}px`;
        collageRenderer.updateSettings({ spacing: afterVal });
        await updateCollagePreview();
      },
    });
    spacingBefore = spacingAfter;
  });

  if (paddingSlider) {
    let paddingBefore = collageRenderer.settings.padding;
    paddingSlider.addEventListener('focus', () => {
      paddingBefore = collageRenderer.settings.padding;
    });

    paddingSlider.addEventListener('input', async (e) => {
      const val = parseInt(e.target.value, 10);
      if (paddingValText) paddingValText.textContent = `${val}px`;
      collageRenderer.updateSettings({ padding: val });
      await updateCollagePreview({ skipDom: true });
    });

    paddingSlider.addEventListener('change', (e) => {
      const paddingAfter = parseInt(e.target.value, 10);
      updateCollagePreview({ skipDom: false });
      if (paddingBefore === paddingAfter) return;
      const beforeVal = paddingBefore;
      const afterVal = paddingAfter;

      historyManager.push({
        type: 'padding-change',
        description: 'Changed outer margin',
        undo: async () => {
          paddingSlider.value = beforeVal;
          if (paddingValText) paddingValText.textContent = `${beforeVal}px`;
          collageRenderer.updateSettings({ padding: beforeVal });
          await updateCollagePreview();
        },
        redo: async () => {
          paddingSlider.value = afterVal;
          if (paddingValText) paddingValText.textContent = `${afterVal}px`;
          collageRenderer.updateSettings({ padding: afterVal });
          await updateCollagePreview();
        },
      });
      paddingBefore = paddingAfter;
    });
  }

  if (borderRadiusSlider) {
    let radiusBefore = collageRenderer.settings.borderRadius;
    borderRadiusSlider.addEventListener('focus', () => {
      radiusBefore = collageRenderer.settings.borderRadius;
    });

    borderRadiusSlider.addEventListener('input', async (e) => {
      const val = parseInt(e.target.value, 10);
      if (borderRadiusValText) borderRadiusValText.textContent = `${val}px`;
      collageRenderer.updateSettings({ borderRadius: val });
      await updateCollagePreview({ skipDom: false });
    });

    borderRadiusSlider.addEventListener('change', (e) => {
      const radiusAfter = parseInt(e.target.value, 10);
      updateCollagePreview({ skipDom: false });
      if (radiusBefore === radiusAfter) return;
      const beforeVal = radiusBefore;
      const afterVal = radiusAfter;

      historyManager.push({
        type: 'border-radius-change',
        description: 'Changed corner roundness',
        undo: async () => {
          borderRadiusSlider.value = beforeVal;
          if (borderRadiusValText) borderRadiusValText.textContent = `${beforeVal}px`;
          collageRenderer.updateSettings({ borderRadius: beforeVal });
          await updateCollagePreview();
        },
        redo: async () => {
          borderRadiusSlider.value = afterVal;
          if (borderRadiusValText) borderRadiusValText.textContent = `${afterVal}px`;
          collageRenderer.updateSettings({ borderRadius: afterVal });
          await updateCollagePreview();
        },
      });
      radiusBefore = radiusAfter;
    });
  }

  if (slotZoomSlider) {
    let zoomBefore = 1.0;
    slotZoomSlider.addEventListener('focus', () => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      zoomBefore = collageRenderer.getSlotTransform(slotIdx).zoom || 1.0;
    });

    slotZoomSlider.addEventListener('input', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const val = +(parseInt(e.target.value, 10) / 100).toFixed(2);
      if (slotZoomValText) slotZoomValText.textContent = `${val.toFixed(1)}x`;
      collageRenderer.setSlotTransform(slotIdx, { zoom: val });
      rafCanvasRender();
    });

    slotZoomSlider.addEventListener('change', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const zoomAfter = +(parseInt(e.target.value, 10) / 100).toFixed(2);
      if (Math.abs(zoomBefore - zoomAfter) < 0.01) return;
      const beforeVal = zoomBefore;
      const afterVal = zoomAfter;

      historyManager.push({
        type: 'slot-zoom',
        description: `Zoomed photo #${slotIdx + 1}`,
        undo: async () => {
          smoothZoomSlot(slotIdx, beforeVal, { duration: 120 });
        },
        redo: async () => {
          smoothZoomSlot(slotIdx, afterVal, { duration: 120 });
        },
      });
      zoomBefore = zoomAfter;
    });

    slotZoomSlider.addEventListener('wheel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      let rawDelta = e.deltaY;
      if (e.deltaMode === 1) rawDelta *= 24;
      else if (e.deltaMode === 2) rawDelta *= 400;

      const isPinch = e.ctrlKey || Math.abs(rawDelta) < 12;
      const sensitivity = isPinch ? 0.015 : 0.0055;
      const delta = -rawDelta * sensitivity;
      const targetZoom = Math.max(1.0, Math.min(2.5, +(curTransform.zoom + delta).toFixed(3)));
      smoothZoomSlot(slotIdx, targetZoom, { duration: isPinch ? 0 : 40 });
    }, { passive: false });
  }

  if (slotPanXSlider) {
    let panXBefore = 0;
    slotPanXSlider.addEventListener('focus', () => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      panXBefore = collageRenderer.getSlotTransform(slotIdx).panX || 0;
    });

    slotPanXSlider.addEventListener('input', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const val = parseInt(e.target.value, 10);
      if (slotPanXValText) slotPanXValText.textContent = `${val > 0 ? '+' : ''}${val}%`;
      collageRenderer.setSlotTransform(slotIdx, { panX: val });
      rafCanvasRender();
    });

    slotPanXSlider.addEventListener('change', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const panXAfter = parseInt(e.target.value, 10);
      if (panXBefore === panXAfter) return;
      const beforeVal = panXBefore;
      const afterVal = panXAfter;

      historyManager.push({
        type: 'slot-pan-x',
        description: `Panned photo #${slotIdx + 1} horizontally`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { panX: beforeVal });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { panX: afterVal });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
      panXBefore = panXAfter;
    });
  }

  if (slotPanYSlider) {
    let panYBefore = 0;
    slotPanYSlider.addEventListener('focus', () => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      panYBefore = collageRenderer.getSlotTransform(slotIdx).panY || 0;
    });

    slotPanYSlider.addEventListener('input', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const val = parseInt(e.target.value, 10);
      if (slotPanYValText) slotPanYValText.textContent = `${val > 0 ? '+' : ''}${val}%`;
      collageRenderer.setSlotTransform(slotIdx, { panY: val });
      rafCanvasRender();
    });

    slotPanYSlider.addEventListener('change', (e) => {
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const panYAfter = parseInt(e.target.value, 10);
      if (panYBefore === panYAfter) return;
      const beforeVal = panYBefore;
      const afterVal = panYAfter;

      historyManager.push({
        type: 'slot-pan-y',
        description: `Panned photo #${slotIdx + 1} vertically`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { panY: beforeVal });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { panY: afterVal });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
      panYBefore = panYAfter;
    });
  }

  if (btnSlotRotateCCW) {
    btnSlotRotateCCW.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      const prevRot = curTransform.rotation || 0;
      const newRot = (prevRot - 90 + 360) % 360;

      collageRenderer.setSlotTransform(slotIdx, { rotation: newRot });
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-rotate',
        description: `Rotated photo #${slotIdx + 1}`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { rotation: prevRot });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { rotation: newRot });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (btnSlotRotateCW) {
    btnSlotRotateCW.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      const prevRot = curTransform.rotation || 0;
      const newRot = (prevRot + 90) % 360;

      collageRenderer.setSlotTransform(slotIdx, { rotation: newRot });
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-rotate',
        description: `Rotated photo #${slotIdx + 1}`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { rotation: prevRot });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { rotation: newRot });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (btnSlotFlipH) {
    btnSlotFlipH.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      const newFlipH = !curTransform.flipH;

      collageRenderer.setSlotTransform(slotIdx, { flipH: newFlipH });
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-flip-h',
        description: `Flipped photo #${slotIdx + 1} horizontally`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { flipH: !newFlipH });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { flipH: newFlipH });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (btnSlotFlipV) {
    btnSlotFlipV.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      const newFlipV = !curTransform.flipV;

      collageRenderer.setSlotTransform(slotIdx, { flipV: newFlipV });
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-flip-v',
        description: `Flipped photo #${slotIdx + 1} vertically`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { flipV: !newFlipV });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { flipV: newFlipV });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (slotFilterSelect) {
    slotFilterSelect.addEventListener('change', async (e) => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const curTransform = collageRenderer.getSlotTransform(slotIdx);
      const prevFilter = curTransform.filter || '';
      const newFilter = e.target.value;
      if (prevFilter === newFilter) return;

      collageRenderer.setSlotTransform(slotIdx, { filter: newFilter || null });
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-filter',
        description: `Changed filter for photo #${slotIdx + 1}`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { filter: prevFilter || null });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.setSlotTransform(slotIdx, { filter: newFilter || null });
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (btnSwapSlotConfirm && slotSwapSelect) {
    btnSwapSlotConfirm.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotA = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const slotB = parseInt(slotSwapSelect.value, 10);
      if (slotA === slotB || isNaN(slotB)) return;

      collageRenderer.swapSlots(slotA, slotB);
      selectedSlotIndex = slotB;
      updateSlotInspectorUI();
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-swap',
        description: `Swapped slot #${slotA + 1} with #${slotB + 1}`,
        undo: async () => {
          collageRenderer.swapSlots(slotA, slotB);
          selectedSlotIndex = slotA;
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.swapSlots(slotA, slotB);
          selectedSlotIndex = slotB;
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  if (btnResetSlotTransform) {
    btnResetSlotTransform.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const slotIdx = selectedSlotIndex >= 0 ? selectedSlotIndex : 0;
      const beforeTransform = { ...collageRenderer.getSlotTransform(slotIdx) };

      collageRenderer.resetSlotTransform(slotIdx);
      updateSlotInspectorUI();
      await updateCollagePreview();

      historyManager.push({
        type: 'slot-reset',
        description: `Reset crop for photo #${slotIdx + 1}`,
        undo: async () => {
          collageRenderer.setSlotTransform(slotIdx, beforeTransform);
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
        redo: async () => {
          collageRenderer.resetSlotTransform(slotIdx);
          updateSlotInspectorUI();
          await updateCollagePreview();
        },
      });
    });
  }

  const stampVisibleToggle = document.getElementById('stampVisibleToggle');
  const btnClearStampText = document.getElementById('btnClearStampText');
  const stampPresetsGrid = document.getElementById('stampPresetsGrid');
  const stampDatePicker = document.getElementById('stampDatePicker');
  const stampColorSwatches = document.getElementById('stampColorSwatches');
  const stampTextColorPicker = document.getElementById('stampTextColorPicker');

  if (stampVisibleToggle) {
    stampVisibleToggle.checked = collageRenderer.settings.showStamp !== false;
    stampVisibleToggle.addEventListener('change', async (e) => {
      soundManager.playButtonClick();
      const isVisible = e.target.checked;
      collageRenderer.updateSettings({ showStamp: isVisible });
      await updateCollagePreview();
      showHistoryToast(isVisible ? 'Footer stamp enabled' : 'Footer stamp hidden');
    });
  }

  if (stampTextInput) {
    let prevStampText = collageRenderer.settings.stampText || '';
    stampTextInput.value = prevStampText;

    stampTextInput.addEventListener('focus', () => {
      prevStampText = stampTextInput.value;
    });

    stampTextInput.addEventListener('input', async (e) => {
      const val = e.target.value;
      collageRenderer.updateSettings({ stampText: val, showStamp: true });
      if (stampVisibleToggle) stampVisibleToggle.checked = true;
      updateAccordionSummaries();
      await updateCollagePreview({ skipDom: true });
    });

    stampTextInput.addEventListener('change', (e) => {
      const newText = e.target.value;
      updateCollagePreview({ skipDom: false });
      if (prevStampText === newText) return;
      const before = prevStampText;
      const after = newText;
      historyManager.push({
        type: 'stamp-text-change',
        description: 'Changed footer text',
        undo: async () => {
          if (stampTextInput) stampTextInput.value = before;
          collageRenderer.updateSettings({ stampText: before });
          await updateCollagePreview();
        },
        redo: async () => {
          if (stampTextInput) stampTextInput.value = after;
          collageRenderer.updateSettings({ stampText: after });
          await updateCollagePreview();
        },
      });
      prevStampText = newText;
    });
  }

  if (btnClearStampText) {
    btnClearStampText.addEventListener('click', async () => {
      soundManager.playButtonClick();
      if (!stampTextInput) return;
      const before = stampTextInput.value;
      stampTextInput.value = '';
      collageRenderer.updateSettings({ stampText: '' });
      await updateCollagePreview();
      historyManager.push({
        type: 'stamp-text-clear',
        description: 'Cleared footer text',
        undo: async () => {
          if (stampTextInput) stampTextInput.value = before;
          collageRenderer.updateSettings({ stampText: before });
          await updateCollagePreview();
        },
        redo: async () => {
          if (stampTextInput) stampTextInput.value = '';
          collageRenderer.updateSettings({ stampText: '' });
          await updateCollagePreview();
        },
      });
      showHistoryToast('Cleared footer text');
    });
  }

  if (stampPresetsGrid) {
    stampPresetsGrid.addEventListener('click', async (e) => {
      const btn = e.target.closest('.stamp-preset-chip');
      if (!btn || btn.tagName === 'INPUT') return;
      soundManager.playButtonClick();
      const format = btn.dataset.format;
      const now = new Date();
      let formatted = '';

      if (format === 'today') {
        const monthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
        formatted = `CHEESYBOOTH · ${monthYear}`;
      } else if (format === 'datetime') {
        const iso = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 5);
        formatted = `${iso} ${time}`;
      } else if (format === 'classic') {
        formatted = `CHEESYBOOTH · ${now.getFullYear()}`;
      } else if (format === 'cheese') {
        formatted = `CHEESYBOOTH! 🧀 ${now.getFullYear()}`;
      } else if (format === 'memories') {
        formatted = `BEST MEMORIES ❤️ ${now.getFullYear()}`;
      }

      if (formatted && stampTextInput) {
        const before = stampTextInput.value;
        stampTextInput.value = formatted;
        collageRenderer.updateSettings({ stampText: formatted, showStamp: true });
        if (stampVisibleToggle) stampVisibleToggle.checked = true;
        await updateCollagePreview();
        showHistoryToast(`Applied format: "${formatted}"`);
      }
    });
  }

  if (stampDatePicker) {
    stampDatePicker.value = new Date().toISOString().slice(0, 10);
    stampDatePicker.addEventListener('change', async (e) => {
      const selected = e.target.value;
      if (!selected) return;
      soundManager.playButtonClick();
      const d = new Date(selected + 'T00:00:00');
      const dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase();
      const newText = `CHEESYBOOTH · ${dateStr}`;
      if (stampTextInput) {
        stampTextInput.value = newText;
      }
      collageRenderer.updateSettings({ stampText: newText, showStamp: true });
      if (stampVisibleToggle) stampVisibleToggle.checked = true;
      await updateCollagePreview();
      showHistoryToast(`Set date: ${dateStr}`);
    });
  }

  if (footerAlignGroup) {
    footerAlignGroup.addEventListener('click', async (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      const align = btn.dataset.align || 'center';
      footerAlignGroup.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b === btn));
      collageRenderer.updateSettings({ textAlign: align, footerAlignment: align });
      await updateCollagePreview();
      showHistoryToast(`Aligned text: ${align.toUpperCase()}`);
    });
  }

  if (footerFontSelect) {
    footerFontSelect.addEventListener('change', async (e) => {
      soundManager.playButtonClick();
      const font = e.target.value;
      collageRenderer.updateSettings({ fontFamily: font });
      await updateCollagePreview();
      showHistoryToast(`Font set to ${font}`);
    });
  }

  if (stampColorSwatches) {
    stampColorSwatches.addEventListener('click', async (e) => {
      const swatch = e.target.closest('.stamp-color-swatch');
      if (!swatch) return;
      soundManager.playButtonClick();
      stampColorSwatches.querySelectorAll('.stamp-color-swatch').forEach(s => s.classList.toggle('active', s === swatch));
      const color = swatch.dataset.color;
      let targetColor = color;
      if (color === 'auto') {
        const isDark = collageRenderer.settings.frameColor === '#292724' || collageRenderer.settings.frameColor === '#000000';
        targetColor = isDark ? '#FAF6EE' : '#292724';
      }
      collageRenderer.updateSettings({ textColor: targetColor });
      await updateCollagePreview();
      showHistoryToast(`Stamp color updated`);
    });
  }

  if (stampTextColorPicker) {
    stampTextColorPicker.addEventListener('input', async (e) => {
      const val = e.target.value;
      collageRenderer.updateSettings({ textColor: val });
      if (stampColorSwatches) {
        stampColorSwatches.querySelectorAll('.stamp-color-swatch').forEach(s => s.classList.remove('active'));
      }
      await updateCollagePreview({ skipDom: true });
    });
    stampTextColorPicker.addEventListener('change', async (e) => {
      await updateCollagePreview({ skipDom: false });
    });
  }

  const customStampInput = document.getElementById('customStampInput');
  const btnAddCustomStamp = document.getElementById('btnAddCustomStamp');

  async function addCustomStampFromInput() {
    const val = customStampInput.value.trim();
    if (!val) return;
    soundManager.playButtonClick();

    let newSticker = null;
    if (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('data:')) {
      const isGif = val.toLowerCase().includes('.gif') || val.startsWith('data:image/gif');
      newSticker = await collageRenderer.addSticker(val, isGif ? 'gif' : 'image');
    } else {
      newSticker = await collageRenderer.addSticker(val, 'emoji');
    }

    if (newSticker) {
      selectedStickerId = newSticker.id;
      addRecent({ emoji: val, label: val });
      historyManager.push({
        type: 'sticker-add',
        description: 'Added custom stamp',
        undo: async () => {
          collageRenderer.removeSticker(newSticker.id);
          if (selectedStickerId === newSticker.id) selectedStickerId = null;
          await updateCollagePreview();
        },
        redo: async () => {
          if (!collageRenderer.settings.stickers.some(s => s.id === newSticker.id)) {
            collageRenderer.settings.stickers.push(newSticker);
          }
          selectedStickerId = newSticker.id;
          await updateCollagePreview();
        },
      });
    }

    customStampInput.value = '';
    await updateCollagePreview();
  }

  if (btnAddCustomStamp) {
    btnAddCustomStamp.addEventListener('click', addCustomStampFromInput);
  }

  if (customStampInput) {
    customStampInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomStampFromInput();
      }
    });
  }

  const uploadStickerInput = document.getElementById('uploadStickerInput');
  if (uploadStickerInput) {
    uploadStickerInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const validation = await privacyManager.validateImageFile(file);
      if (!validation.valid) {
        showPrivacyToast(validation.error, 'error');
        uploadStickerInput.value = '';
        return;
      }

      const isGif = validation.isGif;
      const reader = new FileReader();
      reader.onload = async (event) => {
        soundManager.playButtonClick();
        const dataUrl = event.target.result;
        const newSticker = await collageRenderer.addSticker(dataUrl, isGif ? 'gif' : 'image');

        if (newSticker) {
          selectedStickerId = newSticker.id;
          addRecent({ emoji: isGif ? '🎞️' : '🖼️', label: file.name, imgSrc: dataUrl, type: isGif ? 'gif' : 'image' });
          historyManager.push({
            type: 'sticker-add',
            description: isGif ? 'Uploaded GIF stamp' : 'Uploaded photo stamp',
            undo: async () => {
              collageRenderer.removeSticker(newSticker.id);
              if (selectedStickerId === newSticker.id) selectedStickerId = null;
              await updateCollagePreview();
            },
            redo: async () => {
              if (!collageRenderer.settings.stickers.some(s => s.id === newSticker.id)) {
                collageRenderer.settings.stickers.push(newSticker);
              }
              selectedStickerId = newSticker.id;
              await updateCollagePreview();
            },
          });
          showPrivacyToast(`Added local ${isGif ? 'GIF' : 'image'} stamp`, 'info');
        }

        await updateCollagePreview();
        uploadStickerInput.value = '';
      };
      reader.readAsDataURL(file);
    });
  }

  if (canvasContainer) {
    ['dragenter', 'dragover'].forEach(evtName => {
      canvasContainer.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        canvasContainer.style.boxShadow = '0 0 0 3px var(--color-primary), var(--shadow-floating)';
      });
    });

    ['dragleave', 'drop'].forEach(evtName => {
      canvasContainer.addEventListener(evtName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        canvasContainer.style.boxShadow = '';
      });
    });

    canvasContainer.addEventListener('drop', async (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        const validation = await privacyManager.validateImageFile(file);
        if (!validation.valid) {
          showPrivacyToast(validation.error, 'error');
          return;
        }

        const isGif = validation.isGif;
        const reader = new FileReader();
        reader.onload = async (event) => {
          soundManager.playButtonClick();
          const dataUrl = event.target.result;
          const newSticker = await collageRenderer.addSticker(dataUrl, isGif ? 'gif' : 'image');

          if (newSticker) {
            selectedStickerId = newSticker.id;
            addRecent({ emoji: isGif ? '🎞️' : '🖼️', label: file.name, imgSrc: dataUrl, type: isGif ? 'gif' : 'image' });
            historyManager.push({
              type: 'sticker-add',
              description: isGif ? 'Dropped GIF stamp' : 'Dropped image stamp',
              undo: async () => {
                collageRenderer.removeSticker(newSticker.id);
                if (selectedStickerId === newSticker.id) selectedStickerId = null;
                await updateCollagePreview();
              },
              redo: async () => {
                if (!collageRenderer.settings.stickers.some(s => s.id === newSticker.id)) {
                  collageRenderer.settings.stickers.push(newSticker);
                }
                selectedStickerId = newSticker.id;
                await updateCollagePreview();
              },
            });
            showPrivacyToast(`Dropped local ${isGif ? 'GIF' : 'image'} stamp`, 'info');
          }

          await updateCollagePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  let workspaceZoom = 1.0;
  let workspacePanX = 0;
  let workspacePanY = 0;

  function updateWorkspaceTransform() {
    if (canvasContainer) {
      canvasContainer.style.transform = `translate(${workspacePanX}px, ${workspacePanY}px) scale(${workspaceZoom})`;
    }
  }

  const canvasWrapper = document.querySelector('.collage-canvas-wrapper');
  if (canvasWrapper) {
    let isPanningWorkspace = false;
    let panStartX = 0;
    let panStartY = 0;
    let initialPanX = 0;
    let initialPanY = 0;

    let touchStartDist = null;
    let touchStartZoom = null;

    canvasWrapper.addEventListener('wheel', (e) => {
      if (e.defaultPrevented) return;
      e.preventDefault();

      let rawDelta = e.deltaY;
      if (e.deltaMode === 1) rawDelta *= 24;
      else if (e.deltaMode === 2) rawDelta *= 400;

      const isPinch = e.ctrlKey || Math.abs(rawDelta) < 12;
      const sensitivity = isPinch ? 0.008 : 0.003;
      const zoomFactor = 1 - rawDelta * sensitivity;
      const targetZoom = Math.max(0.35, Math.min(3.5, +(workspaceZoom * zoomFactor).toFixed(3)));

      workspaceZoom = targetZoom;
      updateWorkspaceTransform();
    }, { passive: false });

    canvasWrapper.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 2) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        touchStartZoom = workspaceZoom;
      }
    }, { passive: false });

    canvasWrapper.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 2 && touchStartDist !== null && touchStartZoom !== null) {
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const curDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scale = curDist / (touchStartDist || 1);
        workspaceZoom = Math.max(0.35, Math.min(3.5, +(touchStartZoom * scale).toFixed(3)));
        updateWorkspaceTransform();
      }
    }, { passive: false });

    canvasWrapper.addEventListener('touchend', (e) => {
      if (!e.touches || e.touches.length < 2) {
        touchStartDist = null;
        touchStartZoom = null;
      }
    });

    canvasWrapper.addEventListener('pointerdown', (e) => {
      if (e.target === canvasWrapper || e.target === canvasContainer) {
        if (e.button === 0 || e.button === 1) {
          isPanningWorkspace = true;
          panStartX = e.clientX;
          panStartY = e.clientY;
          initialPanX = workspacePanX;
          initialPanY = workspacePanY;
          canvasWrapper.style.cursor = 'grabbing';
          e.preventDefault();
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!isPanningWorkspace) return;
      const dx = e.clientX - panStartX;
      const dy = e.clientY - panStartY;
      workspacePanX = initialPanX + dx;
      workspacePanY = initialPanY + dy;
      updateWorkspaceTransform();
    });

    window.addEventListener('pointerup', (e) => {
      if (isPanningWorkspace) {
        isPanningWorkspace = false;
        if (canvasWrapper) canvasWrapper.style.cursor = '';
      }
    });

    canvasWrapper.addEventListener('dblclick', (e) => {
      if (e.target === canvasWrapper || e.target === canvasContainer) {
        workspaceZoom = 1.0;
        workspacePanX = 0;
        workspacePanY = 0;
        updateWorkspaceTransform();
      }
    });
  }

  if (collageCanvas) {
    collageCanvas.addEventListener('click', (e) => {
      const computedSlots = collageRenderer.getLastComputedSlots();
      if (!computedSlots || computedSlots.length === 0) return;
      const rect = collageCanvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const clickX = ((e.clientX - rect.left) / rect.width) * (collageCanvas.width || 1);
      const clickY = ((e.clientY - rect.top) / rect.height) * (collageCanvas.height || 1);
      const foundSlot = computedSlots.find(s => 
        clickX >= s.x && clickX <= s.x + s.width &&
        clickY >= s.y && clickY <= s.y + s.height
      );
      if (foundSlot) {
        soundManager.playButtonClick();
        selectSlot(foundSlot.index);
      }
    });
  }

  let isAspectLocked = true;

  function updateExportStudioUI() {
    const photos = photoManager.getAll();
    const config = exportManager.config;
    const fmt = exportManager.getFormatDef();

    if (exportFormatGrid) {
      exportFormatGrid.querySelectorAll('.format-pill-btn').forEach(btn => {
        const f = btn.dataset.format;
        btn.classList.toggle('active', f === config.format);

        let supported = true;
        let reason = '';
        if (f === 'webp' && !ExportCapabilityDetector.isWebPSupported()) {
          supported = false; reason = 'WebP export not supported in this browser';
        } else if (f === 'webm' && !ExportCapabilityDetector.isWebMSupported()) {
          supported = false; reason = 'WebM MediaRecorder not supported';
        } else if (f === 'mp4' && !ExportCapabilityDetector.isMP4Supported()) {
          supported = false; reason = 'MP4 recording not supported natively in this browser';
        }

        btn.disabled = !supported;
        if (!supported) {
          btn.title = reason;
        } else {
          btn.title = '';
        }
      });
    }

    if (exportActiveFormatBadge) {
      exportActiveFormatBadge.textContent = fmt.name.toUpperCase().split(' ')[0];
    }

    if (exportResolutionSelect) {
      exportResolutionSelect.value = config.resolutionPreset;
    }

    if (exportCustomDimsRow) {
      const isCustom = config.resolutionPreset === 'custom';
      exportCustomDimsRow.style.display = isCustom ? 'flex' : 'none';
      if (isCustom) {
        if (exportCustomWidth) exportCustomWidth.value = config.customWidth || 1800;
        if (exportCustomHeight) exportCustomHeight.value = config.customHeight || 2400;
      }
    }

    if (exportQualityRow) {
      exportQualityRow.style.display = fmt.supportsQuality ? 'flex' : 'none';
      if (exportQualitySlider) exportQualitySlider.value = config.quality;
      if (exportQualityVal) exportQualityVal.textContent = `${Math.round(config.quality * 100)}%`;
    }

    if (exportTransparentBgRow) {
      exportTransparentBgRow.style.display = fmt.supportsTransparency ? 'flex' : 'none';
      if (exportTransparentBgCheck) exportTransparentBgCheck.checked = !!config.transparentBg;
    }

    if (exportAnimatedOptionsRow) {
      const isAnim = config.format === 'gif' || config.format === 'webm' || config.format === 'mp4';
      exportAnimatedOptionsRow.style.display = isAnim ? 'flex' : 'none';
      if (exportFpsSelect) exportFpsSelect.value = config.animatedFps;
      if (exportDurationSelect) exportDurationSelect.value = config.animatedDuration;
    }

    if (exportBatchScopeSelect) {
      exportBatchScopeSelect.value = config.batchMode;
    }

    if (exportFilenameExtBadge) {
      exportFilenameExtBadge.textContent = fmt.extension;
    }

    const estimate = exportManager.getEstimate(photos);
    if (exportSummaryDims) exportSummaryDims.textContent = `${estimate.width} × ${estimate.height} px`;
    if (exportSummaryRatio) {
      const r = estimate.aspectRatio;
      let ratioName = 'Portrait';
      if (Math.abs(r - 1.0) < 0.05) ratioName = '1:1 Square';
      else if (r > 1.2) ratioName = 'Landscape';
      else if (r < 0.4) ratioName = 'Photo Strip';
      else if (Math.abs(r - 0.75) < 0.05) ratioName = '3:4 Portrait';
      else if (Math.abs(r - 0.8) < 0.05) ratioName = '4:5 Portrait';
      exportSummaryRatio.textContent = ratioName;
    }
    if (exportSummaryFormat) exportSummaryFormat.textContent = estimate.formatDef.name;
    if (exportSummarySize) exportSummarySize.textContent = `~${estimate.estimatedSizeMB} MB`;

    if (exportMemoryAlert) {
      exportMemoryAlert.classList.toggle('visible', estimate.isHighMemory);
    }
  }

  function openExportStudioModal() {
    soundManager.playButtonClick();
    if (exportFilenameInput && !exportFilenameInput.value) {
      exportFilenameInput.value = stampTextInput?.value?.trim() || `say-cheese-${new Date().toISOString().slice(0, 10)}`;
      exportManager.setFilename(exportFilenameInput.value);
    }
    updateExportStudioUI();

    if (exportModal) {
      keyboardManager.openModal(exportModal);
      keyboardManager.announce('Export Studio opened. Customize output format, resolution, and quality.');
    }
  }

  function closeExportStudioModal() {
    if (exportModal) {
      keyboardManager.closeModal(exportModal);
    }
  }

  if (btnOpenExportStudio) {
    btnOpenExportStudio.addEventListener('click', openExportStudioModal);
  }

  if (btnCloseExportModal) {
    btnCloseExportModal.addEventListener('click', closeExportStudioModal);
  }

  if (exportPresetsRibbon) {
    exportPresetsRibbon.addEventListener('click', (e) => {
      const chip = e.target.closest('.export-preset-chip');
      if (!chip) return;
      soundManager.playButtonClick();
      exportPresetsRibbon.querySelectorAll('.export-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      exportManager.applyPreset(chip.dataset.preset);
      updateExportStudioUI();
    });
  }

  if (exportFormatGrid) {
    exportFormatGrid.addEventListener('click', (e) => {
      const pill = e.target.closest('.format-pill-btn');
      if (!pill || pill.disabled) return;
      soundManager.playButtonClick();
      exportManager.setFormat(pill.dataset.format);
      updateExportStudioUI();
    });
  }

  if (exportResolutionSelect) {
    exportResolutionSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      exportManager.setResolutionPreset(exportResolutionSelect.value);
      updateExportStudioUI();
    });
  }

  if (btnExportAspectLock) {
    btnExportAspectLock.addEventListener('click', () => {
      isAspectLocked = !isAspectLocked;
      btnExportAspectLock.classList.toggle('locked', isAspectLocked);
      btnExportAspectLock.textContent = isAspectLocked ? '🔒 Lock Ratio' : '🔓 Unlocked';
    });
  }

  if (exportCustomWidth && exportCustomHeight) {
    exportCustomWidth.addEventListener('input', () => {
      const w = parseInt(exportCustomWidth.value, 10) || 1200;
      if (isAspectLocked) {
        const base = exportManager.exportRenderer.getBaseDimensions();
        const h = Math.round(w / base.aspectRatio);
        exportCustomHeight.value = h;
        exportManager.setCustomResolution(w, h);
      } else {
        exportManager.setCustomResolution(w, parseInt(exportCustomHeight.value, 10) || 1600);
      }
      updateExportStudioUI();
    });

    exportCustomHeight.addEventListener('input', () => {
      const h = parseInt(exportCustomHeight.value, 10) || 1600;
      if (isAspectLocked) {
        const base = exportManager.exportRenderer.getBaseDimensions();
        const w = Math.round(h * base.aspectRatio);
        exportCustomWidth.value = w;
        exportManager.setCustomResolution(w, h);
      } else {
        exportManager.setCustomResolution(parseInt(exportCustomWidth.value, 10) || 1200, h);
      }
      updateExportStudioUI();
    });
  }

  if (exportQualitySlider) {
    exportQualitySlider.addEventListener('input', () => {
      exportManager.setQuality(parseFloat(exportQualitySlider.value));
      if (exportQualityVal) exportQualityVal.textContent = `${Math.round(exportManager.config.quality * 100)}%`;
      updateExportStudioUI();
    });
  }

  if (exportTransparentBgCheck) {
    exportTransparentBgCheck.addEventListener('change', () => {
      exportManager.setTransparentBg(exportTransparentBgCheck.checked);
      updateExportStudioUI();
    });
  }

  if (exportFpsSelect) {
    exportFpsSelect.addEventListener('change', () => {
      exportManager.config.animatedFps = parseInt(exportFpsSelect.value, 10) || 10;
      updateExportStudioUI();
    });
  }

  if (exportDurationSelect) {
    exportDurationSelect.addEventListener('change', () => {
      exportManager.config.animatedDuration = parseFloat(exportDurationSelect.value) || 2.5;
      updateExportStudioUI();
    });
  }

  if (exportBatchScopeSelect) {
    exportBatchScopeSelect.addEventListener('change', () => {
      exportManager.setBatchMode(exportBatchScopeSelect.value);
      updateExportStudioUI();
    });
  }

  if (exportFilenameInput) {
    exportFilenameInput.addEventListener('input', () => {
      exportManager.setFilename(exportFilenameInput.value);
      updateExportStudioUI();
    });
  }

  exportManager.subscribe(({ state }) => {
    if (!exportProgressContainer) return;
    if (state.isExporting) {
      exportProgressContainer.classList.add('active');
      if (exportProgressStageText) exportProgressStageText.textContent = state.stageMessage;
      if (exportProgressPercentText) exportProgressPercentText.textContent = `${state.progress}%`;
      if (exportProgressBarFill) exportProgressBarFill.style.width = `${state.progress}%`;
      if (btnExportDownloadConfirm) btnExportDownloadConfirm.disabled = true;
    } else {
      exportProgressContainer.classList.remove('active');
      if (btnExportDownloadConfirm) btnExportDownloadConfirm.disabled = false;
    }
  });

  if (btnCancelExportOperation) {
    btnCancelExportOperation.addEventListener('click', () => {
      soundManager.playButtonClick();
      exportManager.cancelExport();
      showPrivacyToast('Export cancelled', 'info');
    });
  }

  if (btnExportDownloadConfirm) {
    btnExportDownloadConfirm.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) {
        showPrivacyToast('No captured photos to export', 'error');
        return;
      }

      soundManager.playShutterSound();
      try {
        if (exportManager.config.batchMode === 'all_photos') {
          const results = await exportManager.exportBatchSinglePhotos(photos);
          if (results && results.length > 0) {
            showPrivacyToast(`Batch exported ${results.length} photos!`, 'info', '📦');
            keyboardManager.announce(`Batch exported ${results.length} photos.`);
            closeExportStudioModal();
          }
        } else {
          const result = await exportManager.download(photos);
          if (result) {
            showPrivacyToast(`Downloaded ${result.filename}`, 'info', '💾');
            keyboardManager.announce(`Export complete. ${result.filename} downloaded.`);
            closeExportStudioModal();
          }
        }
      } catch (err) {
        if (err?.message !== 'Export was cancelled.') {
          showPrivacyToast(err?.message || 'Export failed', 'error');
        }
      }
    });
  }

  if (btnExportCopyClipboard) {
    btnExportCopyClipboard.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;
      soundManager.playButtonClick();

      btnExportCopyClipboard.disabled = true;
      btnExportCopyClipboard.innerHTML = '<span>⏳ Copying...</span>';
      try {
        const success = await exportManager.copyToClipboard(photos);
        if (success) {
          showPrivacyToast('Image copied to clipboard!', 'info', '📋');
          keyboardManager.announce('Export copied to clipboard.');
        } else {
          showPrivacyToast('Clipboard copy failed. Try downloading instead.', 'error');
        }
      } catch (err) {
        showPrivacyToast(err?.message || 'Clipboard copy failed', 'error');
      } finally {
        btnExportCopyClipboard.disabled = false;
        btnExportCopyClipboard.innerHTML = '<span>📋 Copy Image</span>';
      }
    });
  }

  if (btnExportNativeShare) {
    if (!ExportCapabilityDetector.isWebShareSupported()) {
      btnExportNativeShare.style.display = 'none';
    } else {
      btnExportNativeShare.addEventListener('click', async () => {
        const photos = photoManager.getAll();
        if (!photos || photos.length === 0) return;
        soundManager.playButtonClick();

        btnExportNativeShare.disabled = true;
        btnExportNativeShare.innerHTML = '<span>⏳ Sharing...</span>';
        try {
          const res = await exportManager.share(photos);
          if (res && res.success) {
            showPrivacyToast('Print shared successfully!', 'info', '📲');
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            showPrivacyToast('Share failed. Try downloading instead.', 'error');
          }
        } finally {
          btnExportNativeShare.disabled = false;
          btnExportNativeShare.innerHTML = '<span>📲 Share</span>';
        }
      });
    }
  }

  if (btnDownloadPNG) {
    btnDownloadPNG.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;
      soundManager.playShutterSound();
      btnDownloadPNG.disabled = true;
      btnDownloadPNG.innerHTML = '<span>⏳ Exporting PNG...</span>';

      exportManager.setFormat('png');
      try {
        const result = await exportManager.download(photos);
        if (result) showPrivacyToast('PNG downloaded!', 'info', '🖼️');
      } catch (err) {
        showPrivacyToast('PNG export error', 'error');
      } finally {
        btnDownloadPNG.disabled = false;
        btnDownloadPNG.innerHTML = '<span>🖼️ Quick Still PNG (.png)</span>';
      }
    });
  }

  if (btnDownloadGIF) {
    btnDownloadGIF.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;
      soundManager.playShutterSound();
      btnDownloadGIF.disabled = true;
      btnDownloadGIF.innerHTML = '<span>⏳ Rendering GIF...</span>';

      exportManager.setFormat('gif');
      try {
        const result = await exportManager.download(photos);
        if (result) showPrivacyToast('GIF downloaded!', 'info', '🎞️');
      } catch (err) {
        showPrivacyToast('GIF export error', 'error');
      } finally {
        btnDownloadGIF.disabled = false;
        btnDownloadGIF.innerHTML = '<span>🎞️ Quick Animated GIF (.gif)</span>';
      }
    });
  }

  if (btnCopyImage) {
    btnCopyImage.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;
      soundManager.playButtonClick();
      btnCopyImage.disabled = true;
      const origHTML = btnCopyImage.innerHTML;
      try {
        const success = await exportManager.copyToClipboard(photos);
        if (success) {
          btnCopyImage.innerHTML = '<span>✓ Copied!</span>';
          showPrivacyToast('Image copied to clipboard!', 'info', '📋');
        } else {
          btnCopyImage.innerHTML = '<span>✕ Failed</span>';
          showPrivacyToast('Clipboard not supported', 'error');
        }
      } catch (e) {
        btnCopyImage.innerHTML = '<span>✕ Failed</span>';
      } finally {
        setTimeout(() => {
          btnCopyImage.disabled = false;
          btnCopyImage.innerHTML = origHTML;
        }, 1500);
      }
    });
  }

  if (btnMobileShare) {
    if (ExportCapabilityDetector.isWebShareSupported()) {
      btnMobileShare.style.display = 'inline-flex';
      btnMobileShare.addEventListener('click', async () => {
        const photos = photoManager.getAll();
        if (!photos || photos.length === 0) return;
        soundManager.playButtonClick();
        mobileManager.hapticTap();
        try {
          await exportManager.share(photos);
        } catch (e) {}
      });
    }
  }

  keyboardManager.on('export', () => {
    if (currentActiveView === 'collage') {
      openExportStudioModal();
    }
  });

  let printPreviewDebounce = null;

  async function updatePrintStudioUI() {
    const photos = photoManager.getAll();
    const config = printManager.config;

    if (printPaperSizeSelect) {
      printPaperSizeSelect.value = config.paperPreset;
    }
    const isCustom = config.paperPreset === 'custom';
    if (printCustomDimsRow) {
      printCustomDimsRow.style.display = isCustom ? 'flex' : 'none';
      if (isCustom) {
        if (printCustomWidth) printCustomWidth.value = config.customWidth || 4;
        if (printCustomHeight) printCustomHeight.value = config.customHeight || 6;
        if (printCustomUnit) printCustomUnit.value = config.customUnit || 'in';
      }
    }

    if (printDpiSelect) printDpiSelect.value = String(config.dpi);
    if (printActiveDpiBadge) printActiveDpiBadge.textContent = `${config.dpi} DPI`;

    if (printOrientationSelect) printOrientationSelect.value = config.orientation;
    if (printLayoutModeSelect) printLayoutModeSelect.value = config.layoutMode;
    if (printFitModeRow) {
      printFitModeRow.style.display = config.layoutMode === 'single' ? 'flex' : 'none';
      if (printFitModeSelect) printFitModeSelect.value = config.fitMode;
    }

    if (printMarginSelect) printMarginSelect.value = String(config.marginMm);
    if (printBleedSelect) printBleedSelect.value = String(config.bleedMm);
    if (printPaperColorSelect) printPaperColorSelect.value = config.paperColor;
    if (printBorderStyleSelect) printBorderStyleSelect.value = config.borderStyle;
    if (printCopiesInput) printCopiesInput.value = config.copies || 1;

    if (printGuideSafeCheck) printGuideSafeCheck.checked = !!config.showSafeGuides;
    if (printGuideTrimCheck) printGuideTrimCheck.checked = !!config.showTrimGuides;
    if (printGuideBleedCheck) printGuideBleedCheck.checked = !!config.showBleedGuides;

    const estimate = printManager.getEstimate(photos);
    if (printActivePaperBadge) {
      printActivePaperBadge.textContent = `${estimate.widthIn} × ${estimate.heightIn} in`;
    }
    if (printSummaryPhysical) {
      printSummaryPhysical.textContent = `${estimate.widthIn} × ${estimate.heightIn} in (${estimate.widthMm} × ${estimate.heightMm} mm)`;
    }
    if (printSummaryPixels) {
      printSummaryPixels.textContent = `${estimate.paperWidthPx} × ${estimate.paperHeightPx} px @ ${estimate.dpi} DPI`;
    }
    if (printSummaryMemory) {
      printSummaryMemory.textContent = `~${estimate.estimatedRamMB} MB`;
    }

    if (printQualityWarning) {
      printQualityWarning.classList.toggle('visible', !!estimate.isLowRes);
      if (printQualityWarningText && estimate.recommendation) {
        printQualityWarningText.textContent = estimate.recommendation;
      }
    }
    if (printMemoryWarning) {
      printMemoryWarning.classList.toggle('visible', !!estimate.isHighMemory);
    }

    if (printPreviewDebounce) clearTimeout(printPreviewDebounce);
    printPreviewDebounce = setTimeout(async () => {
      if (!photos || photos.length === 0 || !printPreviewCanvas) return;
      try {
        const offscreen = await printManager.generatePreviewCanvas(photos, 500);
        if (offscreen && printPreviewCanvas) {
          printPreviewCanvas.width = offscreen.width;
          printPreviewCanvas.height = offscreen.height;
          const pCtx = printPreviewCanvas.getContext('2d');
          pCtx.clearRect(0, 0, offscreen.width, offscreen.height);
          pCtx.drawImage(offscreen, 0, 0);
        }
      } catch (e) {
        console.warn('Print preview generation failed:', e);
      }
    }, 40);
  }

  function openPrintStudioModal() {
    soundManager.playButtonClick();
    updatePrintStudioUI();
    if (printModal) {
      keyboardManager.openModal(printModal);
      keyboardManager.announce('Print Studio opened. Configure paper size, 300 DPI layout, margins, and physical print parameters.');
    }
  }

  function closePrintStudioModal() {
    if (printModal) {
      keyboardManager.closeModal(printModal);
    }
  }

  if (btnOpenPrintStudio) {
    btnOpenPrintStudio.addEventListener('click', openPrintStudioModal);
  }

  if (btnClosePrintModal) {
    btnClosePrintModal.addEventListener('click', closePrintStudioModal);
  }

  if (printPresetsRibbon) {
    printPresetsRibbon.addEventListener('click', (e) => {
      const chip = e.target.closest('.print-preset-chip');
      if (!chip) return;
      soundManager.playButtonClick();
      printPresetsRibbon.querySelectorAll('.print-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      printManager.applyPreset(chip.dataset.preset);
      updatePrintStudioUI();
    });
  }

  if (printPaperSizeSelect) {
    printPaperSizeSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setPaperPreset(printPaperSizeSelect.value);
      updatePrintStudioUI();
    });
  }

  const handlePrintCustomDimChange = () => {
    const w = parseFloat(printCustomWidth?.value) || 4.0;
    const h = parseFloat(printCustomHeight?.value) || 6.0;
    const unit = printCustomUnit?.value || 'in';
    printManager.setCustomDimensions(w, h, unit);
    updatePrintStudioUI();
  };

  if (printCustomWidth) printCustomWidth.addEventListener('input', handlePrintCustomDimChange);
  if (printCustomHeight) printCustomHeight.addEventListener('input', handlePrintCustomDimChange);
  if (printCustomUnit) printCustomUnit.addEventListener('change', handlePrintCustomDimChange);

  if (printDpiSelect) {
    printDpiSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setDpi(printDpiSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printOrientationSelect) {
    printOrientationSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setOrientation(printOrientationSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printLayoutModeSelect) {
    printLayoutModeSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setLayoutMode(printLayoutModeSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printFitModeSelect) {
    printFitModeSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setFitMode(printFitModeSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printMarginSelect) {
    printMarginSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setMarginMm(parseFloat(printMarginSelect.value) || 0);
      updatePrintStudioUI();
    });
  }

  if (printBleedSelect) {
    printBleedSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setBleedMm(parseFloat(printBleedSelect.value) || 0);
      updatePrintStudioUI();
    });
  }

  if (printPaperColorSelect) {
    printPaperColorSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setPaperColor(printPaperColorSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printBorderStyleSelect) {
    printBorderStyleSelect.addEventListener('change', () => {
      soundManager.playButtonClick();
      printManager.setBorderStyle(printBorderStyleSelect.value);
      updatePrintStudioUI();
    });
  }

  if (printCopiesInput) {
    printCopiesInput.addEventListener('input', () => {
      printManager.setCopies(printCopiesInput.value);
    });
  }

  const handlePrintGuideToggle = () => {
    printManager.setGuides({
      showSafe: printGuideSafeCheck ? printGuideSafeCheck.checked : true,
      showTrim: printGuideTrimCheck ? printGuideTrimCheck.checked : true,
      showBleed: printGuideBleedCheck ? printGuideBleedCheck.checked : false,
    });
    updatePrintStudioUI();
  };

  if (printGuideSafeCheck) printGuideSafeCheck.addEventListener('change', handlePrintGuideToggle);
  if (printGuideTrimCheck) printGuideTrimCheck.addEventListener('change', handlePrintGuideToggle);
  if (printGuideBleedCheck) printGuideBleedCheck.addEventListener('change', handlePrintGuideToggle);

  if (btnPrintExecuteConfirm) {
    btnPrintExecuteConfirm.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) {
        showPrivacyToast('No photos captured to print', 'error');
        return;
      }

      soundManager.playShutterSound();
      btnPrintExecuteConfirm.disabled = true;
      btnPrintExecuteConfirm.innerHTML = '<span>⏳ Preparing Print...</span>';

      try {
        await printManager.executeBrowserPrint(photos);
        showPrivacyToast('Sent to printer!', 'info', '🖨️');
        keyboardManager.announce('Print dialog triggered successfully.');
      } catch (err) {
        showPrivacyToast(err?.message || 'Printing failed', 'error');
      } finally {
        btnPrintExecuteConfirm.disabled = false;
        btnPrintExecuteConfirm.innerHTML = '<span>🖨️ Print Now</span>';
      }
    });
  }

  if (btnPrintSaveFile) {
    btnPrintSaveFile.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;

      soundManager.playButtonClick();
      btnPrintSaveFile.disabled = true;
      btnPrintSaveFile.innerHTML = '<span>⏳ Rendering 300 DPI...</span>';

      try {
        const res = await printManager.savePrintFile(photos, { format: 'png' });
        if (res) {
          showPrivacyToast(`Saved ${res.filename}`, 'info', '💾');
          keyboardManager.announce(`Print file ${res.filename} saved.`);
          closePrintStudioModal();
        }
      } catch (err) {
        showPrivacyToast(err?.message || 'Failed to save print file', 'error');
      } finally {
        btnPrintSaveFile.disabled = false;
        btnPrintSaveFile.innerHTML = '<span>💾 Save Print File (PNG)</span>';
      }
    });
  }

  if (btnPrintCopyClipboard) {
    btnPrintCopyClipboard.addEventListener('click', async () => {
      const photos = photoManager.getAll();
      if (!photos || photos.length === 0) return;

      soundManager.playButtonClick();
      btnPrintCopyClipboard.disabled = true;
      btnPrintCopyClipboard.innerHTML = '<span>⏳ Copying...</span>';

      try {
        const success = await printManager.copyPrintImage(photos);
        if (success) {
          showPrivacyToast('Print sheet copied to clipboard!', 'info', '📋');
          keyboardManager.announce('Print sheet copied to clipboard.');
        } else {
          showPrivacyToast('Clipboard not supported', 'error');
        }
      } catch (err) {
        showPrivacyToast(err?.message || 'Copy failed', 'error');
      } finally {
        btnPrintCopyClipboard.disabled = false;
        btnPrintCopyClipboard.innerHTML = '<span>📋 Copy</span>';
      }
    });
  }

  if (btnPrintNativeShare) {
    if (!ExportCapabilityDetector.isWebShareSupported()) {
      btnPrintNativeShare.style.display = 'none';
    } else {
      btnPrintNativeShare.addEventListener('click', async () => {
        const photos = photoManager.getAll();
        if (!photos || photos.length === 0) return;

        soundManager.playButtonClick();
        btnPrintNativeShare.disabled = true;
        btnPrintNativeShare.innerHTML = '<span>⏳ Sharing...</span>';

        try {
          await printManager.sharePrintSheet(photos);
        } catch (e) {
          if (e?.name !== 'AbortError') {
            showPrivacyToast('Share failed. Try saving file instead.', 'error');
          }
        } finally {
          btnPrintNativeShare.disabled = false;
          btnPrintNativeShare.innerHTML = '<span>📲 Share</span>';
        }
      });
    }
  }

  keyboardManager.on('print', () => {
    if (currentActiveView === 'collage') {
      openPrintStudioModal();
    }
  });

  function updatePwaUI(snapshot = pwaManager.getDiagnostics()) {

    if (pwaConnectivityBadge) {
      if (snapshot.isOnline) {
        pwaConnectivityBadge.textContent = 'Online 🟢';
        pwaConnectivityBadge.style.background = '#E8F5E9';
        pwaConnectivityBadge.style.color = '#2E7D32';
      } else {
        pwaConnectivityBadge.textContent = 'Offline 🟡';
        pwaConnectivityBadge.style.background = '#FFF8E6';
        pwaConnectivityBadge.style.color = '#8C6A00';
      }
    }

    if (snapshot.isInstalled) {
      if (pwaInstalledNotice) pwaInstalledNotice.style.display = 'flex';
      if (pwaInstallActionContainer) pwaInstallActionContainer.style.display = 'none';
      if (pwaIosGuidance) pwaIosGuidance.style.display = 'none';
      if (pwaInstallDescription) pwaInstallDescription.textContent = 'Say Cheese is running as a standalone app with full offline capabilities.';
    } else if (snapshot.isIOS) {
      if (pwaInstalledNotice) pwaInstalledNotice.style.display = 'none';
      if (pwaInstallActionContainer) pwaInstallActionContainer.style.display = 'none';
      if (pwaIosGuidance) pwaIosGuidance.style.display = 'block';
      if (pwaInstallDescription) pwaInstallDescription.textContent = 'Install Say Cheese on your iPhone/iPad for an offline photobooth studio.';
    } else if (snapshot.isInstallable) {
      if (pwaInstalledNotice) pwaInstalledNotice.style.display = 'none';
      if (pwaInstallActionContainer) pwaInstallActionContainer.style.display = 'block';
      if (pwaIosGuidance) pwaIosGuidance.style.display = 'none';
      if (pwaInstallDescription) pwaInstallDescription.textContent = 'Install Say Cheese as a dedicated app for instant offline startup and window controls.';
    } else {
      if (pwaInstalledNotice) pwaInstalledNotice.style.display = 'none';
      if (pwaInstallActionContainer) pwaInstallActionContainer.style.display = 'none';
      if (pwaIosGuidance) pwaIosGuidance.style.display = 'none';
      if (pwaInstallDescription) pwaInstallDescription.textContent = 'Add Say Cheese to your bookmarks or home screen for quick offline access.';
    }

    if (pwaUpdateBanner) {
      pwaUpdateBanner.style.display = snapshot.hasUpdate ? 'flex' : 'none';
    }
  }

  pwaManager.subscribe((snapshot) => {
    updatePwaUI(snapshot);

    if (snapshot.eventType === 'online') {
      showPrivacyToast('Back online! 🟢', 'info', '📶');
      keyboardManager.announce('Internet connection restored.');
    } else if (snapshot.eventType === 'offline') {
      showPrivacyToast('You\'re offline. Local tools are fully ready! 🟡', 'info', '📶');
      keyboardManager.announce('Device is offline. Local photobooth features remain available.');
    }

    if (snapshot.hasUpdate) {
      keyboardManager.announce('A new version of Say Cheese is ready.');
    }
  });

  if (btnPwaInstallApp) {
    btnPwaInstallApp.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const res = await pwaManager.installManager.promptInstall();
      if (res && res.outcome === 'accepted') {
        showPrivacyToast('Say Cheese installed! ✦', 'info', '📱');
        keyboardManager.announce('Say Cheese installed successfully.');
      }
    });
  }

  if (btnPwaUpdateReload) {
    btnPwaUpdateReload.addEventListener('click', () => {
      soundManager.playButtonClick();
      pwaManager.updateManager.applyUpdate();
    });
  }

  if (btnPwaUpdateDismiss) {
    btnPwaUpdateDismiss.addEventListener('click', () => {
      soundManager.playButtonClick();
      if (pwaUpdateBanner) pwaUpdateBanner.style.display = 'none';
    });
  }

  pwaManager.init();
  updatePwaUI();

  if (photoDeskGrid) {
    mobileManager.attachSwipe(photoDeskGrid, {
      onSwipeLeft: () => {
        showHistoryToast('👈 Swipe left');
      },
      onSwipeRight: () => {
        showHistoryToast('👉 Swipe right');
      },
    });
  }

  btnBackToReview.addEventListener('click', () => {
    soundManager.playButtonClick();
    switchView('review');
  });

  function setBoothPhotoCount(count) {
    const num = parseInt(count, 10) || 4;
    const isStandard = [2, 4, 6].includes(num);
    const targetCount = Math.max(1, Math.min(30, num));
    photoManager.setTargetCount(targetCount);
    document.querySelectorAll('#targetCountGroup .pill-btn').forEach(b => {
      if (b.dataset.count === 'custom') {
        b.classList.toggle('active', !isStandard);
        b.textContent = '+';
        b.title = !isStandard ? `Custom: ${targetCount} photos (Click to change)` : 'Set custom number of photos';
      } else {
        b.classList.toggle('active', isStandard && parseInt(b.dataset.count, 10) === targetCount);
      }
    });
    if (!isStandard) {
      currentCustomShots = targetCount;
    }
    document.querySelectorAll('#obPhotoCountGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.count, 10) === targetCount);
    });
    document.querySelectorAll('#prefPhotoCountGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.count, 10) === targetCount);
    });
  }

  function setBoothCountdown(seconds) {
    const num = parseInt(seconds, 10) || 5;
    const isStandard = [3, 5, 10].includes(num);
    const s = Math.max(1, Math.min(60, num));
    sessionManager.setCountdownDuration(s);
    document.querySelectorAll('#countdownSecGroup .pill-btn').forEach(b => {
      if (b.dataset.seconds === 'custom') {
        b.classList.toggle('active', !isStandard);
        b.textContent = '+';
        b.title = !isStandard ? `Custom: ${s}s countdown (Click to change)` : 'Set custom countdown timer';
      } else {
        b.classList.toggle('active', isStandard && parseInt(b.dataset.seconds, 10) === s);
      }
    });
    if (!isStandard) {
      currentCustomCountdown = s;
    }
    document.querySelectorAll('#obCountdownGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.seconds, 10) === s);
    });
    document.querySelectorAll('#prefCountdownGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.seconds, 10) === s);
    });
  }

  function setBoothPosePrompts(mode) {
    const m = ['on', 'off'].includes(mode) ? mode : 'on';
    sessionManager.setPosePromptMode(m);
    document.querySelectorAll('#posePromptGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === m);
    });
    document.querySelectorAll('#prefPosePromptsGroup .pill-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === m);
    });
  }

  function setAppFunMode(modeId, savePref = true) {
    const mode = getFunMode(modeId);
    sessionManager.setMode(mode);

    document.querySelectorAll('.mode-pill-card').forEach(c => {
      c.classList.toggle('active', c.dataset.mode === mode.id);
    });

    updateModeInfoBanner(mode);

    if (mode.suggestedCountdown && mode.id !== 'classic') {
      setBoothCountdown(mode.suggestedCountdown);
    }

    if (prefDefaultFunMode) {
      prefDefaultFunMode.value = mode.id;
    }

    if (savePref) {
      preferenceManager.set('defaults.funMode', mode.id);
      showHistoryToast(`Mode: ${mode.icon} ${mode.name}`);
    }
  }

  function updateModeInfoBanner(mode) {
    if (!mode) mode = sessionManager.currentMode;
    if (activeModeEnergyBadge) activeModeEnergyBadge.textContent = mode.energy;
    if (activeModeDesc) activeModeDesc.textContent = `${mode.icon} ${mode.desc}`;
    if (activeModeSuggest) {
      activeModeSuggest.textContent = mode.suggestedCountdown ? `Suggested: ${mode.suggestedCountdown}s` : `${mode.tagline}`;
    }
    if (activeModeBadge) {
      if (mode.id !== 'classic') {
        activeModeBadge.textContent = `${mode.icon} ${mode.name.toUpperCase()}`;
        activeModeBadge.style.display = 'inline-flex';
      } else {
        activeModeBadge.style.display = 'none';
      }
    }
  }

  function renderFunModesList() {
    if (!funModesScroll) return;
    funModesScroll.innerHTML = '';
    const curModeId = sessionManager.currentMode?.id || preferenceManager.get('defaults.funMode') || 'classic';

    FUN_MODES.forEach((mode) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `mode-pill-card ${mode.id === curModeId ? 'active' : ''}`;
      card.dataset.mode = mode.id;
      card.setAttribute('aria-label', `${mode.name}: ${mode.desc}`);
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; min-width:0;">
          <span class="mode-card-icon">${mode.icon}</span>
          <span class="mode-card-title">${mode.name}</span>
        </div>
        <span class="mode-energy-tag">${mode.energy}</span>
      `;

      card.addEventListener('click', () => {
        soundManager.playButtonClick();
        setAppFunMode(mode.id);
      });

      funModesScroll.appendChild(card);
    });

    updateModeInfoBanner(getFunMode(curModeId));
  }

  function renderSessionSummaryCard() {
    const stats = statisticsManager.finishSession();
    if (!sessionSummaryCard) return;
    const mode = sessionManager.currentMode;
    const photos = photoManager.getAll();

    if (summaryModeIcon) summaryModeIcon.textContent = mode.icon || '📸';
    if (summaryModeTitle) summaryModeTitle.textContent = `${mode.name} Complete`;

    if (summaryModeStats) {
      const durationStr = stats ? `${stats.durationSec}s duration` : 'Quick session';
      const retakesStr = stats && stats.retakesCount > 0 ? ` · ${stats.retakesCount} retakes` : '';
      summaryModeStats.textContent = `${photos.length} photos · ${durationStr}${retakesStr} · ${FILTER_PRESETS[collageRenderer.settings.filter]?.name || 'Vintage'}`;
    }

    if (summaryBadge) {
      summaryBadge.textContent = mode.tagline || 'Completed';
    }

    sessionSummaryCard.style.display = 'flex';
    sessionSummaryCard.style.cursor = 'pointer';
    sessionSummaryCard.title = 'Click to view full booth session memory card';

    const summaryBody = document.getElementById('sessionSummaryBody');
    if (summaryBody && stats) {
      summaryBody.innerHTML = StatisticsRenderer.renderCardContent(stats);
    }
  }

  const sessionSummaryModal = document.getElementById('sessionSummaryModal');
  const btnCloseSessionSummary = document.getElementById('btnCloseSessionSummary');
  const btnSummaryStartNew = document.getElementById('btnSummaryStartNew');
  const btnSummaryGoToCollage = document.getElementById('btnSummaryGoToCollage');

  if (sessionSummaryCard && sessionSummaryModal) {
    sessionSummaryCard.addEventListener('click', () => {
      keyboardManager.openModal(sessionSummaryModal);
    });
  }

  if (btnCloseSessionSummary && sessionSummaryModal) {
    btnCloseSessionSummary.addEventListener('click', () => {
      keyboardManager.closeModal(sessionSummaryModal);
    });
  }

  if (btnSummaryStartNew) {
    btnSummaryStartNew.addEventListener('click', () => {
      if (sessionSummaryModal) keyboardManager.closeModal(sessionSummaryModal);
      btnRestartSession.click();
    });
  }

  if (btnSummaryGoToCollage) {
    btnSummaryGoToCollage.addEventListener('click', () => {
      if (sessionSummaryModal) keyboardManager.closeModal(sessionSummaryModal);
      btnProceedToCollage.click();
    });
  }

  function applyPreferencesToUI() {
    const prefs = preferenceManager.getAll();

    if (headerBrandTitle) {
      headerBrandTitle.textContent = (prefs.profile?.boothName || 'CHEESYBOOTH').toUpperCase();
    }
    if (headerBrandTag && prefs.profile?.greeting) {
      headerBrandTag.textContent = prefs.profile.greeting;
    }

    const msgs = preferenceManager.getMessages();
    const countdownMsgEl = document.getElementById('countdownMessage');
    if (countdownMsgEl) {
      countdownMsgEl.textContent = msgs.countdownCue || 'Get Ready! Smile ✨';
    }

    if (prefs.experience) {
      soundManager.setVolume(prefs.experience.volume ?? 80);
      soundManager.setSoundStyle(prefs.experience.soundStyle || 'classic');
      soundManager.setMuted(!prefs.experience.soundEnabled);
      if (soundIcon) {
        soundIcon.textContent = prefs.experience.soundEnabled ? '🔊' : '🔇';
      }
      if (btnSoundToggle) {
        btnSoundToggle.classList.toggle('active', prefs.experience.soundEnabled);
      }
    }

    if (videoEl) {
      const isMirrored = prefs.experience?.mirrorPreview !== false;
      videoEl.style.transform = isMirrored ? 'scaleX(-1)' : 'none';
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-motion', prefs.experience?.motion || 'full');
    }

    if (prefs.defaults) {
      if (prefs.defaults.photoCount) setBoothPhotoCount(prefs.defaults.photoCount);
      if (prefs.defaults.countdown) setBoothCountdown(prefs.defaults.countdown);
      if (prefs.defaults.posePrompts) setBoothPosePrompts(prefs.defaults.posePrompts);
      if (prefs.defaults.filter) applyVideoFilter(prefs.defaults.filter);
      if (prefs.defaults.funMode) setAppFunMode(prefs.defaults.funMode, false);
    }

    updateWelcomeBanner();
  }

  function updateWelcomeBanner() {
    if (!welcomeBanner) return;
    const isCompleted = preferenceManager.get('onboardingCompleted');
    const lastSession = preferenceManager.get('lastSession');
    const displayName = preferenceManager.get('profile.displayName');

    if (isCompleted || (lastSession && lastSession.timestamp > 0) || displayName) {
      welcomeBanner.style.display = 'flex';
      if (welcomeGreetingText) {
        welcomeGreetingText.textContent = preferenceManager.getGreeting();
      }
      if (welcomeSubtext && lastSession && lastSession.timestamp > 0) {
        const filterName = FILTER_PRESETS[lastSession.filter]?.name || lastSession.filter || 'Warm Vintage';
        welcomeSubtext.textContent = `${lastSession.photoCount || 4} photos · ${lastSession.countdown || 3}s countdown · ${filterName}`;
      } else if (welcomeSubtext) {
        welcomeSubtext.textContent = 'Customized booth · Ready to capture memories';
      }
    } else {
      welcomeBanner.style.display = 'none';
    }
  }

  if (btnApplyLastSetup) {
    btnApplyLastSetup.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const last = preferenceManager.get('lastSession');
      if (!last) return;

      if (last.photoCount) setBoothPhotoCount(last.photoCount);
      if (last.countdown) setBoothCountdown(last.countdown);
      if (last.filter) await setAppFilter(last.filter);
      if (last.layout) {
        document.querySelectorAll('.layout-card').forEach(c => c.classList.toggle('active', c.dataset.layout === last.layout));
        collageRenderer.updateSettings({ layoutId: last.layout });
        await updateCollagePreview();
      }
      if (last.frameColor) {
        collageRenderer.updateSettings({ backgroundColor: last.frameColor });
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === last.frameColor));
        await updateCollagePreview();
      }

      showHistoryToast(`Loaded last setup: ${last.photoCount} photos · ${last.countdown}s · ${FILTER_PRESETS[last.filter]?.name || 'Vintage'}`);
    });
  }

  let currentObStep = 1;

  function setOnboardingStep(step) {
    currentObStep = Math.max(1, Math.min(3, step));
    const step1 = document.getElementById('obStep1');
    const step2 = document.getElementById('obStep2');
    const step3 = document.getElementById('obStep3');
    const dot1 = document.getElementById('obDot1');
    const dot2 = document.getElementById('obDot2');
    const dot3 = document.getElementById('obDot3');

    if (step1) step1.classList.toggle('active', currentObStep === 1);
    if (step2) step2.classList.toggle('active', currentObStep === 2);
    if (step3) step3.classList.toggle('active', currentObStep === 3);

    if (dot1) dot1.classList.toggle('active', currentObStep === 1);
    if (dot2) dot2.classList.toggle('active', currentObStep === 2);
    if (dot3) dot3.classList.toggle('active', currentObStep === 3);

    if (btnPrevOnboarding) {
      btnPrevOnboarding.style.display = currentObStep > 1 ? 'inline-block' : 'none';
    }
    if (btnNextOnboarding) {
      btnNextOnboarding.textContent = currentObStep === 3 ? 'Start Snapping! ✨' : 'Next →';
    }
  }

  function openOnboardingModal() {
    if (!onboardingModal) return;
    currentObStep = 1;
    setOnboardingStep(1);
    if (obDisplayName) obDisplayName.value = preferenceManager.get('profile.displayName') || '';
    if (obBoothName) obBoothName.value = preferenceManager.get('profile.boothName') || '';

    const curP = preferenceManager.get('personality') || 'classic';
    document.querySelectorAll('#obPersonalityGrid .theme-card').forEach(card => {
      card.classList.toggle('active', card.dataset.personality === curP);
    });

    onboardingModal.classList.add('open', 'active');
    onboardingModal.setAttribute('aria-hidden', 'false');
  }

  function closeOnboardingModal() {
    if (!onboardingModal) return;
    onboardingModal.classList.remove('open', 'active');
    onboardingModal.setAttribute('aria-hidden', 'true');
  }

  if (btnSkipOnboarding) {
    btnSkipOnboarding.addEventListener('click', () => {
      soundManager.playButtonClick();
      preferenceManager.completeOnboarding();
      closeOnboardingModal();
      applyPreferencesToUI();
      showHistoryToast('Welcome! You can customize anytime in ⚙️ Settings.');
    });
  }

  if (btnPrevOnboarding) {
    btnPrevOnboarding.addEventListener('click', () => {
      soundManager.playButtonClick();
      setOnboardingStep(currentObStep - 1);
    });
  }

  if (btnNextOnboarding) {
    btnNextOnboarding.addEventListener('click', () => {
      soundManager.playButtonClick();
      if (currentObStep < 3) {

        if (currentObStep === 1) {
          if (obDisplayName) preferenceManager.set('profile.displayName', obDisplayName.value);
          if (obBoothName) preferenceManager.set('profile.boothName', obBoothName.value);
        }
        setOnboardingStep(currentObStep + 1);
      } else {

        if (obDisplayName) preferenceManager.set('profile.displayName', obDisplayName.value);
        if (obBoothName) preferenceManager.set('profile.boothName', obBoothName.value);
        preferenceManager.completeOnboarding();
        closeOnboardingModal();
        applyPreferencesToUI();
        showHistoryToast('✨ Setup complete! Enjoy your photobooth.');
      }
    });
  }

  if (obPersonalityGrid) {
    obPersonalityGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-card');
      if (!card || !card.dataset.personality) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#obPersonalityGrid .theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      preferenceManager.setPersonality(card.dataset.personality);
    });
  }

  if (obPhotoCountGroup) {
    obPhotoCountGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#obPhotoCountGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const count = parseInt(btn.dataset.count, 10);
      preferenceManager.set('defaults.photoCount', count);
      setBoothPhotoCount(count);
    });
  }

  if (obCountdownGroup) {
    obCountdownGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#obCountdownGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const s = parseInt(btn.dataset.seconds, 10);
      preferenceManager.set('defaults.countdown', s);
      setBoothCountdown(s);
    });
  }

  function openPreferencesModal() {
    if (!preferencesModal) return;
    soundManager.playButtonClick();
    renderPreferencesFormValues();
    preferencesModal.classList.add('open', 'active');
    preferencesModal.setAttribute('aria-hidden', 'false');
  }

  function closePreferencesModal() {
    if (!preferencesModal) return;
    preferencesModal.classList.remove('open', 'active');
    preferencesModal.setAttribute('aria-hidden', 'true');
  }

  if (btnOpenPreferences) {
    btnOpenPreferences.addEventListener('click', openPreferencesModal);
  }
  if (btnClosePreferences) {
    btnClosePreferences.addEventListener('click', closePreferencesModal);
  }
  if (btnDonePreferences) {
    btnDonePreferences.addEventListener('click', () => {
      soundManager.playButtonClick();
      closePreferencesModal();
      showHistoryToast('✓ Preferences saved');
    });
  }

  [onboardingModal, preferencesModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          if (modal === preferencesModal) closePreferencesModal();
        }
      });
    }
  });

  if (prefTabs) {
    prefTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.modal-tab-btn');
      if (!btn || !btn.dataset.tab) return;
      soundManager.playButtonClick();
      switchPrefTab(btn.dataset.tab);
    });
  }

  function switchPrefTab(tabName) {
    document.querySelectorAll('#prefTabs .modal-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    const panels = {
      profile: document.getElementById('tabProfile'),
      defaults: document.getElementById('tabDefaults'),
      appearance: document.getElementById('tabAppearance'),
      experience: document.getElementById('tabExperience'),
      favorites: document.getElementById('tabFavorites'),
      ai: document.getElementById('tabAi'),
      data: document.getElementById('tabData'),
      pwa: document.getElementById('tabPwa'),
    };

    Object.entries(panels).forEach(([name, panel]) => {
      if (panel) {
        panel.style.display = name === tabName ? 'block' : 'none';
      }
    });

    if (tabName === 'favorites') {
      renderFavoritesTabLists();
    } else if (tabName === 'data') {
      refreshDataTabStats();
    } else if (tabName === 'ai') {
      aiUI.updateSettingsStatusUI();
    }
  }

  function renderPreferencesFormValues() {
    const prefs = preferenceManager.getAll();

    if (prefDisplayName) prefDisplayName.value = prefs.profile?.displayName || '';
    if (prefBoothName) prefBoothName.value = prefs.profile?.boothName || '';
    if (prefGreeting) prefGreeting.value = prefs.profile?.greeting || '';

    if (prefPhotoCountGroup) {
      document.querySelectorAll('#prefPhotoCountGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === (prefs.defaults?.photoCount || 4));
      });
    }
    if (prefCountdownGroup) {
      document.querySelectorAll('#prefCountdownGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.seconds, 10) === (prefs.defaults?.countdown || 3));
      });
    }
    if (prefPosePromptsGroup) {
      document.querySelectorAll('#prefPosePromptsGroup .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === (prefs.defaults?.posePrompts || 'on'));
      });
    }
    if (prefDefaultFunMode) prefDefaultFunMode.value = prefs.defaults?.funMode || 'classic';
    if (prefDefaultLayout) prefDefaultLayout.value = prefs.defaults?.layout || 'vertical-strip';
    if (prefDefaultFilter) prefDefaultFilter.value = prefs.defaults?.filter || 'warm-vintage';
    if (prefDefaultFrameStyle) prefDefaultFrameStyle.value = prefs.defaults?.frameStyle || 'clean';

    if (prefThemesGrid) {
      document.querySelectorAll('#prefThemesGrid .theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.theme === (prefs.appearance?.theme || 'classic'));
      });
    }
    if (prefPersonalityGrid) {
      document.querySelectorAll('#prefPersonalityGrid .theme-card').forEach(card => {
        card.classList.toggle('active', card.dataset.personality === (prefs.personality || 'classic'));
      });
    }
    if (prefAccentPicker) {
      prefAccentPicker.value = prefs.appearance?.accentColor || '#C86D51';
    }

    if (prefToggleSound) {
      const isEnabled = prefs.experience?.soundEnabled !== false;
      prefToggleSound.textContent = isEnabled ? 'ON' : 'OFF';
      prefToggleSound.classList.toggle('active', isEnabled);
    }
    if (prefVolumeSlider && prefVolumeVal) {
      const vol = prefs.experience?.volume ?? 80;
      prefVolumeSlider.value = vol;
      prefVolumeVal.textContent = `${vol}%`;
    }
    if (prefSoundStyle) prefSoundStyle.value = prefs.experience?.soundStyle || 'classic';
    if (prefAnimIntensity) prefAnimIntensity.value = prefs.experience?.animationIntensity || 'full';
    if (prefPerformanceMode) prefPerformanceMode.value = performanceManager.getMode();
    if (prefToggleMirror) {
      const isMirror = prefs.experience?.mirrorPreview !== false;
      prefToggleMirror.textContent = isMirror ? 'ON' : 'OFF';
      prefToggleMirror.classList.toggle('active', isMirror);
    }

    renderFavoritesTabLists();
  }

  if (prefDisplayName) {
    prefDisplayName.addEventListener('input', (e) => {
      preferenceManager.set('profile.displayName', e.target.value);
    });
  }
  if (prefBoothName) {
    prefBoothName.addEventListener('input', (e) => {
      preferenceManager.set('profile.boothName', e.target.value);
      if (headerBrandTitle) headerBrandTitle.textContent = (e.target.value || 'CHEESYBOOTH').toUpperCase();
    });
  }
  if (prefGreeting) {
    prefGreeting.addEventListener('input', (e) => {
      preferenceManager.set('profile.greeting', e.target.value);
      if (headerBrandTag) headerBrandTag.textContent = e.target.value;
    });
  }

  if (prefPhotoCountGroup) {
    prefPhotoCountGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      const count = parseInt(btn.dataset.count, 10);
      preferenceManager.set('defaults.photoCount', count);
      setBoothPhotoCount(count);
      document.querySelectorAll('#prefPhotoCountGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  }

  if (prefCountdownGroup) {
    prefCountdownGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      const s = parseInt(btn.dataset.seconds, 10);
      preferenceManager.set('defaults.countdown', s);
      setBoothCountdown(s);
      document.querySelectorAll('#prefCountdownGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  }

  if (prefPosePromptsGroup) {
    prefPosePromptsGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      soundManager.playButtonClick();
      const mode = btn.dataset.mode;
      preferenceManager.set('defaults.posePrompts', mode);
      setBoothPosePrompts(mode);
      document.querySelectorAll('#prefPosePromptsGroup .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  }

  if (prefDefaultFunMode) {
    prefDefaultFunMode.addEventListener('change', (e) => {
      preferenceManager.set('defaults.funMode', e.target.value);
      setAppFunMode(e.target.value);
    });
  }
  if (prefDefaultLayout) {
    prefDefaultLayout.addEventListener('change', (e) => {
      preferenceManager.set('defaults.layout', e.target.value);
    });
  }
  if (prefDefaultFilter) {
    prefDefaultFilter.addEventListener('change', (e) => {
      preferenceManager.set('defaults.filter', e.target.value);
    });
  }
  if (prefDefaultFrameStyle) {
    prefDefaultFrameStyle.addEventListener('change', (e) => {
      preferenceManager.set('defaults.frameStyle', e.target.value);
    });
  }

  if (prefThemesGrid) {
    prefThemesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-card');
      if (!card || !card.dataset.theme) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#prefThemesGrid .theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      themeManager.setTheme(card.dataset.theme);
      preferenceManager.setTheme(card.dataset.theme);
      const curTheme = themeManager.getCurrentTheme();
      feedbackManager.showToast(`Applied ${curTheme.name} ✦`, { type: 'success', duration: 2500 });
    });
  }

  if (prefPersonalityGrid) {
    prefPersonalityGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.theme-card');
      if (!card || !card.dataset.personality) return;
      soundManager.playButtonClick();
      document.querySelectorAll('#prefPersonalityGrid .theme-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      preferenceManager.setPersonality(card.dataset.personality);
      applyPreferencesToUI();
      showHistoryToast(`Personality: ${card.dataset.personality.toUpperCase()}`);
    });
  }

  if (prefAccentPicker) {
    prefAccentPicker.addEventListener('input', (e) => {
      preferenceManager.setAccentColor(e.target.value);
    });
  }

  if (prefToggleSound) {
    prefToggleSound.addEventListener('click', () => {
      const current = preferenceManager.get('experience.soundEnabled') !== false;
      const next = !current;
      preferenceManager.set('experience.soundEnabled', next);
      soundManager.setMuted(!next);
      prefToggleSound.textContent = next ? 'ON' : 'OFF';
      prefToggleSound.classList.toggle('active', next);
      if (soundIcon) soundIcon.textContent = next ? '🔊' : '🔇';
      if (btnSoundToggle) btnSoundToggle.classList.toggle('active', next);
    });
  }

  if (prefVolumeSlider && prefVolumeVal) {
    prefVolumeSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value, 10);
      prefVolumeVal.textContent = `${vol}%`;
      preferenceManager.set('experience.volume', vol);
      soundManager.setVolume(vol);
    });
  }

  if (prefSoundStyle) {
    prefSoundStyle.addEventListener('change', (e) => {
      const style = e.target.value;
      preferenceManager.set('experience.soundStyle', style);
      soundManager.setSoundStyle(style);
      soundManager.playButtonClick();
    });
  }

  if (prefAnimIntensity) {
    prefAnimIntensity.addEventListener('change', (e) => {
      preferenceManager.set('experience.animationIntensity', e.target.value);
      preferenceManager.applyThemeAndAppearance();
    });
  }

  if (prefPerformanceMode) {
    prefPerformanceMode.addEventListener('change', (e) => {
      performanceManager.setMode(e.target.value, true);
      soundManager.playButtonClick();
      showHistoryToast(`⚡ Performance mode set to ${e.target.value.replace('-', ' ')}`);
    });
  }

  if (prefToggleMirror) {
    prefToggleMirror.addEventListener('click', () => {
      const current = preferenceManager.get('experience.mirrorPreview') !== false;
      const next = !current;
      preferenceManager.set('experience.mirrorPreview', next);
      prefToggleMirror.textContent = next ? 'ON' : 'OFF';
      prefToggleMirror.classList.toggle('active', next);
      if (videoEl) videoEl.style.transform = next ? 'scaleX(-1)' : 'none';
      soundManager.playButtonClick();
    });
  }

  function renderFavoritesTabLists() {

    if (favFiltersList) {
      favFiltersList.innerHTML = '';
      const filters = preferenceManager.getFavorites('filters') || [];
      if (filters.length === 0) {
        favFiltersList.innerHTML = '<span class="pref-hint">No favorite filters yet.</span>';
      } else {
        filters.forEach(filterId => {
          const chip = document.createElement('div');
          chip.className = 'pill-btn';
          chip.style.display = 'inline-flex';
          chip.style.alignItems = 'center';
          chip.style.gap = '6px';
          const name = FILTER_PRESETS[filterId]?.name || filterId;
          chip.innerHTML = `<span>${name}</span> <span style="font-size:10px; cursor:pointer; opacity:0.7;" title="Remove">✕</span>`;
          chip.querySelector('span:last-child').addEventListener('click', (e) => {
            e.stopPropagation();
            preferenceManager.removeFavorite('filters', filterId);
            renderFavoritesTabLists();
            showHistoryToast(`Removed ${name} from favorites`);
          });
          chip.addEventListener('click', async () => {
            await setAppFilter(filterId);
            showHistoryToast(`Selected filter: ${name}`);
          });
          favFiltersList.appendChild(chip);
        });
      }
    }

    if (favLayoutsList) {
      favLayoutsList.innerHTML = '';
      const layouts = preferenceManager.getFavorites('layouts') || [];
      if (layouts.length === 0) {
        favLayoutsList.innerHTML = '<span class="pref-hint">No favorite layouts yet.</span>';
      } else {
        layouts.forEach(layoutId => {
          const layoutObj = COLLAGE_LAYOUTS[layoutId];
          const name = layoutObj?.name || layoutId;
          const chip = document.createElement('div');
          chip.className = 'pill-btn';
          chip.style.display = 'inline-flex';
          chip.style.alignItems = 'center';
          chip.style.gap = '6px';
          chip.innerHTML = `<span>${name}</span> <span style="font-size:10px; cursor:pointer; opacity:0.7;" title="Remove">✕</span>`;
          chip.querySelector('span:last-child').addEventListener('click', (e) => {
            e.stopPropagation();
            preferenceManager.removeFavorite('layouts', layoutId);
            renderFavoritesTabLists();
            showHistoryToast(`Removed ${name} from favorites`);
          });
          chip.addEventListener('click', async () => {
            document.querySelectorAll('.layout-card').forEach(c => c.classList.toggle('active', c.dataset.layout === layoutId));
            collageRenderer.updateSettings({ layoutId });
            await updateCollagePreview();
            showHistoryToast(`Selected layout: ${name}`);
          });
          favLayoutsList.appendChild(chip);
        });
      }
    }

    if (favStickersList) {
      favStickersList.innerHTML = '';
      const stickers = preferenceManager.getFavorites('stickers') || [];
      if (stickers.length === 0) {
        favStickersList.innerHTML = '<span class="pref-hint">No favorite stickers yet.</span>';
      } else {
        stickers.forEach(sticker => {
          const isObj = typeof sticker === 'object';
          const symbol = isObj ? (sticker.emoji || '⭐') : sticker;
          const chip = document.createElement('div');
          chip.className = 'pill-btn';
          chip.style.display = 'inline-flex';
          chip.style.alignItems = 'center';
          chip.style.gap = '6px';
          chip.innerHTML = `<span>${symbol}</span> <span style="font-size:10px; cursor:pointer; opacity:0.7;" title="Remove">✕</span>`;
          chip.querySelector('span:last-child').addEventListener('click', (e) => {
            e.stopPropagation();
            preferenceManager.removeFavorite('stickers', isObj ? (sticker.id || symbol) : symbol);
            renderFavoritesTabLists();
            showHistoryToast(`Removed stamp from favorites`);
          });
          chip.addEventListener('click', async () => {
            if (isObj && sticker.imgSrc) {
              await collageRenderer.addSticker(sticker.imgSrc, sticker.type || 'image');
            } else {
              await collageRenderer.addSticker(symbol, 'emoji');
            }
            await updateCollagePreview();
            showHistoryToast(`Added stamp: ${symbol}`);
          });
          favStickersList.appendChild(chip);
        });
      }
    }
  }

  async function refreshDataTabStats() {
    if (!dataPhotoCountBadge) return;
    try {
      const summary = await privacyManager.getLocalDataSummary();
      dataPhotoCountBadge.textContent = `${summary.photos.sessionCount} sessions (${summary.photos.totalPhotos} photos)`;
      dataCollageCountBadge.textContent = `${summary.collages.count} saved`;
      dataPrefsBadge.textContent = `${summary.preferences.boothTitle} (${summary.preferences.theme})`;
      dataEngineBadge.textContent = summary.privacyStatus.storageEngine;
    } catch (e) {
      dataPhotoCountBadge.textContent = '0 sessions (0 photos)';
      dataCollageCountBadge.textContent = '0 saved';
    }
  }

  if (btnRefreshDataStats) {
    btnRefreshDataStats.addEventListener('click', async () => {
      soundManager.playButtonClick();
      await refreshDataTabStats();
      showPrivacyToast('Storage metrics updated', 'info', '↻');
    });
  }

  let pendingDeleteType = null;

  function openDeleteConfirm(type) {
    pendingDeleteType = type;
    if (!deleteConfirmModal) return;

    if (type === 'photos') {
      deleteConfirmTitle.textContent = 'Delete Stored Photos?';
      deleteConfirmDesc.textContent = 'This will permanently remove all captured photobooth sessions from your browser storage. Saved collage prints and settings will remain completely safe.';
    } else if (type === 'collages') {
      deleteConfirmTitle.textContent = 'Delete Saved Collages?';
      deleteConfirmDesc.textContent = 'This will permanently remove saved collage prints and custom arrangements from your local storage. Your photos and settings will remain completely safe.';
    } else if (type === 'prefs') {
      deleteConfirmTitle.textContent = 'Reset Preferences?';
      deleteConfirmDesc.textContent = 'This will reset booth theme, sound options, and custom titles to defaults. Your photos and collages will remain completely untouched.';
    } else if (type === 'all') {
      deleteConfirmTitle.textContent = 'Clear All Say Cheese Data?';
      deleteConfirmDesc.textContent = 'This will completely wipe all photos, saved collages, preferences, and favorites stored in this browser. This action cannot be undone.';
    }

    deleteConfirmModal.classList.add('open', 'active');
    deleteConfirmModal.setAttribute('aria-hidden', 'false');
  }

  function closeDeleteConfirm() {
    pendingDeleteType = null;
    if (deleteConfirmModal) {
      deleteConfirmModal.classList.remove('open', 'active');
      deleteConfirmModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnDeletePhotos) {
    btnDeletePhotos.addEventListener('click', () => {
      soundManager.playButtonClick();
      openDeleteConfirm('photos');
    });
  }

  if (btnDeleteCollages) {
    btnDeleteCollages.addEventListener('click', () => {
      soundManager.playButtonClick();
      openDeleteConfirm('collages');
    });
  }

  if (btnResetPrefsOnly) {
    btnResetPrefsOnly.addEventListener('click', () => {
      soundManager.playButtonClick();
      openDeleteConfirm('prefs');
    });
  }

  if (btnClearAllData) {
    btnClearAllData.addEventListener('click', () => {
      soundManager.playButtonClick();
      openDeleteConfirm('all');
    });
  }

  if (btnCloseDeleteConfirm) {
    btnCloseDeleteConfirm.addEventListener('click', closeDeleteConfirm);
  }

  if (btnCancelDeleteConfirm) {
    btnCancelDeleteConfirm.addEventListener('click', closeDeleteConfirm);
  }

  if (btnProceedDeleteConfirm) {
    btnProceedDeleteConfirm.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const type = pendingDeleteType;
      closeDeleteConfirm();

      if (type === 'photos') {
        await privacyManager.deleteStoredPhotos();
        showPrivacyToast('🗑️ Stored photos removed from device', 'info');
        keyboardManager.announce('Stored photos removed from browser storage.');
      } else if (type === 'collages') {
        await privacyManager.deleteSavedCollages();
        showPrivacyToast('🗑️ Saved collages removed from device', 'info');
        keyboardManager.announce('Saved collages removed from browser storage.');
      } else if (type === 'prefs') {
        privacyManager.resetPreferences();
        applyPreferencesToUI();
        renderPreferencesFormValues();
        showPrivacyToast('↺ Preferences reset to defaults', 'info');
        keyboardManager.announce('Preferences reset to default values.');
      } else if (type === 'all') {
        await privacyManager.clearAllLocalData();
        applyPreferencesToUI();
        renderPreferencesFormValues();
        showPrivacyToast('🧹 All Say Cheese local data cleared', 'info');
        keyboardManager.announce('All Say Cheese local browser data cleared.');
      }

      await refreshDataTabStats();
    });
  }

  if (btnExportPrefs) {
    btnExportPrefs.addEventListener('click', () => {
      soundManager.playButtonClick();
      const json = preferenceManager.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = storageManager.createManagedObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocket-booth-preferences-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      storageManager.revokeManagedObjectURL(url);
      showPrivacyToast('💾 Preferences exported to JSON', 'info');
    });
  }

  if (importPrefsFile) {
    importPrefsFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.size > 100 * 1024) {
        showPrivacyToast('Preferences file is too large (max 100KB)', 'error');
        importPrefsFile.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const success = preferenceManager.importJSON(event.target.result);
          if (success) {
            soundManager.playButtonClick();
            applyPreferencesToUI();
            renderPreferencesFormValues();
            showPrivacyToast('📥 Preferences imported safely', 'info');
            refreshDataTabStats();
          } else {
            showPrivacyToast('Invalid preferences JSON schema', 'error');
          }
        } catch (err) {
          showPrivacyToast('Could not import preferences file', 'error');
        }
        importPrefsFile.value = '';
      };
      reader.readAsText(file);
    });
  }

  if (btnResetPrefs) {
    btnResetPrefs.addEventListener('click', () => {
      openDeleteConfirm('prefs');
    });
  }

  preferenceManager.subscribe(() => {
    applyPreferencesToUI();
    renderPreferencesFormValues();
    refreshDataTabStats();
  });

  let currentSurpriseSetup = null;

  function renderSurpriseModal(config) {
    if (!config) return;
    currentSurpriseSetup = config;

    if (surpriseFamilyIcon) surpriseFamilyIcon.textContent = config.familyIcon || '✨';
    if (surpriseFamilyTitle) surpriseFamilyTitle.textContent = config.familyName || 'Curated Style';
    if (surpriseFamilyTagline) surpriseFamilyTagline.textContent = `${config.familyName} style family collection`;

    if (surpriseValMode) surpriseValMode.textContent = `${config.modeIcon || '🎭'} ${config.modeName || config.modeId}`;
    if (surpriseValShots) surpriseValShots.textContent = `${config.photoCount} Photos`;
    if (surpriseValCountdown) surpriseValCountdown.textContent = `${config.countdown}s Timer`;
    if (surpriseValFilter) surpriseValFilter.textContent = config.filterName || config.filterId;
    if (surpriseValLayout) surpriseValLayout.textContent = config.layoutName || config.layoutId;
    if (surpriseValFrame) {
      surpriseValFrame.textContent = config.frameColor;
      surpriseValFrame.style.borderBottom = `3px solid ${config.frameColor}`;
    }

    document.querySelectorAll('#surpriseModal .btn-lock-toggle').forEach(btn => {
      const param = btn.dataset.param;
      const isLocked = randomizerEngine.isLocked(param);
      btn.textContent = isLocked ? '🔒' : '🔓';
      btn.classList.toggle('locked', isLocked);
      btn.setAttribute('title', isLocked ? `Locked (${param})` : `Unlocked (${param})`);
      btn.setAttribute('aria-pressed', isLocked ? 'true' : 'false');
    });
  }

  function openSurpriseModal() {
    soundManager.playButtonClick();
    const setup = randomizerEngine.generateSessionSurprise();
    renderSurpriseModal(setup);
    if (surpriseModal) {
      surpriseModal.classList.add('active');
      surpriseModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSurpriseModal() {
    if (surpriseModal) {
      surpriseModal.classList.remove('active');
      surpriseModal.setAttribute('aria-hidden', 'true');
    }
  }

  async function applySurpriseSetup(config) {
    if (!config) return;
    soundManager.playButtonClick();

    setBoothPhotoCount(config.photoCount);

    setAppFunMode(config.modeId);

    setBoothCountdown(config.countdown);

    await setAppFilter(config.filterId);

    collageRenderer.updateSettings({
      layout: config.layoutId,
      frameColor: config.frameColor,
      frameStyle: config.frameStyle,
      fontFamily: config.fontFamily || 'Space Grotesk',
      stampText: config.stampText || '',
    });

    renderLayoutPicker(activeLayoutCat);
    document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.dataset.color === config.frameColor));
    document.querySelectorAll('#frameStyleGroup .pill-btn').forEach(b => b.classList.toggle('active', b.dataset.style === config.frameStyle));
    if (footerFontSelect) footerFontSelect.value = config.fontFamily || 'Space Grotesk';

    closeSurpriseModal();
    showHistoryToast(`✨ Applied "${config.familyName}" surprise setup!`);
  }

  if (btnSurpriseMe) {
    btnSurpriseMe.addEventListener('click', () => {
      openSurpriseModal();
    });
  }

  if (btnCloseSurprise) {
    btnCloseSurprise.addEventListener('click', () => {
      soundManager.playButtonClick();
      closeSurpriseModal();
    });
  }

  if (btnCancelSurprise) {
    btnCancelSurprise.addEventListener('click', () => {
      soundManager.playButtonClick();
      closeSurpriseModal();
    });
  }

  if (surpriseModal) {
    surpriseModal.addEventListener('click', (e) => {
      if (e.target === surpriseModal) {
        closeSurpriseModal();
      }
    });
  }

  if (btnTryAgainSurprise) {
    btnTryAgainSurprise.addEventListener('click', () => {
      soundManager.playButtonClick();
      const newSetup = randomizerEngine.generateSessionSurprise();
      renderSurpriseModal(newSetup);
    });
  }

  if (btnApplySurprise) {
    btnApplySurprise.addEventListener('click', async () => {
      await applySurpriseSetup(currentSurpriseSetup);
    });
  }

  if (surpriseModal) {
    surpriseModal.addEventListener('click', (e) => {
      const lockBtn = e.target.closest('.btn-lock-toggle');
      if (lockBtn) {
        soundManager.playButtonClick();
        const param = lockBtn.dataset.param;
        let curVal;
        if (param === 'mode') curVal = currentSurpriseSetup?.modeId;
        else if (param === 'photoCount') curVal = currentSurpriseSetup?.photoCount;
        else if (param === 'countdown') curVal = currentSurpriseSetup?.countdown;
        else if (param === 'filter') curVal = currentSurpriseSetup?.filterId;
        else if (param === 'layout') curVal = currentSurpriseSetup?.layoutId;
        else if (param === 'frameColor') curVal = currentSurpriseSetup?.frameColor;

        randomizerEngine.toggleLock(param, curVal);
        renderSurpriseModal(currentSurpriseSetup);
        return;
      }

      const rerollBtn = e.target.closest('.btn-reroll-item');
      if (rerollBtn) {
        soundManager.playButtonClick();
        const param = rerollBtn.dataset.param;
        const updated = randomizerEngine.rerollParameter(currentSurpriseSetup, param);
        renderSurpriseModal(updated);
        return;
      }
    });
  }

  const keyboardHelpModal = document.getElementById('keyboardHelpModal');
  const btnKeyboardHelp = document.getElementById('btnKeyboardHelp');
  const btnCloseKeyboardHelp = document.getElementById('btnCloseKeyboardHelp');
  const btnDoneKeyboardHelp = document.getElementById('btnDoneKeyboardHelp');

  function openKeyboardHelpModal() {
    soundManager.playButtonClick();
    if (keyboardHelpModal) {
      keyboardManager.openModal(keyboardHelpModal);
      keyboardManager.announce('Keyboard shortcuts help dialog opened');
    }
  }

  function closeKeyboardHelpModal() {
    if (keyboardHelpModal) {
      keyboardManager.closeModal(keyboardHelpModal);
    }
  }

  if (btnKeyboardHelp) {
    btnKeyboardHelp.addEventListener('click', openKeyboardHelpModal);
  }
  if (btnCloseKeyboardHelp) {
    btnCloseKeyboardHelp.addEventListener('click', closeKeyboardHelpModal);
  }
  if (btnDoneKeyboardHelp) {
    btnDoneKeyboardHelp.addEventListener('click', closeKeyboardHelpModal);
  }

  keyboardManager.init({ announcerId: 'a11yAnnouncer' });

  keyboardManager.on('help', () => {
    if (keyboardHelpModal && keyboardHelpModal.classList.contains('active')) {
      closeKeyboardHelpModal();
    } else {
      openKeyboardHelpModal();
    }
  });

  keyboardManager.on('space', () => {
    if (btnShutter && !btnShutter.disabled) {
      btnShutter.click();
    }
  });

  keyboardManager.on('undo', () => {
    if (btnUndo && !btnUndo.disabled) {
      btnUndo.click();
    } else if (btnReviewUndo && !btnReviewUndo.disabled) {
      btnReviewUndo.click();
    }
  });

  keyboardManager.on('redo', () => {
    if (btnRedo && !btnRedo.disabled) {
      btnRedo.click();
    } else if (btnReviewRedo && !btnReviewRedo.disabled) {
      btnReviewRedo.click();
    }
  });

  keyboardManager.on('escape', () => {
    if (selectedStickerId) {
      deselectSticker();
      keyboardManager.announce('Deselected stamp');
    }
  });

  keyboardManager.on('rotate', () => {
    const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
    if (!sticker || sticker.locked) return;
    const prevRot = sticker.rotation || 0;
    sticker.rotation = (prevRot + 45) % 360;
    historyManager.push({
      type: 'sticker-rotate',
      description: 'Rotated stamp 45°',
      undo: async () => {
        sticker.rotation = prevRot;
        await updateCollagePreview();
      },
      redo: async () => {
        sticker.rotation = (prevRot + 45) % 360;
        await updateCollagePreview();
      },
    });
    updateCollagePreview();
  });

  keyboardManager.on('duplicate', () => {
    if (btnDuplicateSticker) {
      btnDuplicateSticker.click();
    }
  });

  keyboardManager.on('delete', () => {
    const sticker = (collageRenderer.settings.stickers || []).find(s => s.id === selectedStickerId);
    if (!sticker) return;
    soundManager.playButtonClick();
    const removedIndex = collageRenderer.settings.stickers.findIndex(s => s.id === sticker.id);
    const removedSticker = { ...sticker };
    collageRenderer.removeSticker(sticker.id);
    selectedStickerId = null;
    historyManager.push({
      type: 'sticker-delete',
      description: 'Deleted stamp',
      undo: async () => {
        collageRenderer.settings.stickers.splice(removedIndex, 0, removedSticker);
        selectedStickerId = removedSticker.id;
        await updateCollagePreview();
      },
      redo: async () => {
        collageRenderer.removeSticker(removedSticker.id);
        selectedStickerId = null;
        await updateCollagePreview();
      },
    });
    updateCollagePreview();
    showHistoryToast('🗑️ Stamp removed');
  });

  keyboardManager.on('layer', (e) => {
    if (e.key === ']') {
      if (btnLayerForward) btnLayerForward.click();
    } else if (e.key === '[') {
      if (btnLayerBackward) btnLayerBackward.click();
    }
    return true;
  });

  keyboardManager.on('stickerNudge', (e) => {
    const stickers = collageRenderer.settings.stickers || [];
    const sticker = stickers.find(s => s.id === selectedStickerId);
    if (!sticker) return false;

    const step = e.shiftKey ? 0.04 : 0.008;
    if (e.key === 'ArrowUp') sticker.yRatio = Math.max(0.02, (sticker.yRatio || 0.5) - step);
    else if (e.key === 'ArrowDown') sticker.yRatio = Math.min(0.98, (sticker.yRatio || 0.5) + step);
    else if (e.key === 'ArrowLeft') sticker.xRatio = Math.max(0.02, (sticker.xRatio || 0.5) - step);
    else if (e.key === 'ArrowRight') sticker.xRatio = Math.min(0.98, (sticker.xRatio || 0.5) + step);

    updateCollagePreview();
    return true;
  });

  function triggerDebouncedAutosave() {
    const photos = photoManager.getAll();
    if (photos.length > 0 || collageRenderer.settings.stickers?.length > 0) {
      recoveryManager.scheduleAutosave({
        activeView: currentActiveView,
        photos,
        settings: collageRenderer.settings,
        funMode: sessionManager.currentMode?.id || 'classic',
      });
    }
  }

  function triggerImmediateAutosaveCheckpoint() {
    const photos = photoManager.getAll();
    if (photos.length > 0) {
      recoveryManager.saveImmediateCheckpoint({
        activeView: currentActiveView,
        photos,
        settings: collageRenderer.settings,
        funMode: sessionManager.currentMode?.id || 'classic',
      });
    }
  }

  recoveryManager.subscribe((status) => {
    if (!autosaveBadge || !autosaveDot || !autosaveText) return;
    if (status.isSaving) {
      autosaveBadge.classList.add('visible');
      autosaveDot.className = 'autosave-dot saving';
      autosaveText.textContent = 'Saving...';
    } else if (status.error) {
      autosaveBadge.classList.add('visible');
      autosaveDot.className = 'autosave-dot error';
      autosaveText.textContent = 'Autosave paused';
    } else if (status.lastSaved) {
      autosaveBadge.classList.add('visible');
      autosaveDot.className = 'autosave-dot';
      autosaveText.textContent = 'Saved';
    }
  });

  let pendingRecoverySnapshot = null;

  function openRecoveryModal(snapshot) {
    if (!recoveryModal) return;
    pendingRecoverySnapshot = snapshot;

    const count = snapshot.photos?.length || 0;
    if (recoveryPhotoCount) recoveryPhotoCount.textContent = `${count} photo${count === 1 ? '' : 's'}`;
    if (recoveryTimeAgo) {
      const mins = Math.max(1, Math.round((Date.now() - (snapshot.updatedAt || snapshot.timestamp || Date.now())) / 60000));
      recoveryTimeAgo.textContent = mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`;
    }
    if (recoveryLayout) recoveryLayout.textContent = snapshot.settings?.layoutId || 'Classic Strip';
    if (recoveryFilter) recoveryFilter.textContent = snapshot.settings?.filter || 'Warm Vintage';

    recoveryModal.classList.add('open', 'active');
    recoveryModal.setAttribute('aria-hidden', 'false');
    keyboardManager.announce('Unfinished session recovered. Press resume to restore.');
  }

  function closeRecoveryModal() {
    if (recoveryModal) {
      recoveryModal.classList.remove('open', 'active');
      recoveryModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnCloseRecoveryModal) {
    btnCloseRecoveryModal.addEventListener('click', async () => {
      soundManager.playButtonClick();
      await recoveryManager.clearInterruptedSession();
      closeRecoveryModal();
    });
  }

  if (btnDiscardRecovery) {
    btnDiscardRecovery.addEventListener('click', async () => {
      soundManager.playButtonClick();
      await recoveryManager.clearInterruptedSession();
      closeRecoveryModal();
      showPrivacyToast('Unfinished session discarded', 'info', '🗑️');
    });
  }

  if (btnResumeRecovery) {
    btnResumeRecovery.addEventListener('click', async () => {
      soundManager.playButtonClick();
      if (!pendingRecoverySnapshot) {
        closeRecoveryModal();
        return;
      }

      const snapshot = pendingRecoverySnapshot;
      closeRecoveryModal();

      if (Array.isArray(snapshot.photos) && snapshot.photos.length > 0) {
        photoManager.clear();
        snapshot.photos.forEach(p => photoManager.addPhoto(p.imageData || p, p.timestamp));
      }

      if (snapshot.settings) {
        collageRenderer.updateSettings(snapshot.settings);
        if (spacingSlider && snapshot.settings.spacing !== undefined) {
          spacingSlider.value = snapshot.settings.spacing;
          spacingValText.textContent = `${snapshot.settings.spacing}px`;
        }
        if (paddingSlider && snapshot.settings.padding !== undefined) {
          paddingSlider.value = snapshot.settings.padding;
          paddingValText.textContent = `${snapshot.settings.padding}px`;
        }
        if (borderRadiusSlider && snapshot.settings.borderRadius !== undefined) {
          borderRadiusSlider.value = snapshot.settings.borderRadius;
          borderRadiusValText.textContent = `${snapshot.settings.borderRadius}px`;
        }
        if (stampTextInput && snapshot.settings.stampText !== undefined) {
          stampTextInput.value = snapshot.settings.stampText;
        }
        if (footerFontSelect && snapshot.settings.fontFamily) {
          footerFontSelect.value = snapshot.settings.fontFamily;
        }
      }

      if (snapshot.funMode) {
        setAppFunMode(snapshot.funMode, false);
      }

      const targetView = snapshot.activeView || (snapshot.photos?.length ? 'collage' : 'booth');
      switchView(targetView);

      showPrivacyToast('↺ Session restored safely!', 'info', '✨');
      keyboardManager.announce('Interrupted photobooth session restored.');
    });
  }

  async function updateProjectsCountBadge() {
    if (!projectsCountBadge) return;
    try {
      const projects = await recoveryManager.getAllProjects();
      projectsCountBadge.textContent = projects.length;
      projectsCountBadge.style.display = projects.length > 0 ? 'inline-flex' : 'none';
    } catch (e) {
      projectsCountBadge.style.display = 'none';
    }
  }

  async function renderProjectsGrid() {
    if (!projectsGrid) return;
    projectsGrid.innerHTML = '';
    const projects = await recoveryManager.getAllProjects();

    if (!projects || projects.length === 0) {
      if (noProjectsMsg) noProjectsMsg.style.display = 'block';
      return;
    }
    if (noProjectsMsg) noProjectsMsg.style.display = 'none';

    projects.forEach((proj) => {
      const card = document.createElement('div');
      card.className = 'project-card';
      const dateStr = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const photoCount = proj.photos?.length || 0;
      const layoutTitle = proj.settings?.layoutId || 'Classic Strip';

      card.innerHTML = `
        <div class="project-thumbnail-wrapper">
          ${proj.thumbnail ? `<img src="${proj.thumbnail}" alt="${proj.name}" class="project-thumbnail" />` : `<div class="project-thumbnail-placeholder">📸</div>`}
        </div>
        <div class="project-info">
          <div class="project-name" title="${proj.name}">${proj.name}</div>
          <div class="project-meta">${photoCount} photos · ${layoutTitle} · ${dateStr}</div>
        </div>
        <div class="project-card-actions">
          <button class="btn-project-load" data-id="${proj.id}" title="Load project into Collage Studio">Open</button>
          <button class="btn-project-duplicate" data-id="${proj.id}" title="Duplicate this project">📋</button>
          <button class="btn-project-export" data-id="${proj.id}" title="Export project backup (.json)">💾</button>
          <button class="btn-project-delete" data-id="${proj.id}" title="Delete project">🗑️</button>
        </div>
      `;
      projectsGrid.appendChild(card);
    });
  }

  if (projectsGrid) {
    projectsGrid.addEventListener('click', async (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const id = target.dataset.id;
      if (!id) return;

      if (target.classList.contains('btn-project-load')) {
        soundManager.playButtonClick();
        const proj = await recoveryManager.getProject(id);
        if (proj) {
          if (Array.isArray(proj.photos)) {
            photoManager.clear();
            proj.photos.forEach(p => photoManager.addPhoto(p.imageData || p, p.timestamp));
          }
          if (proj.settings) {
            collageRenderer.updateSettings(proj.settings);
          }
          if (proj.funMode) {
            setAppFunMode(proj.funMode, false);
          }
          closeProjectsModal();
          switchView('collage');
          updateCollagePreview();
          showPrivacyToast(`Loaded "${proj.name}"`, 'info', '📁');
        }
      } else if (target.classList.contains('btn-project-duplicate')) {
        soundManager.playButtonClick();
        await recoveryManager.duplicateProject(id);
        await renderProjectsGrid();
        await updateProjectsCountBadge();
        showPrivacyToast('Project duplicated', 'info', '📋');
      } else if (target.classList.contains('btn-project-export')) {
        soundManager.playButtonClick();
        const proj = await recoveryManager.getProject(id);
        if (proj) {
          const backupJson = recoveryManager.exportProjectBackup(proj);
          const blob = new Blob([backupJson], { type: 'application/json' });
          const url = storageManager.createManagedObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pocket-booth-project-${proj.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          storageManager.revokeManagedObjectURL(url);
          showPrivacyToast('Project backup downloaded', 'info', '💾');
        }
      } else if (target.classList.contains('btn-project-delete')) {
        soundManager.playButtonClick();
        await recoveryManager.deleteProject(id);
        await renderProjectsGrid();
        await updateProjectsCountBadge();
        showPrivacyToast('Project deleted', 'info', '🗑️');
      }
    });
  }

  function openProjectsModal() {
    if (!projectsModal) return;
    soundManager.playButtonClick();
    renderProjectsGrid();
    projectsModal.classList.add('open', 'active');
    projectsModal.setAttribute('aria-hidden', 'false');
  }

  function closeProjectsModal() {
    if (projectsModal) {
      projectsModal.classList.remove('open', 'active');
      projectsModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnOpenProjects) {
    btnOpenProjects.addEventListener('click', openProjectsModal);
  }

  if (btnCloseProjectsModal) {
    btnCloseProjectsModal.addEventListener('click', closeProjectsModal);
  }

  if (btnDoneProjects) {
    btnDoneProjects.addEventListener('click', closeProjectsModal);
  }

  function openSaveProjectModal() {
    if (!saveProjectModal) return;
    const defaultName = `Print ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;
    if (saveProjectNameInput) saveProjectNameInput.value = defaultName;
    saveProjectModal.classList.add('open', 'active');
    saveProjectModal.setAttribute('aria-hidden', 'false');
    if (saveProjectNameInput) {
      setTimeout(() => saveProjectNameInput.focus(), 50);
    }
  }

  function closeSaveProjectModal() {
    if (saveProjectModal) {
      saveProjectModal.classList.remove('open', 'active');
      saveProjectModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (btnSaveProject) {
    btnSaveProject.addEventListener('click', () => {
      soundManager.playButtonClick();
      openSaveProjectModal();
    });
  }

  if (btnCloseSaveProjectModal) {
    btnCloseSaveProjectModal.addEventListener('click', closeSaveProjectModal);
  }

  if (btnCancelSaveProject) {
    btnCancelSaveProject.addEventListener('click', closeSaveProjectModal);
  }

  if (btnConfirmSaveProject) {
    btnConfirmSaveProject.addEventListener('click', async () => {
      soundManager.playButtonClick();
      const name = saveProjectNameInput?.value.trim() || 'Untitled Project';
      let thumbnail = null;
      try {
        thumbnail = collageCanvas.toDataURL('image/jpeg', 0.6);
      } catch (e) {}

      await recoveryManager.saveProject({
        name,
        photos: photoManager.getAll(),
        settings: collageRenderer.settings,
        thumbnail,
        funMode: sessionManager.currentMode?.id || 'classic',
      });

      closeSaveProjectModal();
      await updateProjectsCountBadge();
      showPrivacyToast(`Saved "${name}" to Projects`, 'info', '💾');
      keyboardManager.announce(`Project "${name}" saved locally.`);
    });
  }

  if (btnBackupCurrentProject) {
    btnBackupCurrentProject.addEventListener('click', () => {
      soundManager.playButtonClick();
      const projectData = {
        name: stampTextInput?.value?.trim() || `CheesyBooth Collage - ${new Date().toISOString().slice(0, 10)}`,
        photos: photoManager.getAll(),
        settings: collageRenderer.settings,
        funMode: sessionManager.currentMode?.id || 'classic',
      };
      const backupJson = recoveryManager.exportProjectBackup(projectData);
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = storageManager.createManagedObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pocket-booth-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      storageManager.revokeManagedObjectURL(url);
      showPrivacyToast('Collage backup exported to JSON', 'info', '💾');
    });
  }

  if (importProjectFile) {
    importProjectFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.size > 25 * 1024 * 1024) { 
        showPrivacyToast('Backup file is too large (max 25MB)', 'error');
        importProjectFile.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const result = await recoveryManager.importProjectBackup(event.target.result);
          if (result.success) {
            soundManager.playButtonClick();
            await renderProjectsGrid();
            await updateProjectsCountBadge();
            showPrivacyToast(`Imported "${result.project.name}"`, 'info', '📥');
          } else {
            showPrivacyToast(`Import failed: ${result.error}`, 'error');
          }
        } catch (err) {
          showPrivacyToast('Could not parse backup file', 'error');
        }
        importProjectFile.value = '';
      };
      reader.readAsText(file);
    });
  }

  async function checkInterruptedSessionOnStartup() {
    try {
      const interrupted = await recoveryManager.detectInterruptedSession();
      if (interrupted && Array.isArray(interrupted.photos) && interrupted.photos.length > 0) {
        openRecoveryModal(interrupted);
      }
    } catch (e) {
      console.warn('Recovery check error:', e);
    }
  }

  renderFunModesList();
  renderLayoutPicker('all');
  restoreCollageAutosave();
  updateProjectsCountBadge();
  checkInterruptedSessionOnStartup();

  const defaultFilter = preferenceManager.get('defaults.filter') || 'warm-vintage';
  applyVideoFilter(defaultFilter);
  applyPreferencesToUI();
  setBoothCountdown(5);
  setBoothPhotoCount(4);

  aiUI.initDOM();

  const btnAiCaption = document.getElementById('btnAiCaption');
  if (btnAiCaption) {
    btnAiCaption.addEventListener('click', () => {
      soundManager.playButtonClick();
      aiUI.openCaptionModal((selectedCaption) => {
        if (stampTextInput) {
          stampTextInput.value = selectedCaption;
          stampTextInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        feedbackManager?.showToast(`Caption applied: "${selectedCaption}"`, 'info', '✨');
      });
    });
  }

  const btnPlanSession = document.getElementById('btnPlanSession');
  if (btnPlanSession) {
    btnPlanSession.addEventListener('click', () => {
      soundManager.playButtonClick();
      aiUI.openPlannerModal(async (plan) => {
        soundManager.playButtonClick();
        if (plan.themeId) {
          themeManager.setTheme(plan.themeId);
        }
        if (plan.filterId) {
          applyVideoFilter(plan.filterId);
        }
        if (plan.countdown) {
          currentCountdownSeconds = plan.countdown;
          document.querySelectorAll('#countdownGroup .pill-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.seconds, 10) === plan.countdown);
          });
        }
        if (plan.photoCount) {
          sessionTargetCount = plan.photoCount;
          document.querySelectorAll('#photoCountGroup .pill-btn').forEach(b => {
            b.classList.toggle('active', parseInt(b.dataset.count, 10) === plan.photoCount);
          });
          updateSessionCounter();
        }
        if (plan.modeId) {
          selectedFunMode = getFunMode(plan.modeId);
          renderFunModesList();
        }
        feedbackManager?.showToast(`Session planned: ${plan.title}`, 'success', '✨');
      });
    });
  }

  if (!preferenceManager.get('onboardingCompleted')) {
    openOnboardingModal();
  }
});
