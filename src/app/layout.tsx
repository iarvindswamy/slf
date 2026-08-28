// import type { Metadata } from "next";
// import "../app/globals.css";


// export const metadata: Metadata = {
//   title: {
//     default: "Sreshta Logistics & Foods",
//     template: "%s | Sreshta",
//   },

//   description:
//     "Sreshta Logistics provides domestic, international and cargo freight solutions. Sreshta Foods brings authentic pickles, snacks, sweets and traditional foods to your doorstep.",

//   keywords: [
//     "Sreshta Logistics",
//     "Sreshta Foods",
//     "logistics",
//     "cargo",
//     "freight",
//     "air freight",
//     "international shipping",
//     "domestic logistics",
//     "food delivery",
//     "pickles",
//     "snacks",
//     "sweets",
//   ],

//   authors: [
//     {
//       name: "Sreshta",
//     },
//   ],

//   creator: "Sreshta",

//   openGraph: {
//     type: "website",
//     title: "Sreshta Logistics & Foods",
//     description:
//       "Reliable logistics, cargo and freight solutions alongside authentic Sreshta Foods.",
//     siteName: "Sreshta",
//   },

//   twitter: {
//     card: "summary_large_image",
//     title: "Sreshta Logistics & Foods",
//     description:
//       "Reliable logistics, cargo and freight solutions alongside authentic Sreshta Foods.",
//   },

//   robots: {
//     index: true,
//     follow: true,
//   },
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body>{children}</body>
//     </html>
//   );
// }














// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: {
//     default: "Sreshta Logistics & Foods",
//     template: "%s | Sreshta",
//   },
//   description:
//     "Sreshta Logistics provides reliable domestic, international, cargo and freight solutions with convenient shipment tracking and booking. Sreshta Foods brings quality food products with easy ordering and tracking.",
//   keywords: [
//     "Sreshta Logistics",
//     "Sreshta Foods",
//     "logistics",
//     "courier",
//     "cargo",
//     "freight",
//     "international shipping",
//     "domestic courier",
//     "shipment tracking",
//     "food delivery",
//   ],
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body>{children}</body>
//     </html>
//   );
// }




import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { ModuleProvider } from "@/context/ModuleContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sreshta Logistics & Foods",
    template: "%s | Sreshta",
  },
  description:
    "Sreshta Logistics provides reliable domestic, international, cargo and freight solutions with convenient shipment tracking and booking. Sreshta Foods brings quality food products with easy ordering and tracking.",
  keywords: [
    "Sreshta Logistics",
    "Sreshta Foods",
    "logistics",
    "courier",
    "cargo",
    "freight",
    "international shipping",
    "domestic courier",
    "shipment tracking",
    "food delivery",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ModuleProvider>
            {children}
          </ModuleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}