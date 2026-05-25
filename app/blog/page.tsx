import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { posts } from "@/lib/posts"
import Link from "next/link"

export default function BlogPage() {
  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-lime pulse-live" />
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Elegy Blog
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Updates & Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            How Elegy works, why we built it, and what's coming for the World Cup.
          </p>
        </div>

        <div className="space-y-px">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block border border-border p-5 hover:bg-surface-hover transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-mono px-2 py-0.5 border border-lime/30 text-lime bg-lime/5">
                      {post.tag}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{post.date}</span>
                  </div>
                  <h2 className="font-semibold text-base group-hover:text-lime transition-colors mb-1">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.excerpt}
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
