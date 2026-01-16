import { SUPPORTED_LANGUAGES } from "../types";

interface LanguageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  excludeAuto?: boolean;
}

export function LanguageSelector({
  label,
  value,
  onChange,
  excludeAuto = false,
}: LanguageSelectorProps) {
  const languages = excludeAuto
    ? SUPPORTED_LANGUAGES.filter((l) => l.code !== "auto")
    : SUPPORTED_LANGUAGES;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
