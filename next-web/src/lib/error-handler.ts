import { toast } from 'sonner'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

/**
 * Parse error from various sources into a consistent format
 */
export function parseError(error: unknown): ApiError {
  if (error instanceof Error) {
    return { message: error.message }
  }
  
  if (typeof error === 'string') {
    return { message: error }
  }
  
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    return {
      message: (err.message as string) || (err.error as string) || '未知错误',
      code: err.code as string | undefined,
      status: err.status as number | undefined,
    }
  }
  
  return { message: '未知错误' }
}

/**
 * Show error toast with optional retry action
 */
export function showErrorToast(
  error: unknown,
  options?: {
    title?: string
    onRetry?: () => void
  }
) {
  const parsed = parseError(error)
  
  toast.error(options?.title || '操作失败', {
    description: parsed.message,
    ...(options?.onRetry && {
      action: {
        label: '重试',
        onClick: options.onRetry,
      },
    }),
  })
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string, description?: string) {
  toast.success(message, { description })
}

/**
 * Show warning toast
 */
export function showWarningToast(message: string, description?: string) {
  toast.warning(message, { description })
}

/**
 * Show info toast
 */
export function showInfoToast(message: string, description?: string) {
  toast.info(message, { description })
}

/**
 * Wrapper for async operations with automatic error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    errorTitle?: string
    onRetry?: () => void
    silent?: boolean
  }
): Promise<T | null> {
  try {
    return await operation()
  } catch (error) {
    if (!options?.silent) {
      showErrorToast(error, {
        title: options?.errorTitle,
        onRetry: options?.onRetry,
      })
    }
    return null
  }
}
