"use client"

import * as React from "react"
import { type IconSetName } from "@lorre-blocks/tokens"

import {
  ALL_CATEGORIES,
  categorize,
  categoryOptions,
  type CategoryCount,
} from "@www/lib/icon-categories"
import {
  loadIconSet,
  searchIcons,
  type LoadedIconSet,
} from "@www/lib/icon-sets"

export function defaultStyle(set: IconSetName): string | undefined {
  if (set === "phosphor") return "regular"
  if (set === "heroicons") return "outline"
  return undefined
}

interface IconsContextValue {
  setName: IconSetName
  changeSet: (set: IconSetName) => void
  style: string | undefined
  setStyle: (style: string | undefined) => void
  activeStyle: string | undefined
  supportsStroke: boolean
  loaded: LoadedIconSet | null
  loading: boolean
  allNames: string[]
  categories: CategoryCount[]
  category: string
  setCategory: (category: string) => void
  query: string
  setQuery: (query: string) => void
  matches: string[]
}

const IconsContext = React.createContext<IconsContextValue | null>(null)

export function useIcons(): IconsContextValue {
  const ctx = React.useContext(IconsContext)
  if (!ctx) throw new Error("useIcons must be used within <IconsProvider>")
  return ctx
}

/**
 * Shared state for the /icons workspace so the category list can live in the
 * global sidebar while the grid lives in the content column — both read the
 * same loaded set, selection and counts.
 */
export function IconsProvider({ children }: { children: React.ReactNode }) {
  const [setName, setSetName] = React.useState<IconSetName>("lucide")
  const [style, setStyle] = React.useState<string | undefined>(undefined)
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string>(ALL_CATEGORIES)
  const [loaded, setLoaded] = React.useState<LoadedIconSet | null>(null)
  const [loading, setLoading] = React.useState(true)

  const activeStyle = style ?? defaultStyle(setName)
  const supportsStroke =
    setName === "lucide" ||
    (setName === "heroicons" && activeStyle === "outline")

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    void loadIconSet(setName, style).then((result) => {
      if (cancelled) return
      setLoaded(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [setName, style])

  const allNames = React.useMemo(
    () => (loaded ? Object.keys(loaded.icons).sort() : []),
    [loaded]
  )
  const categories = React.useMemo(() => categoryOptions(allNames), [allNames])
  const matches = React.useMemo(() => {
    const searched = searchIcons(allNames, query)
    return category === ALL_CATEGORIES
      ? searched
      : searched.filter((name) => categorize(name) === category)
  }, [allNames, query, category])

  const changeSet = React.useCallback((next: IconSetName) => {
    setSetName(next)
    setStyle(undefined)
    setCategory(ALL_CATEGORIES)
  }, [])

  const value: IconsContextValue = {
    setName,
    changeSet,
    style,
    setStyle,
    activeStyle,
    supportsStroke,
    loaded,
    loading,
    allNames,
    categories,
    category,
    setCategory,
    query,
    setQuery,
    matches,
  }

  return <IconsContext.Provider value={value}>{children}</IconsContext.Provider>
}
