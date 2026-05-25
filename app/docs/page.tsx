import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { docs } from "@/lib/docs"
import Link from "next/link"

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-lime" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Documentation
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">How Elegy Works</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Everything you need to understand the protocol.
          </p>
        </div>

        <div className="space-y-px">
          {docs.map((doc) => (
            <Link
              key={doc.slug}
              href={`/docs/${doc.slug}`}
              className="block border border-border p-5 hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 border border-lime/30 text-lime bg-lime/5">
                      {doc.category}
                    </span>
                  </div>
                  <h2 className="font-semibold text-base group-hover:text-lime transition-colors mb-1">
                    {doc.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {doc.excerpt}
                  </p>
                </div>
                <span className="text-muted-foreground group-hover:text-lime transition-colors mt-1 flex-shrink-0">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
