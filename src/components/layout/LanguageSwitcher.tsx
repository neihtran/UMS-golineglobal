import { useLanguageStore } from '@/stores/languageStore';
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation('common');

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="h-9 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg-card))] px-3 text-sm text-[rgb(var(--text-secondary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary-light))/0.2] cursor-pointer"
      aria-label={t('language.switch')}
    >
      <option value="vi">{t('language.vi')}</option>
      <option value="en">{t('language.en')}</option>
    </select>
  );
}
