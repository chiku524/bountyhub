import { test, expect } from '@playwright/test'
import { mockSignedInCommunity } from './helpers/mockSignedIn'

test.describe('signed-in Community', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedInCommunity(page)
  })

  test('loads without ErrorBoundary and renders the feed', async ({ page }) => {
    await page.goto('/community')

    await expect(page.getByRole('heading', { name: /^community$/i })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
    // All three layouts stay mounted (hidden) to avoid remount cost — assert a visible match.
    await expect(
      page.getByRole('link', { name: /E2E Sample Bounty Question/i }).first()
    ).toBeVisible({ timeout: 20_000 })
  })

  test('layout toggles List / Grid / Gallery', async ({ page }) => {
    await page.goto('/community')
    await expect(
      page.getByRole('link', { name: /E2E Sample Bounty Question/i }).first()
    ).toBeVisible({ timeout: 30_000 })

    const listBtn = page.getByRole('button', { name: /list layout/i })
    const gridBtn = page.getByRole('button', { name: /grid layout/i })
    const galleryBtn = page.getByRole('button', { name: /gallery layout/i })

    await expect(listBtn).toBeVisible()
    await gridBtn.click()
    await expect(gridBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByRole('link', { name: /E2E Sample Bounty Question/i }).first()
    ).toBeVisible()

    await galleryBtn.click()
    await expect(galleryBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByRole('link', { name: /E2E Sample Bounty Question/i }).first()
    ).toBeVisible()

    await listBtn.click()
    await expect(listBtn).toHaveAttribute('aria-pressed', 'true')
    await expect(
      page.getByRole('link', { name: /Another E2E Community Post/i }).first()
    ).toBeVisible()
  })

  test('discovery tabs switch and update the URL', async ({ page }) => {
    await page.goto('/community')
    await expect(page.getByRole('tab', { name: /^trending$/i })).toBeVisible({
      timeout: 30_000,
    })
    await expect(page.getByRole('tab', { name: /^trending$/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await page.getByRole('tab', { name: /^new$/i }).click()
    await expect(page).toHaveURL(/tab=new/)
    await expect(page.getByRole('tab', { name: /^new$/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    await page.getByRole('tab', { name: /^top bounties$/i }).click()
    await expect(page).toHaveURL(/tab=bounties/)
    await expect(
      page.getByRole('link', { name: /High Bounty Wallet Integration/i }).first()
    ).toBeVisible({ timeout: 15_000 })

    await page.getByRole('tab', { name: /^unanswered$/i }).click()
    await expect(page).toHaveURL(/tab=unanswered/)
    await expect(
      page.getByRole('link', { name: /Unanswered Rust FFI Question/i }).first()
    ).toBeVisible({ timeout: 15_000 })

    // Deep-link
    await page.goto('/community?tab=bounties')
    await expect(page.getByRole('tab', { name: /^top bounties$/i })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
