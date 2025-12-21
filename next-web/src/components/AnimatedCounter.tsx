'use client'

import { useMemo, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

interface AnimatedCounterProps {
  value: number | string
  className?: string
  suffix?: string
}

export const AnimatedCounter = ({ value, className, suffix }: AnimatedCounterProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  
  const { num, unit } = useMemo(() => {
    if (typeof value === 'number') return { num: value, unit: suffix || '' }
    const str = String(value)
    const n = parseFloat(str)
    if (isNaN(n)) return { num: null, unit: '' }
    const u = suffix || str.replace(String(n), '')
    return { num: n, unit: u }
  }, [value, suffix])

  const isNum = num !== null
  
  useGSAP(() => {
    if (isNum && ref.current) {
      gsap.from(ref.current, {
        textContent: 0,
        duration: 2,
        ease: 'power3.out',
        snap: { textContent: 1 }
      })
    }
  }, [num])

  return (
    <div className={cn(className)}>
      <span ref={ref}>{isNum ? num : value}</span>{isNum ? unit : ''}
    </div>
  )
}
