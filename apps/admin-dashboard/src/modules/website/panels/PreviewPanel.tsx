import React from 'react';
import { Monitor, Tablet, Smartphone, Sun, Moon } from 'lucide-react';
import type { HomepageConfig } from '../types/homepage-config.types';

interface Props {
  config: HomepageConfig;
  lang: string;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  previewTheme: 'dark' | 'light';
  onDeviceChange: (d: 'desktop' | 'tablet' | 'mobile') => void;
  onThemeChange: (t: 'dark' | 'light') => void;
  onSelectElement: (path: string, label: string) => void;
}

const fontSizeMap: Record<string, string> = {
  xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px',
  '2xl': '24px', '3xl': '30px', '4xl': '36px', '5xl': '48px',
  '6xl': '60px', '7xl': '72px', '8xl': '96px',
};

export const PreviewPanel: React.FC<Props> = ({
  config, lang, previewDevice, previewTheme, onDeviceChange, onThemeChange, onSelectElement,
}) => {
  const isAr = lang === 'AR';
  const isDark = previewTheme === 'dark';
  const theme = isDark ? config.theme.dark : config.theme.light;
  const hero = config.hero;
  const oneApp = config.oneApp;

  const deviceWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px';

  const getTextColor = (el: { style?: { color?: { light: string; dark: string } } }) =>
    isDark ? (el.style?.color?.dark || theme.heading) : (el.style?.color?.light || theme.heading);

  const getFont = (el: { style?: { fontSize?: string; fontWeight?: string } }) => ({
    fontSize: fontSizeMap[el.style?.fontSize || 'xl'] || '20px',
    fontWeight: el.style?.fontWeight || '600',
  });

  const overlayAlpha = hero.background.overlayOpacity / 100;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 gap-4">
        {/* Device toggle */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {([
            { id: 'desktop', icon: <Monitor size={13} /> },
            { id: 'tablet',  icon: <Tablet size={13} /> },
            { id: 'mobile',  icon: <Smartphone size={13} /> },
          ] as const).map(d => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDeviceChange(d.id)}
              className={`p-2 rounded-lg transition-all ${
                previewDevice === d.id ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-white'
              }`}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Preview</span>

        {/* Theme toggle */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onThemeChange('light')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewTheme === 'light' ? 'bg-yellow-500/20 text-yellow-400' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Sun size={11} />
          </button>
          <button
            type="button"
            onClick={() => onThemeChange('dark')}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewTheme === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'
            }`}
          >
            <Moon size={11} />
          </button>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="flex-1 overflow-auto p-4" style={{ backgroundColor: '#0a0a14' }}>
        <div
          className="mx-auto transition-all duration-300 overflow-hidden rounded-2xl shadow-2xl border border-slate-700/40"
          style={{
            width: deviceWidth,
            maxWidth: '100%',
            background: theme.background,
            direction: isAr ? 'rtl' : 'ltr',
          }}
        >
          {/* Hero Section Preview */}
          {config.sections.find(s => s.id === 'hero')?.visible && (
            <div
              className="relative"
              style={{ minHeight: '420px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Background */}
              {hero.background.src && (
                <img
                  src={hero.background.src}
                  alt="hero"
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              <div style={{ position: 'absolute', inset: 0, background: `rgba(2,6,23,${overlayAlpha})` }} />

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '40px 24px', width: '100%' }}>
                {/* Brand */}
                <div style={{
                  fontSize: '14px', fontWeight: '900', letterSpacing: '0.1em',
                  background: 'linear-gradient(to right, #683EE6, #818cf8)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  marginBottom: '8px',
                }}>
                  YALLA VTC
                </div>

                {/* Title */}
                {hero.title.style?.visible !== false && (
                  <div
                    onClick={() => onSelectElement('hero.title', 'Hero › Title')}
                    style={{
                      color: getTextColor(hero.title),
                      ...getFont(hero.title),
                      marginBottom: '16px',
                      cursor: 'pointer',
                      outline: '2px dashed transparent',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      transition: 'outline-color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
                    title="Click to edit"
                  >
                    {hero.title.text[lang as 'AR' | 'FR' | 'EN'] || hero.title.text.AR}
                  </div>
                )}

                {/* Subtitle */}
                {hero.subtitle.style?.visible !== false && (
                  <div
                    onClick={() => onSelectElement('hero.subtitle', 'Hero › Subtitle')}
                    style={{
                      color: getTextColor(hero.subtitle),
                      fontSize: '16px', fontWeight: '600',
                      maxWidth: '520px', margin: '0 auto 28px',
                      lineHeight: '1.6', cursor: 'pointer',
                      outline: '2px dashed transparent', borderRadius: '8px', padding: '4px 8px',
                      transition: 'outline-color 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
                    title="Click to edit"
                  >
                    {hero.subtitle.text[lang as 'AR' | 'FR' | 'EN'] || hero.subtitle.text.AR}
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {hero.primaryButton.style?.visible !== false && (
                    <div
                      onClick={() => onSelectElement('hero.primaryButton', 'Hero › Primary Button')}
                      style={{
                        background: hero.primaryButton.style?.bgColor || '#683EE6',
                        color: hero.primaryButton.style?.textColor || '#fff',
                        padding: '12px 24px', borderRadius: '14px',
                        fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                        outline: '2px dashed transparent', transition: 'outline-color 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
                    >
                      {hero.primaryButton.text[lang as 'AR' | 'FR' | 'EN'] || hero.primaryButton.text.AR}
                    </div>
                  )}
                  {hero.secondaryButton.style?.visible !== false && (
                    <div
                      onClick={() => onSelectElement('hero.secondaryButton', 'Hero › Secondary Button')}
                      style={{
                        border: '1.5px solid rgba(255,255,255,0.35)',
                        color: '#fff', padding: '12px 24px', borderRadius: '14px',
                        fontWeight: '800', fontSize: '13px', cursor: 'pointer',
                        outline: '2px dashed transparent', transition: 'outline-color 0.2s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
                    >
                      {hero.secondaryButton.text[lang as 'AR' | 'FR' | 'EN'] || hero.secondaryButton.text.AR}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* OneApp Section Preview */}
          {config.sections.find(s => s.id === 'oneApp')?.visible && oneApp.visible && (
            <div style={{ padding: '48px 32px', background: isDark ? theme.surface : '#fff', borderTop: `1px solid ${theme.border}` }}>
              {/* Badge */}
              <div style={{ display: 'flex', justifyContent: isAr ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'rgba(104,62,230,0.1)', border: '1px solid rgba(104,62,230,0.2)',
                  color: '#a78bfa', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800',
                }}>
                  ✨ {oneApp.badge.text[lang as 'AR' | 'FR' | 'EN'] || oneApp.badge.text.AR}
                </div>
              </div>

              {/* Heading */}
              <div
                onClick={() => onSelectElement('oneApp.heading', 'OneApp › Heading')}
                style={{
                  color: getTextColor(oneApp.heading),
                  ...getFont(oneApp.heading),
                  textAlign: isAr ? 'right' : 'left',
                  marginBottom: '12px', cursor: 'pointer',
                  outline: '2px dashed transparent', borderRadius: '8px', padding: '4px',
                  transition: 'outline-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
              >
                {oneApp.heading.text[lang as 'AR' | 'FR' | 'EN'] || oneApp.heading.text.AR}
              </div>

              {/* Subtitle */}
              <div
                onClick={() => onSelectElement('oneApp.subtitle', 'OneApp › Subtitle')}
                style={{
                  color: getTextColor(oneApp.subtitle),
                  fontSize: '15px', fontWeight: '500', lineHeight: '1.7',
                  textAlign: isAr ? 'right' : 'left',
                  cursor: 'pointer', outline: '2px dashed transparent', borderRadius: '8px', padding: '4px',
                  transition: 'outline-color 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'rgba(104,62,230,0.6)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.outlineColor = 'transparent'; }}
              >
                {oneApp.subtitle.text[lang as 'AR' | 'FR' | 'EN'] || oneApp.subtitle.text.AR}
              </div>
            </div>
          )}

          {/* Locked sections indicator */}
          {config.sections.filter(s => !['hero','oneApp'].includes(s.id) && s.visible).length > 0 && (
            <div style={{
              padding: '20px 32px', textAlign: 'center', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderTop: `1px solid ${theme.border}`,
            }}>
              <p style={{ color: theme.muted, fontSize: '11px', fontWeight: '600' }}>
                + {config.sections.filter(s => !['hero','oneApp'].includes(s.id) && s.visible).length} more sections visible
                <br/><span style={{ opacity: 0.6 }}>Full editing coming in Phase 7-B.6.3</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
