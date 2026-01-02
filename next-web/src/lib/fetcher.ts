import { API_BASE } from './api'

/**
 * SWR fetcher function with error handling
 */
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`)
  
  if (!res.ok) {
    const error = new Error('网络错误')
    // Attach extra info to the error object
    ;(error as Error & { status: number }).status = res.status
    throw error
  }
  
  return res.json()
}

/**
 * Fetcher that returns null for 404 responses
 */
export async function fetcherWithNull<T>(url: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${url}`)
  
  if (res.status === 404) {
    return null
  }
  
  if (!res.ok) {
    const error = new Error('网络错误')
    ;(error as Error & { status: number }).status = res.status
    throw error
  }
  
  return res.json()
}

/**
 * Fetcher that returns empty array for non-array responses
 */
export async function arrayFetcher<T>(url: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}${url}`)
  
  if (!res.ok) {
    const error = new Error('网络错误')
    ;(error as Error & { status: number }).status = res.status
    throw error
  }
  
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
