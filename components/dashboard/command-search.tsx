"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Flame } from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useElegy } from "@/context/elegy-context"

interface CommandSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter()
  const { tokens } = useElegy()
  const [query, setQuery] = useState("")

  const sorted = [...tokens].sort((a, b) => b.sentimentScore - a.sentimentScore)
  const top5 = sorted.slice(0, 5)

  const filtered = query.trim().length > 0
    ? tokens.filter(t =>
        t.teamName.toLowerCase().includes(query.toLowerCase()) ||
        t.teamCode.toLowerCase().includes(query.toLowerCase())
      ).sort((a, b) => b.sentimentScore - a.sentimentScore)
    : top5

  const handleSelect = useCallback(
    (code: string) => {
      onOpenChange(false)
      setQuery("")
      router.push(`/tokens/${code}`)
    },
    [router, onOpenChange]
  )

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search teams..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No teams found.</CommandEmpty>
        <CommandGroup heading={query ? "Results" : "Peak Grief"}>
          {filtered.map((token) => (
            <CommandItem
              key={token.teamCode}
              value={`${token.teamName} ${token.teamCode}`}
              onSelect={() => handleSelect(token.teamCode)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <span className="text-lg">{token.flag}</span>
              <span>{token.teamName}</span>
              <div className="ml-auto flex items-center gap-1.5">
                <Flame className={`w-3 h-3 ${token.sentimentScore >= 75 ? "text-red-400" : token.sentimentScore >= 50 ? "text-orange-400" : "text-yellow-400"}`} />
                <span className="text-xs font-mono text-muted-foreground">{token.sentimentScore}</span>
                <span className="text-xs font-mono text-muted-foreground ml-1">GRIEF_{token.teamCode}</span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function useCommandSearch() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return { open, setOpen }
}
