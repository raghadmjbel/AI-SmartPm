// themeUtils.js
export const applyTheme = (themeColors) => {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', themeColors.primary);
  root.style.setProperty('--primary-hover', themeColors.primaryHover);
  root.style.setProperty('--secondary-color', themeColors.secondary);
  root.style.setProperty('--secondary-hover', themeColors.secondaryHover);
  root.style.setProperty('--bg-primary', themeColors.background);
  root.style.setProperty('--bg-secondary', themeColors.secondaryBackground);
  root.style.setProperty('--bg-tertiary', themeColors.tertiaryBackground);
  root.style.setProperty('--bg-card', themeColors.cardBackground);
  root.style.setProperty('--bg-modal', themeColors.cardBackground); // Use card background for modal
  root.style.setProperty('--bg-gradient', `linear-gradient(135deg, ${themeColors.background} 0%, ${themeColors.secondaryBackground} 50%, ${themeColors.tertiaryBackground} 100%)`);
  root.style.setProperty('--text-primary', themeColors.text);
  root.style.setProperty('--text-secondary', themeColors.textSecondary);
  root.style.setProperty('--text-muted', themeColors.textMuted);
  root.style.setProperty('--text-accent', themeColors.textAccent);
  root.style.setProperty('--border-color', themeColors.border);
  root.style.setProperty('--danger-color', themeColors.danger);
  root.style.setProperty('--danger-hover', themeColors.dangerHover);
  root.style.setProperty('--success-color', themeColors.success);
  root.style.setProperty('--success-hover', themeColors.successHover);
  root.style.setProperty('--warning-color', themeColors.warning);
  root.style.setProperty('--warning-hover', themeColors.warningHover);
};