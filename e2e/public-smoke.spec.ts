import { test, expect } from '@playwright/test'

test.describe('public smoke', () => {
  test('home page loads with brand', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/bountyhub/i, {
      timeout: 30_000,
    })
  })

  test('login page renders form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible({
      timeout: 20_000,
    })
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
  })

  test('signup page renders', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('form').first()).toBeVisible({ timeout: 20_000 })
  })

  test('docs page is reachable', async ({ page }) => {
    await page.goto('/docs')
    await expect(page.locator('body')).toContainText(/docs|guide|api|bounty/i, { timeout: 20_000 })
  })

  test('community page loads', async ({ page }) => {
    await page.goto('/community')
    await expect(page.locator('body')).toBeVisible()
    // Should not crash into a blank error boundary forever
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
  })

  test('analytics page loads', async ({ page }) => {
    await page.goto('/analytics')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
  })

  test('download page loads', async ({ page }) => {
    await page.goto('/download')
    await expect(page.locator('body')).toContainText(/download|desktop|windows|macos|linux/i, {
      timeout: 20_000,
    })
  })

  test('privacy and terms pages load', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('body')).toContainText(/privacy/i, { timeout: 20_000 })
    await page.goto('/terms')
    await expect(page.locator('body')).toContainText(/terms/i, { timeout: 20_000 })
  })

  test('bug bounty campaigns list is reachable', async ({ page }) => {
    await page.goto('/bug-bounty/campaigns')
    await expect(page.locator('body')).toBeVisible()
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
  })

  test('protected wallet redirects guests to sign-in gate', async ({ page }) => {
    await page.goto('/wallet')
    await expect(
      page.getByRole('heading', { name: /wallet access required|sign in/i }).first()
    ).toBeVisible({ timeout: 20_000 })
  })

  test('protected governance redirects guests', async ({ page }) => {
    await page.goto('/governance')
    await expect(
      page.getByRole('heading', { name: /sign in|governance/i }).first()
    ).toBeVisible({ timeout: 20_000 })
  })

  test('protected settings redirects guests', async ({ page }) => {
    await page.goto('/settings')
    await expect(
      page.getByRole('heading', { name: /sign in|settings/i }).first()
    ).toBeVisible({ timeout: 20_000 })
  })
})
