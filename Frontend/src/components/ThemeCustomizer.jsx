import React, { useState, useEffect } from 'react';
import { applyTheme } from '../utils/themeUtils';
import './ThemeCustomizer.css';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState({
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    secondaryHover: '#475569',
    background: '#0f172a',
    secondaryBackground: '#1e293b',
    tertiaryBackground: '#334155',
    cardBackground: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    textAccent: '#38bdf8',
    border: '#475569',
    danger: '#ef4444',
    dangerHover: '#dc2626',
    success: '#10b981',
    successHover: '#059669',
    warning: '#f59e0b',
    warningHover: '#d97706'
  });

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('userTheme');
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      setTheme(parsedTheme);
      applyTheme(parsedTheme);
    }
  }, []);

  const handleColorChange = (colorType, value) => {
    const newTheme = { ...theme, [colorType]: value };
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const saveTheme = () => {
    localStorage.setItem('userTheme', JSON.stringify(theme));
    alert('تم حفظ السمة الشخصية!');
    onClose();
  };

  const resetTheme = () => {
    const defaultTheme = {
      primary: '#3b82f6',
      secondary: '#64748b',
      background: '#0f172a',
      secondaryBackground: '#1e293b',
      tertiaryBackground: '#334155',
      cardBackground: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      textAccent: '#38bdf8',
      border: '#475569',
      danger: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b'
    };
    setTheme(defaultTheme);
    applyTheme(defaultTheme);
    localStorage.removeItem('userTheme');
  };

  const presetThemes = {
    default: {
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      secondary: '#64748b',
      secondaryHover: '#475569',
      background: '#0f172a',
      secondaryBackground: '#1e293b',
      tertiaryBackground: '#334155',
      cardBackground: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      textMuted: '#64748b',
      textAccent: '#38bdf8',
      border: '#475569',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      success: '#10b981',
      successHover: '#059669',
      warning: '#f59e0b',
      warningHover: '#d97706'
    },
    dark: {
      primary: '#8b5cf6',
      primaryHover: '#7c3aed',
      secondary: '#6b7280',
      secondaryHover: '#4b5563',
      background: '#111827',
      secondaryBackground: '#1f2937',
      tertiaryBackground: '#374151',
      cardBackground: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      textMuted: '#6b7280',
      textAccent: '#a78bfa',
      border: '#374151',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      success: '#10b981',
      successHover: '#059669',
      warning: '#f59e0b',
      warningHover: '#d97706'
    },
    ocean: {
      primary: '#06b6d4',
      primaryHover: '#0891b2',
      secondary: '#64748b',
      secondaryHover: '#475569',
      background: '#0c4a6e',
      secondaryBackground: '#164e63',
      tertiaryBackground: '#0369a1',
      cardBackground: '#164e63',
      text: '#f0f9ff',
      textSecondary: '#bae6fd',
      textMuted: '#64748b',
      textAccent: '#22d3ee',
      border: '#0369a1',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      success: '#10b981',
      successHover: '#059669',
      warning: '#fbbf24',
      warningHover: '#f59e0b'
    },
    forest: {
      primary: '#16a34a',
      primaryHover: '#15803d',
      secondary: '#64748b',
      secondaryHover: '#475569',
      background: '#14532d',
      secondaryBackground: '#166534',
      tertiaryBackground: '#15803d',
      cardBackground: '#166534',
      text: '#f0fdf4',
      textSecondary: '#bbf7d0',
      textMuted: '#64748b',
      textAccent: '#4ade80',
      border: '#15803d',
      danger: '#ef4444',
      dangerHover: '#dc2626',
      success: '#16a34a',
      successHover: '#15803d',
      warning: '#f59e0b',
      warningHover: '#d97706'
    }
  };

  const applyPreset = (presetName) => {
    const preset = presetThemes[presetName];
    setTheme(preset);
    applyTheme(preset);
  };

  if (!isOpen) return null;

  return (
    <div className="theme-customizer-overlay">
      <div className="theme-customizer-modal">
        <div className="theme-customizer-header">
          <h2>تخصيص السمة الشخصية</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="theme-customizer-content">
          <div className="preset-themes">
            <h3>السمات الجاهزة</h3>
            <div className="preset-buttons">
              {Object.keys(presetThemes).map(preset => (
                <button
                  key={preset}
                  className="preset-btn"
                  onClick={() => applyPreset(preset)}
                >
                  {preset === 'default' ? 'افتراضي' :
                   preset === 'dark' ? 'داكن' :
                   preset === 'ocean' ? 'محيط' : 'غابة'}
                </button>
              ))}
            </div>
          </div>

          <div className="color-pickers">
            <h3>تخصيص الألوان</h3>
            <div className="color-grid">
              <div className="color-item">
                <label>اللون الأساسي</label>
                <input
                  type="color"
                  value={theme.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون الأساسي عند التمرير</label>
                <input
                  type="color"
                  value={theme.primaryHover}
                  onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>اللون الثانوي</label>
                <input
                  type="color"
                  value={theme.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون الثانوي عند التمرير</label>
                <input
                  type="color"
                  value={theme.secondaryHover}
                  onChange={(e) => handleColorChange('secondaryHover', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>خلفية الصفحة</label>
                <input
                  type="color"
                  value={theme.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>خلفية ثانوية</label>
                <input
                  type="color"
                  value={theme.secondaryBackground}
                  onChange={(e) => handleColorChange('secondaryBackground', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>خلفية ثالثة</label>
                <input
                  type="color"
                  value={theme.tertiaryBackground}
                  onChange={(e) => handleColorChange('tertiaryBackground', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>خلفية البطاقات</label>
                <input
                  type="color"
                  value={theme.cardBackground}
                  onChange={(e) => handleColorChange('cardBackground', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النص الأساسي</label>
                <input
                  type="color"
                  value={theme.text}
                  onChange={(e) => handleColorChange('text', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النص الثانوي</label>
                <input
                  type="color"
                  value={theme.textSecondary}
                  onChange={(e) => handleColorChange('textSecondary', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النص الخافت</label>
                <input
                  type="color"
                  value={theme.textMuted}
                  onChange={(e) => handleColorChange('textMuted', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النص المميز</label>
                <input
                  type="color"
                  value={theme.textAccent}
                  onChange={(e) => handleColorChange('textAccent', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون الحدود</label>
                <input
                  type="color"
                  value={theme.border}
                  onChange={(e) => handleColorChange('border', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون الخطر</label>
                <input
                  type="color"
                  value={theme.danger}
                  onChange={(e) => handleColorChange('danger', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون الخطر عند التمرير</label>
                <input
                  type="color"
                  value={theme.dangerHover}
                  onChange={(e) => handleColorChange('dangerHover', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النجاح</label>
                <input
                  type="color"
                  value={theme.success}
                  onChange={(e) => handleColorChange('success', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون النجاح عند التمرير</label>
                <input
                  type="color"
                  value={theme.successHover}
                  onChange={(e) => handleColorChange('successHover', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون التحذير</label>
                <input
                  type="color"
                  value={theme.warning}
                  onChange={(e) => handleColorChange('warning', e.target.value)}
                />
              </div>
              <div className="color-item">
                <label>لون التحذير عند التمرير</label>
                <input
                  type="color"
                  value={theme.warningHover}
                  onChange={(e) => handleColorChange('warningHover', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="theme-customizer-footer">
          <button className="btn-secondary" onClick={resetTheme}>
            إعادة تعيين
          </button>
          <button className="btn-primary" onClick={saveTheme}>
            حفظ السمة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;