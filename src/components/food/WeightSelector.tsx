"use client";

export type WeightOption = {
  id: string;
  label: string;
  grams: number;
};

type WeightSelectorProps = {
  options?: WeightOption[];
  value?: string;
  onChange: (
    option: WeightOption,
  ) => void;
  disabled?: boolean;
};

const DEFAULT_OPTIONS: WeightOption[] = [
  {
    id: "250G",
    label: "250g",
    grams: 250,
  },
  {
    id: "500G",
    label: "500g",
    grams: 500,
  },
  {
    id: "1KG",
    label: "1kg",
    grams: 1000,
  },
  {
    id: "2KG",
    label: "2kg",
    grams: 2000,
  },
];

export default function WeightSelector({
  options = DEFAULT_OPTIONS,
  value,
  onChange,
  disabled = false,
}: WeightSelectorProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-gray-900">
        Select Weight
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map(
          (option) => {
            const selected =
              value ===
              option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  onChange(
                    option,
                  )
                }
                disabled={
                  disabled
                }
                className={[
                  "rounded-xl border px-4 py-3 text-sm font-semibold transition",
                  selected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "bg-white text-gray-700 hover:border-gray-400",
                  disabled
                    ? "cursor-not-allowed opacity-50"
                    : "",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
}