// import type { ReactNode } from "react";
// import PublicModuleToggle from "@/components/global/PublicModuleToggle";

// /**
//  * Public food layout.
//  * Ensures the LOGISTICS | FOODS module toggle is always available
//  * on every food public page (MDS dual-module requirement).
//  */
// export default function FoodPublicLayout({
//   children,
// }: {
//   children: ReactNode;
// }) {
//   return (
//     <>
//       <div
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 60,
//           display: "flex",
//           justifyContent: "center",
//           padding: "10px 16px",
//           background:
//             "linear-gradient(90deg, #2a1508 0%, #4a2a12 50%, #5c3210 100%)",
//           borderBottom: "1px solid rgba(232, 106, 23, 0.3)",
//         }}
//       >
//         <div
//           style={{
//             width: "min(1180px, 100%)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 16,
//           }}
//         >
//           <span
//             style={{
//               color: "rgba(255,255,255,0.7)",
//               fontSize: 12,
//               fontWeight: 600,
//               letterSpacing: "0.08em",
//               textTransform: "uppercase",
//             }}
//           >
//             Sreshta Logistics &amp; Foods
//           </span>
//           <PublicModuleToggle active="FOOD" />
//         </div>
//       </div>
//       {children}
//     </>
//   );
// }



import type { ReactNode } from "react";
import Link from "next/link";
import PublicModuleToggle from "@/components/global/PublicModuleToggle";

export default function FoodPublicLayout({
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
            "linear-gradient(90deg, #2a1508 0%, #4a2a12 50%, #5c3210 100%)",
          borderBottom: "1px solid rgba(232, 106, 23, 0.3)",
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
          <PublicModuleToggle active="FOOD" />
        </div>
      </div>

      {children}

      <footer
        style={{
          marginTop: 48,
          borderTop: "1px solid #f0e5d6",
          background: "#fffaf5",
        }}
      >
        <div
          style={{
            width: "min(1180px, 100%)",
            margin: "0 auto",
            padding: "40px 16px 24px",
            display: "grid",
            gap: 28,
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          }}
        >
          <div>
            <strong style={{ color: "#451a03" }}>Sreshta Foods</strong>
            <p style={{ marginTop: 10, color: "#78716c", fontSize: 14 }}>
              Quality food products with simple ordering and delivery.
            </p>
          </div>

          <div>
            <strong style={{ color: "#451a03" }}>Shop</strong>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <Link href="/food" style={{ color: "#78716c", fontSize: 14 }}>
                Home
              </Link>
              <Link
                href="/food/products"
                style={{ color: "#78716c", fontSize: 14 }}
              >
                Products
              </Link>
              <Link
                href="/food/categories"
                style={{ color: "#78716c", fontSize: 14 }}
              >
                Categories
              </Link>
              <Link
                href="/food/cart"
                style={{ color: "#78716c", fontSize: 14 }}
              >
                Cart
              </Link>
            </div>
          </div>

          <div>
            <strong style={{ color: "#451a03" }}>Account</strong>
            <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
              <Link href="/login" style={{ color: "#78716c", fontSize: 14 }}>
                Admin Login
              </Link>
              <Link
                href="/admin/dashboard"
                style={{ color: "#78716c", fontSize: 14 }}
              >
                Admin Panel
              </Link>
              <Link
                href="/logistics"
                style={{ color: "#78716c", fontSize: 14 }}
              >
                Logistics Site
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            width: "min(1180px, 100%)",
            margin: "0 auto",
            padding: "16px",
            borderTop: "1px solid #eadbca",
            color: "#a8a29e",
            fontSize: 12,
          }}
        >
          © {new Date().getFullYear()} Sreshta Foods. All rights reserved.
        </div>
      </footer>
    </>
  );
}