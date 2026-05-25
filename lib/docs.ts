import { posts } from "./posts"

export interface Doc {
  slug: string
  title: string
  category: string
  excerpt: string
  content: string
}

export const docs: Doc[] = posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  category: post.tag,
  excerpt: post.excerpt,
  content: post.content,
}))

export function getDoc(slug: string): Doc | undefined {
  return docs.find(d => d.slug === slug)
}
