import PhoneInputLib,{getCountryCallingCode} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Label } from "./label";

type PhoneInputProps = {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultCountry?: string; // ISO country code, e.g. "VN"
};

export function PhoneInput({
  value,
  onChange,
  label,
  placeholder = "Enter phone number",
  disabled,
  defaultCountry = "VN",
}: PhoneInputProps) {
  const normalized = value || "";

  const handleChange = (val: string | undefined) => {
    onChange(val || "");
  };


  return (
    <div className="space-y-2">
      {label ? <Label>{label}</Label> : null}
      <PhoneInputLib
        value={normalized}
        onChange={handleChange}
        defaultCountry={defaultCountry as any}
        international
        disabled={disabled}
        placeholder={placeholder}
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background"
        inputClassName="outline-none flex-1 bg-transparent"
      />
    </div>
  );
}
