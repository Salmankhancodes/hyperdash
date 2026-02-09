"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  { label: "Home",      href: "/",          enabled: true },
  { label: "Dashboard", href: "/dashboard", enabled: true },
  { label: "Traces",    href: "#", enabled: false },
  { label: "Incidents", href: "#", enabled: false },
  { label: "Reports",   href: "#", enabled: false },
]

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col p-3 gap-1">
      <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-2 mb-2">
        Navigation
      </span>

      {navItems.map((item) => {
        const isActive = item.enabled && pathname === item.href;
        const classes = `relative flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
            : item.enabled
              ? "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground cursor-pointer"
              : "text-sidebar-foreground/25 cursor-not-allowed"
        }`;

        const content = (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-sidebar-primary rounded-full" />
            )}
            <span>{item.label}</span>
            {!item.enabled && (
              <span className="ml-auto text-[10px] text-sidebar-foreground/25 font-medium">Soon</span>
            )}
          </>
        );

        return item.enabled ? (
          <Link key={item.label} href={item.href} className={classes}>
            {content}
          </Link>
        ) : (
          <div key={item.label} className={classes} title="Coming soon">
            {content}
          </div>
        );
      })}

      {/* Bottom spacer + version */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        <span className="text-[10px] text-sidebar-foreground/30 px-2">HyperDash v1.0.0</span>
      </div>
    </aside>
  )
}

export default Sidebar