import * as React from "react"
import { cn } from "@/lib/utils"

function Breadcrumb({ children, className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav aria-label="breadcrumb" className={cn("text-sm text-muted-foreground", className)} {...props}>
      <ol className="flex items-center gap-1">{children}</ol>
    </nav>
  )
}

function BreadcrumbItem({ children, className, ...props }: React.HTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("flex items-center gap-1", className)} {...props}>
      {children}
    </li>
  )
}

function BreadcrumbLink({ children, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn("hover:text-foreground transition-colors", className)} {...props}>
      {children}
    </a>
  )
}

function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("mx-1 text-muted-foreground", className)} {...props}>
      /
    </span>
  )
}

function BreadcrumbPage({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-foreground", className)} {...props}>
      {children}
    </span>
  )
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage }

