import { describe, it, expect } from 'vitest'
import { shuffleArray, getRandomInt } from '@/utils/helpers'

describe('shuffleArray', () => {
  it('should preserve the length of the array', () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffleArray([...original])
    expect(result).toHaveLength(original.length)
  })

  it('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5]
    const result = shuffleArray([...original])
    expect(result.sort()).toEqual(original.sort())
  })

  it('should return the same array reference', () => {
    const arr = [1, 2, 3]
    const result = shuffleArray(arr)
    expect(result).toBe(arr)
  })

  it('should handle an empty array', () => {
    const result = shuffleArray([])
    expect(result).toEqual([])
  })

  it('should handle a single-element array', () => {
    const result = shuffleArray([42])
    expect(result).toEqual([42])
  })
})

describe('getRandomInt', () => {
  it('should return an integer within the given range', () => {
    for (let i = 0; i < 100; i++) {
      const result = getRandomInt(1, 10)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(10)
      expect(Number.isInteger(result)).toBe(true)
    }
  })

  it('should return the only possible value when min equals max', () => {
    expect(getRandomInt(5, 5)).toBe(5)
  })

  it('should handle zero as a boundary', () => {
    for (let i = 0; i < 50; i++) {
      const result = getRandomInt(0, 1)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    }
  })
})
