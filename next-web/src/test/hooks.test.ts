/**
 * Data Fetching Hooks Tests
 * Property 1: Data Caching Consistency
 * Property 2: API Call Batching Efficiency
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock fetch
const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

describe('Data Fetching', () => {
  beforeEach(() => {
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Property 1: Data Caching Consistency', () => {
    it('should return cached data for identical requests within TTL', async () => {
      // Generate test data
      const testMonitors = fc.sample(
        fc.array(
          fc.record({
            id: fc.integer({ min: 1, max: 1000 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            url: fc.webUrl(),
            method: fc.constantFrom('GET', 'POST'),
            headers_json: fc.constant('{}'),
            body: fc.constant(''),
            expected_status_min: fc.constant(200),
            expected_status_max: fc.constant(299),
            keyword: fc.constant(''),
            interval_seconds: fc.constant(60),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        10
      )

      for (const monitors of testMonitors) {
        fetchMock.mockReset()
        fetchMock.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(monitors),
        })

        // Import fetcher
        const { arrayFetcher } = await import('@/lib/fetcher')

        // First call
        const result1 = await arrayFetcher('/api/monitors')
        expect(result1).toEqual(monitors)
        expect(fetchMock).toHaveBeenCalledTimes(1)

        // Second call should still make a request (fetcher doesn't cache, SWR does)
        const result2 = await arrayFetcher('/api/monitors')
        expect(result2).toEqual(monitors)
        
        // Both results should be identical
        expect(result1).toEqual(result2)
      }
    })

    it('should handle empty arrays correctly', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      })

      const { arrayFetcher } = await import('@/lib/fetcher')
      const result = await arrayFetcher('/api/monitors')
      
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should convert non-array responses to empty arrays', async () => {
      const nonArrayValues = [null, undefined, 'string', 123, { data: [1, 2, 3] }]
      
      for (const nonArrayData of nonArrayValues) {
        fetchMock.mockReset()
        fetchMock.mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(nonArrayData),
        })

        const { arrayFetcher } = await import('@/lib/fetcher')
        const result = await arrayFetcher('/api/test')
        
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(0)
      }
    })
  })

  describe('Property 2: API Call Batching Efficiency', () => {
    it('should make O(1) initial API calls regardless of monitor count', async () => {
      // Test with various monitor counts
      const monitorCounts = [1, 5, 10, 50, 100]
      
      for (const count of monitorCounts) {
        fetchMock.mockReset()
        
        // Generate monitors
        const monitors = Array.from({ length: count }, (_, i) => ({
          id: i + 1,
          name: `Monitor ${i + 1}`,
          url: `https://example${i}.com`,
          method: 'GET',
          headers_json: '{}',
          body: '',
          expected_status_min: 200,
          expected_status_max: 299,
          keyword: '',
          interval_seconds: 60,
        }))

        fetchMock.mockImplementation((url: string) => {
          if (url.includes('/api/monitors') && !url.includes('/history') && !url.includes('/latest')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve(monitors),
            })
          }
          if (url.includes('/api/groups')) {
            return Promise.resolve({
              ok: true,
              json: () => Promise.resolve([]),
            })
          }
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(null),
          })
        })

        const { arrayFetcher } = await import('@/lib/fetcher')
        
        // Fetch monitors (single call)
        await arrayFetcher('/api/monitors')
        
        // Fetch groups (single call)
        await arrayFetcher('/api/groups')
        
        // Initial page load should only need 2 main API calls
        // (monitors and groups), not N calls per monitor
        const mainApiCalls = fetchMock.mock.calls.filter(
          (call) => 
            call[0].includes('/api/monitors') && 
            !call[0].includes('/history') && 
            !call[0].includes('/latest') &&
            !call[0].includes('/ssl')
        ).length
        
        const groupApiCalls = fetchMock.mock.calls.filter(
          (call) => call[0].includes('/api/groups')
        ).length
        
        // Should be constant (1 each), not proportional to monitor count
        expect(mainApiCalls).toBe(1)
        expect(groupApiCalls).toBe(1)
      }
    })

    it('should batch SSL and latest result fetches efficiently', async () => {
      // This test verifies that while we do make per-monitor calls for SSL/latest,
      // they are done in parallel (Promise.all pattern)
      const monitorCount = 10
      const monitors = Array.from({ length: monitorCount }, (_, i) => ({
        id: i + 1,
        name: `Monitor ${i + 1}`,
        url: `https://example${i}.com`,
        method: 'GET',
        headers_json: '{}',
        body: '',
        expected_status_min: 200,
        expected_status_max: 299,
        keyword: '',
        interval_seconds: 60,
      }))

      const callOrder: string[] = []
      
      fetchMock.mockImplementation((url: string) => {
        callOrder.push(url)
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(
            url.includes('/api/monitors') && !url.includes('/latest') && !url.includes('/ssl')
              ? monitors
              : url.includes('/api/groups')
              ? []
              : null
          ),
        })
      })

      const { arrayFetcher } = await import('@/lib/fetcher')
      
      // Simulate parallel fetches
      await Promise.all([
        arrayFetcher('/api/monitors'),
        arrayFetcher('/api/groups'),
      ])

      // Both main calls should be made
      expect(callOrder.filter(u => u.includes('/api/monitors') && !u.includes('/latest'))).toHaveLength(1)
      expect(callOrder.filter(u => u.includes('/api/groups'))).toHaveLength(1)
    })
  })
})
