"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Activity, BarChart3, Trophy, Wallet, Radio, Settings, Search, Command, X, BookOpen } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { ElegyLogo } from "./logo"

const navItems = [
  { href: "/",            label: "Dashboard",   icon: Activity,  description: "Overview"      },
  { href: "/tokens",      label: "Tokens",      icon: Trophy,    description: "Grief tokens"  },
  { href: "/market",      label: "Market",      icon: BarChart3, description: "Price charts"  },
  { href: "/leaderboard", label: "Leaderboard", icon: Radio,     description: "Most grief"    },
  { href: "/portfolio",   label: "Portfolio",   icon: Wallet,    description: "Your holdings" },
  { href: "/docs",        label: "Docs",        icon: BookOpen,  description: "How it works"  },
]

interface SidebarProps {
  onOpenCommand?: () => void
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ onOpenCommand, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-64 flex flex-col border-r border-border bg-background z-50 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
              <ElegyLogo size={32} />
              <span className="text-lg font-semibold tracking-tight">ELEGY</span>
            </Link>
            <button onClick={onClose} className="lg:hidden p-1 hover:bg-surface-hover transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <ThemeToggle />
        </div>

        {/* Search */}
        <div className="p-4">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground bg-surface border border-border hover:bg-surface-hover transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="flex-1 text-left">Search tokens...</span>
            <kbd className="flex items-center gap-1 text-xs font-mono bg-background px-1.5 py-0.5 border border-border">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm transition-all group relative",
                  isActive
                    ? "text-accent-foreground bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-lime lime-glow-sm" />
                )}
                <item.icon className={cn("w-4 h-4", isActive ? "text-accent-foreground" : "")} />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border">
          <Link
            href="/settings"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
