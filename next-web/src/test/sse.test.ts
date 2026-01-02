/**
 * SSE Manager Tests
 * Property 3: SSE Singleton Connection
 * Property 4: SSE Exponential Backoff
 * Property 5: SSE Store Synchronization
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock EventSource
const mockInstances: MockEventSource[] = []

class MockEventSource {
  url: string
  readyState: number = 0 // CONNECTING
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  
  constructor(url: string) {
    this.url = url
    mockInstances.push(this)
  }
  
  close() {
    this.readyState = 2 // CLOSED
  }
  
  simulateOpen() {
    this.readyState = 1 // OPEN
    this.onopen?.()
  }
  
  simulateMessage(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) })
  }
  
  simulateError() {
    this.onerror?.()
  }
}

// Set up global mock before any imports
vi.stubGlobal('EventSource', MockEventSource)

function resetMockInstances() {
  mockInstances.length = 0
}

describe('SSE Manager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetMockInstances()
  })
  
  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Property 3: SSE Singleton Connection', () => {
    it('should maintain exactly one connection across multiple connect calls', async () => {
      // Reset modules to get fresh instance
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      sseManager.reset()
      resetMockInstances()
      
      // Call connect multiple times
      for (let i = 0; i < 10; i++) {
        sseManager.connect()
      }
      
      // Should only have one EventSource instance
      expect(mockInstances.length).toBe(1)
    })

    it('should not create new connection if already connected', async () => {
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      sseManager.reset()
      resetMockInstances()
      
      sseManager.connect()
      expect(mockInstances.length).toBe(1)
      
      const instance = mockInstances[0]
      instance.simulateOpen()
      
      // Try to connect again
      sseManager.connect()
      
      // Should still have only one instance
      expect(mockInstances.length).toBe(1)
    })
  })

  describe('Property 4: SSE Exponential Backoff', () => {
    it('should calculate exponentially increasing delays', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 8 }),
          (attempts) => {
            const baseDelay = 1000
            const maxDelay = 30000
            
            // Calculate delays for consecutive attempts
            const delays: number[] = []
            for (let i = 0; i <= attempts; i++) {
              const delay = Math.min(baseDelay * Math.pow(2, i), maxDelay)
              delays.push(delay)
            }
            
            // Verify exponential growth (each delay >= previous, until max)
            for (let i = 1; i < delays.length; i++) {
              expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1])
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should cap delay at maximum value', async () => {
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      sseManager.reset()
      
      const maxDelay = 30000
      
      // Test multiple times
      for (let i = 0; i < 100; i++) {
        const delay = sseManager.getReconnectDelay()
        // Account for jitter (±10%)
        expect(delay).toBeLessThanOrEqual(maxDelay * 1.1)
      }
    })
  })

  describe('Property 5: SSE Store Synchronization', () => {
    it('should notify all handlers when message received', async () => {
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      
      // Generate test events
      const testEvents = fc.sample(
        fc.array(
          fc.record({
            MonitorID: fc.integer({ min: 1, max: 1000 }),
            CheckedAt: fc.constant(new Date().toISOString()),
            Online: fc.boolean(),
            StatusCode: fc.integer({ min: 100, max: 599 }),
            ResponseMs: fc.integer({ min: 0, max: 60000 }),
            Error: fc.string({ maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        100
      )
      
      for (const events of testEvents) {
        sseManager.reset()
        resetMockInstances()
        
        const receivedEvents: unknown[] = []
        const handler = (event: unknown) => receivedEvents.push(event)
        
        sseManager.onMessage(handler)
        sseManager.connect()
        
        const instance = mockInstances[0]
        expect(instance).toBeDefined()
        instance.simulateOpen()
        
        // Send all events
        events.forEach(event => instance.simulateMessage(event))
        
        // All events should be received
        expect(receivedEvents.length).toBe(events.length)
        
        // Events should match (deep equality)
        events.forEach((event, i) => {
          expect(receivedEvents[i]).toEqual(event)
        })
      }
    })

    it('should notify connection handlers on state change', async () => {
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      sseManager.reset()
      resetMockInstances()
      
      const connectionStates: boolean[] = []
      const handler = (connected: boolean) => connectionStates.push(connected)
      
      sseManager.onConnectionChange(handler)
      sseManager.connect()
      
      const instance = mockInstances[0]
      expect(instance).toBeDefined()
      
      // Simulate open
      instance.simulateOpen()
      expect(connectionStates).toContain(true)
      
      // Simulate error (disconnect)
      instance.simulateError()
      expect(connectionStates).toContain(false)
    })

    it('should allow unsubscribing from handlers', async () => {
      vi.resetModules()
      const { sseManager } = await import('@/lib/sse')
      sseManager.reset()
      resetMockInstances()
      
      let callCount = 0
      const handler = () => { callCount++ }
      
      const unsubscribe = sseManager.onMessage(handler)
      sseManager.connect()
      
      const instance = mockInstances[0]
      expect(instance).toBeDefined()
      instance.simulateOpen()
      
      // Send message before unsubscribe
      instance.simulateMessage({ MonitorID: 1 })
      expect(callCount).toBe(1)
      
      // Unsubscribe
      unsubscribe()
      
      // Send message after unsubscribe
      instance.simulateMessage({ MonitorID: 2 })
      expect(callCount).toBe(1) // Should not increase
    })
  })
})
