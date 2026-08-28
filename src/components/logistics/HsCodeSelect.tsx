"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

type HsCodeOption = {
  code: string;
  description: string;
};

/** Common HS codes used in the sample proforma + typical textile / food shipments */
const COMMON_HS_CODES: HsCodeOption[] = [
  { code: "6109901009", description: "T-shirts, singlets – cotton" },
  { code: "6203424011", description: "Men’s trousers / pants – cotton" },
  { code: "6102909000", description: "Ladies wear / saree – knitted cotton" },
  { code: "2106909998", description: "Food preparations / drink powder" },
  { code: "61091000", description: "T-shirts of cotton" },
  { code: "62046200", description: "Women’s trousers – cotton" },
  { code: "62114200", description: "Women’s garments – cotton" },
  { code: "63079090", description: "Other made-up textile articles" },
  { code: "19059090", description: "Bakery / snacks / other" },
  { code: "20019000", description: "Pickles / preserved vegetables" },
  { code: "21039090", description: "Sauces / mixed condiments" },
  { code: "09109100", description: "Spice mixtures" },
  { code: "17049090", description: "Sugar confectionery" },
  { code: "39269099", description: "Other articles of plastics" },
  { code: "42022200", description: "Handbags / purses" },
  { code: "64039990", description: "Footwear" },
  { code: "71131110", description: "Silver jewellery" },
  { code: "85171210", description: "Mobile phones" },
  { code: "95030090", description: "Toys" },
  { code: "49019900", description: "Printed books / other" },
];

type HsCodeSelectProps = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export default function HsCodeSelect({
  value,
  onChange,
  disabled = false,
  placeholder = "HS Code",
  className = "",
}: HsCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMON_HS_CODES;

    return COMMON_HS_CODES.filter(
      (item) =>
        item.code.includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [query]);

  const selected = COMMON_HS_CODES.find((item) => item.code === value);

  const inputBase =
    "h-9 w-full rounded border px-2 text-sm outline-none focus:border-slate-500 disabled:bg-gray-50";

  return (
    <div className={`relative ${className}`}>
      {/* Trigger / free-text input */}
      <div className="flex">
        <input
          value={value}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(next);
            setQuery(next);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            // delay so click on option can register
            setTimeout(() => setOpen(false), 180);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={inputBase}
          maxLength={10}
        />

        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(e) => {
            e.preventDefault();
            setOpen((v) => !v);
          }}
          className="ml-1 flex h-9 w-8 items-center justify-center rounded border bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Dropdown */}
      {open && !disabled && (
        <div className="absolute z-50 mt-1 max-h-60 w-[320px] overflow-hidden rounded-lg border bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code or description..."
              className="h-8 flex-1 text-sm outline-none"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-xs text-gray-400">
                No matching HS code. You can still type a custom code.
              </li>
            ) : (
              filtered.map((item) => (
                <li key={item.code}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange(item.code);
                      setQuery("");
                      setOpen(false);
                    }}
                    className={[
                      "flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-slate-50",
                      item.code === value ? "bg-slate-100" : "",
                    ].join(" ")}
                  >
                    <span className="font-medium text-slate-900">
                      {item.code}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.description}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>

          {selected && (
            <div className="border-t bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
              Selected: {selected.code} – {selected.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}