import { useEffect, useState } from 'react'

export default function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    // 优先从 localStorage 读取，否则检测系统偏好
    const saved = localStorage.getItem('monitor_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      document.body.setAttribute('arco-theme', 'dark')
      localStorage.setItem('monitor_theme', 'dark')
    } else {
      root.classList.remove('dark')
      document.body.removeAttribute('arco-theme')
      localStorage.setItem('monitor_theme', 'light')
    }
  }, [dark])

  return { dark, setDark }
}
