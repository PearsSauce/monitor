/**
 * CSV Export Tests
 * Property 9: CSV Export Completeness
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { generateCSV } from '@/hooks/useExport'

describe('CSV Export', () => {
  describe('Property 9: CSV Export Completeness', () => {
    it('should include all required fields for any history data', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              checked_at: fc.constant(new Date().toISOString()),
              online: fc.boolean(),
              status_code: fc.integer({ min: 100, max: 599 }),
              response_ms: fc.integer({ min: 0, max: 60000 }),
              error: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
            }),
            { minLength: 0, maxLength: 50 }
          ),
          (historyData) => {
            const csv = generateCSV(historyData)
            const lines = csv.split('\n')
            const header = lines[0]
            
            // Header should contain all required fields
            expect(header).toContain('timestamp')
            expect(header).toContain('status')
            expect(header).toContain('response_ms')
            expect(header).toContain('status_code')
            expect(header).toContain('error')
            
            // Each data row should have same number of columns as header
            const headerCols = header.split(',').length
            lines.slice(1).filter(l => l.trim()).forEach(line => {
              // Handle quoted fields that may contain commas
              const cols = parseCSVLine(line)
              expect(cols.length).toBe(headerCols)
            })
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty history data', () => {
      const csv = generateCSV([])
      const lines = csv.split('\n')
      
      // Should have header only
      expect(lines.length).toBe(1)
      expect(lines[0]).toContain('timestamp')
    })

    it('should properly escape special characters', () => {
      const historyWithSpecialChars = [
        {
          checked_at: '2024-01-01T00:00:00Z',
          online: false,
          status_code: 500,
          response_ms: 1000,
          error: 'Error with "quotes" and, commas',
        },
        {
          checked_at: '2024-01-02T00:00:00Z',
          online: true,
          status_code: 200,
          response_ms: 50,
          error: 'Multi\nline\nerror',
        },
      ]

      const csv = generateCSV(historyWithSpecialChars)
      const lines = csv.split('\n')
      
      // Should have header + 2 data rows (but multiline error creates more lines)
      expect(lines.length).toBeGreaterThanOrEqual(2)
      
      // First data row should have escaped quotes
      expect(csv).toContain('""quotes""')
    })

    it('should convert online status to readable format', () => {
      const history = [
        {
          checked_at: '2024-01-01T00:00:00Z',
          online: true,
          status_code: 200,
          response_ms: 50,
        },
        {
          checked_at: '2024-01-02T00:00:00Z',
          online: false,
          status_code: 500,
          response_ms: 1000,
        },
      ]

      const csv = generateCSV(history)
      
      expect(csv).toContain('online')
      expect(csv).toContain('offline')
    })

    it('should handle missing error field', () => {
      const history = [
        {
          checked_at: '2024-01-01T00:00:00Z',
          online: true,
          status_code: 200,
          response_ms: 50,
          // error is undefined
        },
      ]

      const csv = generateCSV(history)
      const lines = csv.split('\n')
      
      // Should have header + 1 data row
      expect(lines.length).toBe(2)
      
      // Data row should have 5 columns (error should be empty string)
      const dataCols = parseCSVLine(lines[1])
      expect(dataCols.length).toBe(5)
    })
  })
})

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++ // Skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}
