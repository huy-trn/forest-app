import { useTranslation } from "react-i18next";

export function SelectLng() {
    const {t, i18n } = useTranslation();
    return (
        <select
            value={i18n.language}
            onChange={e => i18n.changeLanguage(e.target.value)}
            className="border rounded px-2 py-1 text-sm mr-2"
            style={{ minWidth: 90 }}
        >
            <option value="en">{t('language.english')}</option>
            <option value="vi">{t('language.vietnamese')}</option>
        </select>
    )
}