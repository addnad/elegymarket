import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { getDoc } from "@/lib/docs"
import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"

interface DocPageProps {
  params: Promise<{ slug: string }>
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const doc = getDoc(slug)

  if (!doc) notFound()

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-3xl">
        <div className="mb-8">
          <Link
            href="/docs"
            className="text-xs font-mono text-muted-foreground hover:text-lime transition-colors mb-4 inline-block"
          >
            ← Back to Docs
          </Link>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono px-2 py-0.5 border border-lime/30 text-lime bg-lime/5">
              {doc.category}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{doc.excerpt}</p>
        </div>

        <div className="prose prose-sm prose-invert max-w-none
          prose-headings:font-semibold prose-headings:text-foreground
          prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
          prose-p:text-muted-foreground prose-p:leading-relaxed
          prose-strong:text-foreground
          prose-code:text-lime prose-code:bg-lime/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono
          prose-pre:bg-surface prose-pre:border prose-pre:border-border prose-pre:text-xs
          prose-li:text-muted-foreground
        ">
          <ReactMarkdown>{doc.content}</ReactMarkdown>
        </div>
      </div>
    </DashboardLayout>
  )
}
