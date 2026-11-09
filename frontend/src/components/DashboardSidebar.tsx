"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface DashboardSidebarProps {
  role?: "admin" | "petugas";
}

export default function DashboardSidebar({
  role = "admin",
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const menus =
    role === "admin"
      ? [
          { href: "/admin", label: "Dashboard" },
          { href: "/admin/bookings", label: "Data Pemesanan" },
          { href: "/admin/jadwal", label: "Kelola Jadwal" },
        ]
      : [{ href: "/petugas", label: "Dashboard Petugas" }];

  return (
    <aside className="w-full shrink-0 rounded-2xl bg-[#10243b] p-5 text-white md:w-64">
      <h2 className="mb-2 text-xl font-extrabold">
        Rail<span className="text-orange-400">ink.</span>
      </h2>

      <p className="mb-6 text-xs text-gray-400">
        Panel {role === "admin" ? "Administrator" : "Petugas"}
      </p>

      <nav className="flex flex-col gap-2">
        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            (menu.href !== "/admin" &&
              menu.href !== "/petugas" &&
              pathname.startsWith(menu.href));

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              {menu.label}
            </Link>
          );
        })}

        <Link
          href="/"
          className="mt-5 rounded-lg px-4 py-3 text-sm text-gray-300 hover:bg-white/10"
        >
          Kembali ke Beranda
        </Link>
      </nav>
    </aside>
  );
}