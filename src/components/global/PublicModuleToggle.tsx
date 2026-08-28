"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type PublicModule = "LOGISTICS" | "FOOD";

type PublicModuleToggleProps = {
  active?: PublicModule;
  className?: string;
};

export default function PublicModuleToggle({
  active,
  className = "",
}: PublicModuleToggleProps) {
  const pathname = usePathname() || "";

  const detected: PublicModule =
    active ??
    (pathname.startsWith("/food") ? "FOOD" : "LOGISTICS");

  const isLogistics = detected === "LOGISTICS";
  const isFood = detected === "FOOD";

  return (
    <div
      className={className}
      role="navigation"
      aria-label="Switch between Logistics and Foods"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: 4,
        borderRadius: 999,
        background: isLogistics ? "#0b2744" : "#3b220f",
        border: isLogistics
          ? "1px solid rgba(8, 165, 174, 0.35)"
          : "1px solid rgba(232, 106, 23, 0.35)",
        boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
      }}
    >
      <Link
        href="/logistics"
        aria-current={isLogistics ? "page" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
          padding: "8px 16px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          background: isLogistics ? "#08a5ae" : "transparent",
          color: isLogistics ? "#ffffff" : "rgba(255,255,255,0.72)",
        }}
      >
        Logistics
      </Link>

      <Link
        href="/food"
        aria-current={isFood ? "page" : undefined}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 110,
          padding: "8px 16px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          transition: "all 0.2s ease",
          background: isFood ? "#e86a17" : "transparent",
          color: isFood ? "#ffffff" : "rgba(255,255,255,0.72)",
        }}
      >
        Foods
      </Link>
    </div>
  );
}