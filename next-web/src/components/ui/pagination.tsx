import * as React from "react"
import { Button } from "@/components/ui/button"
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react"

type PaginationProps = {
  page: number
  pageCount: number
  onChange: (page: number) => void
  disabled?: boolean
}

function Pagination({ page, pageCount, onChange, disabled }: PaginationProps) {
  const canPrev = page > 1 && !disabled
  const canNext = page < pageCount && !disabled
  return (
    <div className="inline-flex items-center space-x-2">
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onChange(1)} disabled={!canPrev}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onChange(page - 1)} disabled={!canPrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex w-[120px] items-center justify-center text-sm font-medium">
        第 {page} / {pageCount} 页
      </div>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onChange(page + 1)} disabled={!canNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button variant="outline" className="h-8 w-8 p-0" onClick={() => onChange(pageCount)} disabled={!canNext}>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { Pagination }
