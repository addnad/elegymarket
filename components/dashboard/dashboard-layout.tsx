"use client"

import React, { useState } from "react"
import { Sidebar } from "./sidebar"
import { CommandSearch, useCommandSearch } from "./command-search"
import { NotificationToast } from "./notification-toast"
import { TermsModal } from "./terms-modal"
import { DashboardProvider } from "@/context/dashboard-context"
import { WalletConnectButton } from "./connect-button"
import { LiveTicker } from "./ticker"
import { ElegyLogo } from "./logo"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Search } from "lucide-react"
import Link from "next/link"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { open, setOpen } = useCommandSearch()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <DashboardProvider>
        <TermsModal />
      <div className="min-h-screen bg-background noise-overlay">

        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-xl border-b border-border z-30 lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-surface-hover transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link href="/" className="flex items-center gap-2">
                <ElegyLogo size={24} />
                <span className="font-semibold">ELEGY</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="p-2 hover:bg-surface-hover transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <WalletConnectButton compact />
            </div>
          </div>
        </header>

        {/* Desktop Top Bar */}
        <div className="hidden lg:flex fixed top-0 left-64 right-0 h-14 bg-background/80 backdrop-blur-xl border-b border-border z-30 items-center justify-end px-8">
          <WalletConnectButton />
        </div>

        <Sidebar
          onOpenCommand={() => setOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <CommandSearch open={open} onOpenChange={setOpen} />

        {/* Main content — extra bottom padding for ticker */}
        <main className="lg:pl-64 pt-14 pb-9">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Live ticker at bottom */}
        <LiveTicker />

        <NotificationToast />
      </div>
    </DashboardProvider>
  )
}
