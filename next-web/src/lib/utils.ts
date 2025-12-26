import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNotificationMessage(msg: string): string {
  if (!msg) return ''
  
  // Handle status change messages (Offline/Online)
  // Format: 站点「Name」发生异常（Reason），状态码=Code, 错误=Err
  if (msg.includes('发生异常') || msg.includes('恢复在线')) {
    // Cut off at "，状态码=" or ", 状态码="
    // The backend uses Chinese comma for status code: "），状态码="
    let idx = msg.indexOf('，状态码=')
    if (idx !== -1) return msg.substring(0, idx)
    
    idx = msg.indexOf(', 状态码=')
    if (idx !== -1) return msg.substring(0, idx)

    // Fallback: cut off at ", 错误=" if status code is missing for some reason
    idx = msg.indexOf(', 错误=')
    if (idx !== -1) return msg.substring(0, idx)
  }

  // Handle SSL expiry messages
  // Format: 站点「Name」SSL 证书还有 X 天过期（Timestamp）
  if (msg.includes('SSL 证书还有')) {
    const idx = msg.lastIndexOf('（')
    if (idx !== -1) return msg.substring(0, idx)
  }

  return msg
}
