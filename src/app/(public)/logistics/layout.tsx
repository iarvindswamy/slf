import type { ReactNode } from "react";
import PublicModuleToggle from "@/components/global/PublicModuleToggle";

/**
 * Public logistics layout.
 * Ensures the LOGISTICS | FOODS module toggle is always available
 * on every logistics public page (MDS dual-module requirement).
 */
export default function LogisticsPublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          display: "flex",
          justifyContent: "center",
          padding: "10px 16px",
          background:
            "linear-gradient(90deg, #041d38 0%, #082d55 50%, #0a3a4a 100%)",
          borderBottom: "1px solid rgba(8, 165, 174, 0.25)",
        }}
      >
        <div
          style={{
            width: "min(1180px, 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Sreshta Logistics &amp; Foods
          </span>
          <PublicModuleToggle active="LOGISTICS" />
        </div>
      </div>
      {children}
    </>
  );
}