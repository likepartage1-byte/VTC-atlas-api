import i18n from 'i18next';

export const formatNumber = (num: number, maximumFractionDigits = 2): string => {
  const currentLanguage = i18n.language || 'fr';
  // Force a Latin-based locale (like French 'fr') if user language is Arabic 'ar'
  const locale = currentLanguage.startsWith('ar') ? 'fr' : currentLanguage;
  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(num);
  } catch (error) {
    // Basic fallback using standard decimal comma
    return num.toFixed(maximumFractionDigits).replace('.', ',');
  }
};
