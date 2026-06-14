import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen, GraduationCap, LayoutDashboard, Megaphone, Users } from "lucide-react";
import { getSetupStatus } from "@/lib/env";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/classes", label: "Kelas", icon: Users },
  { href: "/materials", label: "Materi", icon: BookOpen },
  { href: "/distribution", label: "Distribusi", icon: Megaphone },
];

interface AppShellProps {
  currentPath: string;
  children: ReactNode;
}

export function AppShell({ currentPath, children }: AppShellProps) {
  const setup = getSetupStatus();

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[28px] border border-slate-200 bg-white px-5 py-6 text-slate-900 shadow-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  Task Database
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  Workspace
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Ruang kerja sederhana untuk mengelola kelas, materi, dan distribusi
              secara rapi.
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.href ||
                (item.href !== "/" && currentPath.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-sky-600">Backend</p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {setup.mode === "supabase"
                  ? "Supabase cloud untuk CRUD dan upload file"
                  : "Penyimpanan lokal aktif di laptop Anda"}
              </p>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              {setup.mode === "supabase"
                ? "Aplikasi sedang berjalan dengan backend cloud. Data dan file akan tersimpan ke Supabase."
                : "Aplikasi berjalan tanpa kredensial cloud dan tetap menyimpan data beserta file langsung ke project lokal."}
            </p>
          </div>
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
