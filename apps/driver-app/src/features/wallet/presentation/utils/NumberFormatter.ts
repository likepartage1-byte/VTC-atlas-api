import i18n from 'i18next';

export const formatNumber = (num: number, maximumFractionDigits = 2): string => {
  const currentLanguage = i18n.language || 'en';
  try {
    return new Intl.NumberFormat(currentLanguage, {
      minimumFractionDigits: 2,
      maximumFractionDigits,
    }).format(num);
  } catch (error) {
    // Basic fallback if Intl is not fully supported on some ancient Android JS engines
    return num.toFixed(maximumFractionDigits).replace('.', ',');
  }
};
