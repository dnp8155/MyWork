import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import {
  LayoutDashboard, FolderKanban, Users, Server, FileText, Receipt, Wallet,
  CreditCard, Globe, HardDrive, BarChart3, Bell, Settings as SettingsIcon,
  Menu, X, LogOut, Search, KeyRound
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/clients", label: "Clients", icon: Users },
  { to: "/base44-accounts", label: "Base44 Accounts", icon: Server },
  { to: "/credentials", label: "Credentials", icon: KeyRound },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/invoices", label: "Invoices", icon: Receipt },
  { to: "/payments", label: "Payments", icon: Wallet },
  { to: "/expenses", label: "Expenses", icon: CreditCard },
  { to: "/domains", label: "Domains", icon: Globe },
  { to: "/hosting", label: "Hosting", icon: HardDrive },
  { to: "/finance", label: "Finance", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <div className="flex h-10 w-36 items-center justify-center rounded-lg bg-slate-900 overflow-hidden">
            <Image
              src="https://media.base44.com/images/public/6aa4049391d33a443027588d/9dbdc9e2e_ChatGPTImageSep11202607_28_47PM.png"
              fittingType="fit"
              className="h-10 w-36"
              alt="MeWork"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-900 truncate">{user?.full_name || "User"}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user?.role || "admin"}</div>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-900">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <GlobalSearch />
          </div>
          <Link to="/notifications" className="relative text-slate-600 hover:text-slate-900">
            <Bell className="w-5 h-5" />
          </Link>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          <Outlet />
        </main>
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
        className="w-48 md:w-80 pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg border border-transparent focus:border-indigo-300 focus:bg-white focus:outline-none transition"
      />
    </div>
  );
}