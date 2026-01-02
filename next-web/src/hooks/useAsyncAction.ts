import { useCallback } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { toast } from 'sonner'

interface UseAsyncActionOptions {
  successMessage?: string
  errorMessage?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

/**
 * Hook for managing async operations with loading states and error handling
 * Integrates with uiStore for global pending operation tracking
 */
export function useAsyncAction<T extends (...args: any[]) => Promise<any>>(
  actionId: string,
  action: T,
  options: UseAsyncActionOptions = {}
) {
  const { addPendingOp, removePendingOp, hasPendingOp } = useUIStore()
  
  const execute = useCallback(async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    if (hasPendingOp(actionId)) {
      return undefined
    }
    
    addPendingOp(actionId)
    
    try {
      const result = await action(...args)
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      options.onSuccess?.()
      
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '操作失败'
      
      if (options.errorMessage) {
        toast.error(options.errorMessage, {
          description: errorMsg,
          action: {
            label: '重试',
            onClick: () => execute(...args),
          },
        })
      } else {
        toast.error(errorMsg, {
          action: {
            label: '重试',
            onClick: () => execute(...args),
          },
        })
      }
      
      options.onError?.(error instanceof Error ? error : new Error(errorMsg))
      
      return undefined
    } finally {
      removePendingOp(actionId)
    }
  }, [actionId, action, options, addPendingOp, removePendingOp, hasPendingOp])
  
  const isLoading = hasPendingOp(actionId)
  
  return { execute, isLoading }
}

/**
 * Simple hook to check if a specific operation is pending
 */
export function useIsPending(actionId: string): boolean {
  return useUIStore((state) => state.pendingOperations.has(actionId))
}
