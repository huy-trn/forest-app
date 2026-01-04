import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export function SelectLng() {
    const { t, i18n } = useTranslation();
    return (
        <Select value={i18n.language} onValueChange={(val) => i18n.changeLanguage(val)}>
            <SelectTrigger className="w-[120px] mr-2">
                <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
                <SelectItem value="en">{t("language.english")}</SelectItem>
                <SelectItem value="vi">{t("language.vietnamese")}</SelectItem>
            </SelectContent>
        </Select>
    );
}