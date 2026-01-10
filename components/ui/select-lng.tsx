"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useEffect, useRef } from "react";

type LanguageOption = {
    value: string;
    label: string;
};

type SelectLngProps = {
    value?: string;
    onChange?: (value: string) => void;
    options?: LanguageOption[];
    triggerId?: string;
    triggerClassName?: string;
    size?: "sm" | "default";
    syncPath?: boolean;
    storageKey?: string;
};

export function SelectLng({
    value,
    onChange,
    options,
    triggerId,
    triggerClassName,
    size = "sm",
    syncPath = true,
    storageKey = "preferredLanguage",
}: SelectLngProps) {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const didInitRef = useRef(false);
    const selectValue = value ?? i18n.language;
    const items = options ?? [
        { value: "en", label: t("language.english") },
        { value: "vi", label: t("language.vietnamese") },
    ];
    const applyLanguage = (nextValue: string, shouldNotify: boolean) => {
        if (syncPath && pathname) {
            const segments = pathname.split("/").filter(Boolean);
            if (segments.length > 0) {
                segments[0] = nextValue;
                const search = searchParams.toString();
                router.push(`/${segments.join("/")}${search ? `?${search}` : ""}`);
            }
        } else {
            i18n.changeLanguage(nextValue);
        }
        if (typeof window !== "undefined") {
            window.localStorage.setItem(storageKey, nextValue);
        }
        if (shouldNotify) onChange?.(nextValue);
    };
    const handleChange = (nextValue: string) => applyLanguage(nextValue, true);

    useEffect(() => {
        if (didInitRef.current) return;
        didInitRef.current = true;
        if (typeof window === "undefined") return;
        const stored = window.localStorage.getItem(storageKey);
        if (!stored || stored === selectValue) return;
        applyLanguage(stored, false);
    }, [selectValue, storageKey]);

    return (
        <Select value={selectValue} onValueChange={handleChange}>
            <SelectTrigger id={triggerId} size={size} className={["min-w-0 w-[140px]", triggerClassName].filter(Boolean).join(" ")}>
                <Globe className="h-4 w-4 text-muted-foreground" />
                <SelectValue className="truncate" />
            </SelectTrigger>
            <SelectContent position="popper">
                {items.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
