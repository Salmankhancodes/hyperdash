"use client"

import { usePathname } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/dashboard", enabled: true },
  { label: "Traces",    href: "#", enabled: false },
  { label: "Incidents", href: "#", enabled: false },
  { label: "Reports",   href: "#", enabled: false },
]

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col p-3 gap-1">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold px-2 mb-2">
        Navigation
      </span>

      {navItems.map((item) => {
        const isActive = item.enabled && pathname === item.href;

        return (
          <div
            key={item.label}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              isActive
                ? "bg-zinc-800 text-white font-medium"
                : item.enabled
                  ? "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 cursor-pointer"
                  : "text-zinc-600 cursor-not-allowed"
            }`}
            title={!item.enabled ? "Coming soon" : undefined}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 rounded-full" />
            )}
            <span>{item.label}</span>
            {!item.enabled && (
              <span className="ml-auto text-[10px] text-zinc-600 font-medium">Soon</span>
            )}
          </div>
        );
      })}

      {/* Bottom spacer + version */}
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <span className="text-[10px] text-zinc-600 px-2">HyperDash v1.0.0</span>
      </div>
    </aside>
  )
}

export default Sidebar