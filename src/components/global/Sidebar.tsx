"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";

import {
  X,
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  FileText,
  BarChart3,
  Settings,
  Users,
  Shield,
  ShoppingBag,
  Boxes,
  Ticket,
  Upload,
  Fuel,
  GitCompare,
  CalendarCheck,
  Building2,
  UserRound,
  Store,
  ChevronDown,
} from "lucide-react";

import {
  useState,
} from "react";

type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "LOGISTICS_MANAGER"
  | "LOGISTICS_OPERATOR"
  | "FOOD_MANAGER"
  | "FOOD_OPERATOR"
  | "ACCOUNTANT"
  | "VIEWER";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
  role?: UserRole;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  roles?: UserRole[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const ALL_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "LOGISTICS_MANAGER",
  "LOGISTICS_OPERATOR",
  "FOOD_MANAGER",
  "FOOD_OPERATOR",
  "ACCOUNTANT",
  "VIEWER",
];

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "Logistics",
    items: [
      {
        label: "Booking",
        href: "/admin/logistics/booking",
        icon: CalendarCheck,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
        ],
      },
      {
        label: "AWBs",
        href: "/admin/logistics/awb",
        icon: Package,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Excel Import",
        href: "/admin/logistics/excel-import",
        icon: Upload,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Tracking",
        href: "/admin/logistics/tracking",
        icon: Truck,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
          "VIEWER",
        ],
      },
      {
        label: "Tracking Matrix",
        href: "/admin/logistics/tracking/matrix",
        icon: GitCompare,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Day End",
        href: "/admin/logistics/day-end",
        icon: CalendarCheck,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
        ],
      },
      {
        label: "Rate Compare",
        href: "/admin/logistics/rate-compare",
        icon: BarChart3,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Fuel Surcharges",
        href: "/admin/logistics/fuel-surcharges",
        icon: Fuel,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Co-loaders",
        href: "/admin/logistics/co-loaders",
        icon: Building2,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Invoices",
        href: "/admin/logistics/invoices",
        icon: FileText,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Reports",
        href: "/admin/logistics/reports",
        icon: BarChart3,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Settings",
        href: "/admin/logistics/settings",
        icon: Settings,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
    ],
  },

  {
    title: "Masters",
    items: [
      {
        label: "Senders",
        href: "/admin/masters/senders",
        icon: UserRound,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
        ],
      },
      {
        label: "Receivers",
        href: "/admin/masters/receivers",
        icon: UserRound,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
        ],
      },
      {
        label: "Customers",
        href: "/admin/masters/customers",
        icon: Users,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
          "LOGISTICS_OPERATOR",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Service Centers",
        href: "/admin/masters/service-centers",
        icon: Building2,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Destinations",
        href: "/admin/masters/destinations",
        icon: MapPin,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Vendors",
        href: "/admin/masters/vendors",
        icon: Store,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
      {
        label: "Services",
        href: "/admin/masters/services",
        icon: Truck,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "LOGISTICS_MANAGER",
        ],
      },
    ],
  },

  {
    title: "Food",
    items: [
      {
        label: "Dashboard",
        href: "/admin/food/dashboard",
        icon: LayoutDashboard,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
          "FOOD_OPERATOR",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Products",
        href: "/admin/food/products",
        icon: ShoppingBag,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
          "FOOD_OPERATOR",
          "VIEWER",
        ],
      },
      {
        label: "Categories",
        href: "/admin/food/categories",
        icon: Boxes,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
          "FOOD_OPERATOR",
        ],
      },
      {
        label: "Orders",
        href: "/admin/food/orders",
        icon: Package,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
          "FOOD_OPERATOR",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
      {
        label: "Inventory",
        href: "/admin/food/inventory",
        icon: Boxes,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
          "FOOD_OPERATOR",
        ],
      },
      {
        label: "Coupons",
        href: "/admin/food/coupons",
        icon: Ticket,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
        ],
      },
      {
        label: "Settings",
        href: "/admin/food/settings",
        icon: Settings,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "FOOD_MANAGER",
        ],
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
        ],
      },
      {
        label: "Roles",
        href: "/admin/roles",
        icon: Shield,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
        ],
      },
      {
        label: "Audit Logs",
        href: "/admin/audit-logs",
        icon: FileText,
        roles: [
          "SUPER_ADMIN",
          "ADMIN",
          "ACCOUNTANT",
          "VIEWER",
        ],
      },
    ],
  },
];

export default function Sidebar({
  open = false,
  onClose,
  role = "VIEWER",
}: SidebarProps) {
  const pathname =
    usePathname();

  const [collapsedSections, setCollapsedSections] =
    useState<Record<string, boolean>>(
      {},
    );

  const toggleSection = (
    title: string,
  ) => {
    setCollapsedSections(
      (previous) => ({
        ...previous,
        [title]:
          !previous[title],
      }),
    );
  };

  const visibleSections =
    sections
      .map((section) => ({
        ...section,

        items:
          section.items.filter(
            (item) =>
              !item.roles ||
              item.roles.includes(
                role,
              ),
          ),
      }))
      .filter(
        (section) =>
          section.items.length >
          0,
      );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r bg-white transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          open
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-5">
          <Link
            href="/admin"
            className="flex items-center gap-3"
            onClick={onClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 font-bold text-white">
              S
            </div>

            <div>
              <p className="font-semibold text-gray-900">
                Sreshta
              </p>

              <p className="text-xs text-gray-500">
                Admin Platform
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-5">
            {visibleSections.map(
              (section) => {
                const collapsed =
                  collapsedSections[
                    section.title
                  ];

                return (
                  <div
                    key={
                      section.title
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleSection(
                          section.title,
                        )
                      }
                      className="mb-2 flex w-full items-center justify-between px-3 text-xs font-semibold uppercase tracking-wider text-gray-400"
                    >
                      {section.title}

                      <ChevronDown
                        className={[
                          "h-3.5 w-3.5 transition-transform",
                          collapsed
                            ? "-rotate-90"
                            : "",
                        ].join(" ")}
                      />
                    </button>

                    {!collapsed && (
                      <div className="space-y-1">
                        {section.items.map(
                          (
                            item,
                          ) => {
                            const Icon =
                              item.icon;

                            const active =
                              pathname ===
                                item.href ||
                              pathname.startsWith(
                                `${item.href}/`,
                              );

                            return (
                              <Link
                                key={
                                  item.href
                                }
                                href={
                                  item.href
                                }
                                onClick={
                                  onClose
                                }
                                className={[
                                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
                                  active
                                    ? "bg-slate-900 text-white"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                ].join(
                                  " ",
                                )}
                              >
                                <Icon className="h-4 w-4 shrink-0" />

                                <span>
                                  {
                                    item.label
                                  }
                                </span>
                              </Link>
                            );
                          },
                        )}
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-900">
              Signed in as
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {role}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}