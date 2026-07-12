import { describe, expect, it } from 'vitest'
import {
  clampWindowStateToScreen,
  parseSavedWindowState,
} from '../utils/desktopWindowState'

describe('parseSavedWindowState', () => {
  it('returns null for null/invalid JSON', () => {
    expect(parseSavedWindowState(null)).toBeNull()
    expect(parseSavedWindowState('not-json')).toBeNull()
    expect(parseSavedWindowState('{}')).toBeNull()
  })

  it('parses a valid state', () => {
    const raw = JSON.stringify({ width: 1200, height: 800, x: 100, y: 50 })
    expect(parseSavedWindowState(raw)).toEqual({
      width: 1200,
      height: 800,
      x: 100,
      y: 50,
    })
  })

  it('rejects undersized windows', () => {
    const raw = JSON.stringify({ width: 100, height: 100, x: 0, y: 0 })
    expect(parseSavedWindowState(raw)).toBeNull()
  })
})

describe('clampWindowStateToScreen', () => {
  it('keeps an on-screen window unchanged', () => {
    const state = { width: 1200, height: 800, x: 100, y: 80 }
    expect(clampWindowStateToScreen(state, 1920, 1080)).toEqual(state)
  })

  it('pulls a fully off-screen window back into view', () => {
    const clamped = clampWindowStateToScreen(
      { width: 1200, height: 800, x: 5000, y: -2000 },
      1920,
      1080
    )
    expect(clamped.x).toBeLessThan(1920)
    expect(clamped.y).toBeGreaterThanOrEqual(0)
    expect(clamped.x + 100).toBeGreaterThan(0)
  })
})
