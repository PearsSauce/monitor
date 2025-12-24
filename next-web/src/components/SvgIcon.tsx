'use client'

import React from 'react'

function sanitizeAndNormalize(svg: string, size: number): string {
  const s = String(svg || '')
  if (!s.toLowerCase().includes('<svg')) return ''
  let out = s
  // keep only the first <svg>...</svg>
  const match = out.match(/<svg[\s\S]*?<\/svg>/i)
  out = match ? match[0] : ''
  // remove script tags
  out = out.replace(/<script[\s\S]*?<\/script>/gi, '')
  // remove event handlers like onload="", onclick=""
  out = out.replace(/\son[a-z]+\s*=\s*["'][\s\S]*?["']/gi, '')
  // remove javascript: URLs
  out = out.replace(/\s(href|xlink:href)\s*=\s*["']\s*javascript:[\s\S]*?["']/gi, '')
  // enforce width/height
  out = out.replace(/\swidth\s*=\s*["'][\s\S]*?["']/i, '')
  out = out.replace(/\sheight\s*=\s*["'][\s\S]*?["']/i, '')
  out = out.replace(/<svg/i, `<svg width="${size}" height="${size}" focusable="false" aria-hidden="true"`)
  // prefer currentColor fill if not specified on paths; do not override inside elements
  if (!/fill\s*=\s*["']/.test(out)) {
    out = out.replace(/<svg([^>]*?)>/i, `<svg$1><style>*{fill:currentColor}</style>`)
  }
  return out
}

export function SvgIcon({ html, size = 16, className }: { html?: string; size?: number; className?: string }) {
  const cleaned = sanitizeAndNormalize(html || '', size)
  if (!cleaned) return null
  return (
    <span
      className={className}
      style={{ display: 'inline-block', width: size, height: size, lineHeight: 0, verticalAlign: 'middle' }}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  )
}

export default SvgIcon

