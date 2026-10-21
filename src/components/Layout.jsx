import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Image } from "@/components/ui/image";
import NotificationBell from "@/components/NotificationBell";
import { LOGO_URL } from "@/components/landing/Reveal";
import {
  LayoutDashboard, FolderKanban, Users, Server, FileText, Receipt, Share2,
  Globe, HardDrive, BarChart3, Settings as SettingsIcon,
  Menu, LogOut, Search, KeyRound, PanelLeftClose, PanelLeftOpen, Download, Plus
} from "lucide-react";
import { usePWA } from "@/lib/PWAContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/shared-projects", label: "Shared Projects", icon: Share2 },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/base44-accounts", label: "Accounts", icon: Server },
  { to: "/credentials", label: "Credentials", icon: KeyRound },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/domains", label: "Domains", icon: Globe },
  { to: "/hosting", label: "Hosting", icon: HardDrive },
  { to: "/finance", label: "Finance", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

import PWAInstallPrompt from "@/components/PWAInstallPrompt";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isStandalone, installApp } = usePWA();



  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <PWAInstallPrompt />
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className={`h-16 flex items-center border-b border-slate-200 ${collapsed ? "lg:justify-center lg:px-2" : "px-5"}`}>
          <Image
            src={LOGO_URL}
            fittingType="fit"
            className={collapsed ? "h-10 w-36 lg:h-9 lg:w-9" : "h-10 w-36"}
            alt="MyWork"
          />
        </div>
        <nav className="flex-1 py-2 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
              <span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        {/* Install App Button (Sidebar) */}
        {!isStandalone && (
          <div className="px-3 pt-2 pb-1">
            <button
              onClick={() => {
                setSidebarOpen(false);
                installApp();
              }}
              title="Install App"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all group ${
                collapsed ? "lg:justify-center lg:px-0" : ""
              }`}
            >
              <Download className="w-4.5 h-4.5 flex-shrink-0 animate-bounce" style={{ width: 18, height: 18 }} />
              <div className={`flex flex-col text-left ${collapsed ? "lg:hidden" : ""}`}>
                <span className="leading-tight">Install App</span>
                <span className="text-[10px] text-indigo-100 font-normal">Add to Home Screen</span>
              </div>
            </button>
          </div>
        )}

        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold uppercase flex-shrink-0">
              {(user?.user_metadata?.full_name || user?.email || "U")?.charAt(0)}
            </div>
            <div className={`flex-1 min-w-0 ${collapsed ? "lg:hidden" : ""}`}>
              <div className="text-xs text-slate-900 truncate">{user?.user_metadata?.full_name || user?.email || "User"}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role || "admin"}</div>
            </div>
            <button onClick={handleLogout} className={`text-slate-400 hover:text-slate-900 ${collapsed ? "lg:hidden" : ""}`}>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <button
              className="hidden lg:inline-flex text-slate-500 hover:text-slate-900"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? "Expand panel" : "Collapse panel"}
            >
              {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
            <GlobalSearch />
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>

        {/* Floating App Bottom Navigation Bar for Mobile / PWA */}
        <nav className="print:hidden lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.22)] rounded-2xl px-2 py-1.5 flex items-center justify-between">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-600 font-bold bg-indigo-50/80 scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </NavLink>

          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-600 font-bold bg-indigo-50/80 scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`
            }
          >
            <FolderKanban className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Projects</span>
          </NavLink>

          {/* Quick Action Floating Center Button */}
          <button
            onClick={() => setQuickActionOpen(true)}
            aria-label="Quick Create"
            className="w-11 h-11 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 active:scale-95 transition-all border-2 border-white"
          >
            <Plus className="w-6 h-6" />
          </button>

          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-indigo-600 font-bold bg-indigo-50/80 scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`
            }
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Invoices</span>
          </NavLink>

          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 hover:text-slate-800 font-medium transition-all"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Menu</span>
          </button>
        </nav>

        {/* Quick Action Sheet / Modal for Mobile */}
        {quickActionOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-100 animate-in slide-in-from-bottom-6 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
                <button
                  onClick={() => setQuickActionOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <PanelLeftClose className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-4">
                <button
                  onClick={() => {
                    setQuickActionOpen(false);
                    navigate("/invoices/new");
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 text-indigo-900 transition active:scale-95 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">New Invoice</span>
                </button>

                <button
                  onClick={() => {
                    setQuickActionOpen(false);
                    navigate("/projects");
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-900 transition active:scale-95 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Projects</span>
                </button>

                <button
                  onClick={() => {
                    setQuickActionOpen(false);
                    navigate("/clients");
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 text-blue-900 transition active:scale-95 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Clients</span>
                </button>

                <button
                  onClick={() => {
                    setQuickActionOpen(false);
                    navigate("/quotations");
                  }}
                  className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 text-amber-900 transition active:scale-95 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold">Quotations</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  if (q.length > 1) {
    // simple redirect to projects with query
  }
  return (
    <div className="relative">
      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            navigate(`/projects?q=${encodeURIComponent(q.trim())}`);
          }
        }}
        placeholder="Search projects, clients, invoices…"
        className="w-36 sm:w-48 md:w-80 pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition"
      />
    </div>
  );
}