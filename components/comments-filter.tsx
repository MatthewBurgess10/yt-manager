"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, ArrowUpDown } from "lucide-react"

type FilterType = "all" | "questions" | "unreplied" | "high-priority"
type SortType = "priority" | "recent" | "likes"

interface CommentsFilterProps {
  filter: FilterType
  sort: SortType
  onFilterChange: (filter: FilterType) => void
  onSortChange: (sort: SortType) => void
}

export function CommentsFilter({ filter, sort, onFilterChange, onSortChange }: CommentsFilterProps) {
  const getFilterLabel = () => {
    switch (filter) {
      case "questions":
        return "Questions Only"
      case "unreplied":
        return "Unreplied"
      case "high-priority":
        return "High Priority"
      default:
        return "All Comments"
    }
  }

  const getSortLabel = () => {
    switch (sort) {
      case "recent":
        return "Most Recent"
      case "likes":
        return "Most Liked"
      default:
        return "Priority Score"
    }
  }

  return (
    <div className="flex gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="h-10 px-4 font-semibold border-2 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
          >
            <Filter className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filter:</span> {getFilterLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-base">Filter by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={filter} onValueChange={(value) => onFilterChange(value as FilterType)}>
            <DropdownMenuRadioItem value="all" className="text-sm py-2">
              All Comments
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="high-priority" className="text-sm py-2">
              High Priority
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="questions" className="text-sm py-2">
              Questions Only
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="unreplied" className="text-sm py-2">
              Unreplied
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="h-10 px-4 font-semibold border-2 hover:border-red-200 dark:hover:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Sort:</span> {getSortLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="text-base">Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={(value) => onSortChange(value as SortType)}>
            <DropdownMenuRadioItem value="priority" className="text-sm py-2">
              Priority Score
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="recent" className="text-sm py-2">
              Most Recent
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="likes" className="text-sm py-2">
              Most Liked
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
