"use client";

import {
  Search,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

type SearchBarProps = {
  value?: string;
  placeholder?: string;
  onChange?: (
    value: string,
  ) => void;
  onSearch?: (
    value: string,
  ) => void;
  onClear?: () => void;
  className?: string;
};

export default function SearchBar({
  value,
  placeholder = "Search...",
  onChange,
  onSearch,
  onClear,
  className = "",
}: SearchBarProps) {
  const [
    internalValue,
    setInternalValue,
  ] = useState(
    value ?? "",
  );

  useEffect(() => {
    if (
      value !==
      undefined
    ) {
      setInternalValue(
        value,
      );
    }
  }, [value]);

  const handleChange = (
    nextValue: string,
  ) => {
    setInternalValue(
      nextValue,
    );

    onChange?.(
      nextValue,
    );
  };

  const handleSubmit = (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    onSearch?.(
      internalValue.trim(),
    );
  };

  const clear = () => {
    handleChange("");

    onClear?.();
  };

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className={`relative ${className}`}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

      <input
        type="search"
        value={
          internalValue
        }
        onChange={(event) =>
          handleChange(
            event.target.value,
          )
        }
        placeholder={
          placeholder
        }
        className="h-10 w-full rounded-lg border bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />

      {internalValue && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}