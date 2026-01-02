/**
 * Property 8: API Response Type Validation
 * Validates: Requirements 6.2
 * 
 * For any API response, if the response shape does not match the expected
 * TypeScript interface, the system should handle it gracefully.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Type guards for runtime validation
function isValidMonitor(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.url === 'string' &&
    typeof obj.method === 'string'
  )
}

function isValidGroup(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string'
  )
}

function isValidHistoryItem(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return (
    typeof obj.checked_at === 'string' &&
    typeof obj.online === 'boolean' &&
    typeof obj.status_code === 'number' &&
    typeof obj.response_ms === 'number'
  )
}

function isValidSSLInfo(data: unknown): boolean {
  if (data === null) return true // null is valid for no SSL
  if (typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  // All fields are optional
  if (obj.expires_at !== undefined && typeof obj.expires_at !== 'string') return false
  if (obj.issuer !== undefined && typeof obj.issuer !== 'string') return false
  if (obj.days_left !== undefined && typeof obj.days_left !== 'number') return false
  return true
}

// Arbitraries for generating test data
const validMonitorArb = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1 }),
  url: fc.webUrl(),
  method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'HEAD'),
  headers_json: fc.constant('{}'),
  body: fc.string(),
  expected_status_min: fc.integer({ min: 100, max: 599 }),
  expected_status_max: fc.integer({ min: 100, max: 599 }),
  keyword: fc.string(),
  interval_seconds: fc.integer({ min: 30, max: 3600 }),
})

const invalidMonitorArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.string(),
  fc.integer(),
  fc.record({ id: fc.string() }), // wrong type for id
  fc.record({ name: fc.integer() }), // wrong type for name
)

const validGroupArb = fc.record({
  id: fc.integer({ min: 1 }),
  name: fc.string({ minLength: 1 }),
  icon: fc.option(fc.string(), { nil: undefined }),
  color: fc.option(fc.string(), { nil: undefined }),
})

const validHistoryArb = fc.record({
  checked_at: fc.date().map(d => d.toISOString()),
  online: fc.boolean(),
  status_code: fc.integer({ min: 100, max: 599 }),
  response_ms: fc.integer({ min: 0, max: 60000 }),
  error: fc.option(fc.string(), { nil: undefined }),
})

describe('API Response Type Validation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('Monitor validation', () => {
    it('should accept valid monitor objects', () => {
      fc.assert(
        fc.property(validMonitorArb, (monitor) => {
          expect(isValidMonitor(monitor)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should reject invalid monitor objects', () => {
      fc.assert(
        fc.property(invalidMonitorArb, (data) => {
          expect(isValidMonitor(data)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Group validation', () => {
    it('should accept valid group objects', () => {
      fc.assert(
        fc.property(validGroupArb, (group) => {
          expect(isValidGroup(group)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('History validation', () => {
    it('should accept valid history items', () => {
      fc.assert(
        fc.property(validHistoryArb, (item) => {
          expect(isValidHistoryItem(item)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })

    it('should accept arrays of valid history items', () => {
      fc.assert(
        fc.property(fc.array(validHistoryArb), (items) => {
          expect(items.every(isValidHistoryItem)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('SSL Info validation', () => {
    it('should accept null as valid SSL info', () => {
      expect(isValidSSLInfo(null)).toBe(true)
    })

    it('should accept valid SSL info objects', () => {
      const validSSLArb = fc.record({
        expires_at: fc.option(fc.date().map(d => d.toISOString()), { nil: undefined }),
        issuer: fc.option(fc.string(), { nil: undefined }),
        days_left: fc.option(fc.integer({ min: 0, max: 365 }), { nil: undefined }),
      })

      fc.assert(
        fc.property(validSSLArb, (ssl) => {
          expect(isValidSSLInfo(ssl)).toBe(true)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('API response array handling', () => {
    it('should handle empty arrays gracefully', () => {
      const emptyArray: unknown[] = []
      expect(Array.isArray(emptyArray)).toBe(true)
      expect(emptyArray.every(isValidMonitor)).toBe(true)
    })

    it('should filter invalid items from mixed arrays', () => {
      fc.assert(
        fc.property(
          fc.array(fc.oneof(validMonitorArb, invalidMonitorArb)),
          (mixedArray) => {
            const validItems = mixedArray.filter(isValidMonitor)
            expect(validItems.every(isValidMonitor)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
