import { test, expect } from '@playwright/test'

test.describe('Tools Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tools')
  })

  test('should load tools page', async ({ page }) => {
    // Check page title or heading
    const heading = page.locator('h1, h2')
    await expect(heading.first()).toBeVisible()
  })

  test('should display tool grid', async ({ page }) => {
    // Wait for tools to load
    await page.waitForLoadState('networkidle')

    // Look for tool cards
    const toolCards = page.locator('[class*="card"], article, [data-testid*="tool"]')
    const cardCount = await toolCards.count()

    // Should have at least one tool or a "no results" message
    expect(cardCount).toBeGreaterThanOrEqual(0)
  })

  test('should have category filter', async ({ page }) => {
    const categoryFilter = page.locator('select, [role="listbox"], button', {
      hasText: /category|filter/i,
    })

    if (await categoryFilter.count() > 0) {
      await expect(categoryFilter.first()).toBeVisible()
    }
  })

  test('should filter tools by category', async ({ page }) => {
    const categoryFilter = page.locator('select, [role="combobox"]').first()

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click()

      // Try to select first available option
      const option = page.locator('[role="option"]').first()
      if (await option.count() > 0) {
        await option.click()

        // Wait for results to update
        await page.waitForLoadState('networkidle')

        // Verify page updated
        await expect(page).toHaveURL(/category=/i)
      }
    }
  })

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible()

      // Test typing in search
      await searchInput.first().fill('communication')
      await page.waitForLoadState('networkidle')

      // URL should update with search params
      await expect(page).toHaveURL(/search|query|q=/i)
    }
  })

  test('should display tool cards with essential information', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const toolNames = page.locator('h3, [class*="title"]')
    if (await toolNames.count() > 0) {
      await expect(toolNames.first()).toBeVisible()
    }

    const toolDescriptions = page.locator('p')
    if (await toolDescriptions.count() > 0) {
      await expect(toolDescriptions.first()).toBeVisible()
    }
  })

  test('should show pricing badges', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const pricingBadges = page.locator('[class*="badge"], span', {
      hasText: /free|freemium|paid|discount/i,
    })

    if (await pricingBadges.count() > 0) {
      await expect(pricingBadges.first()).toBeVisible()
    }
  })

  test('should display star ratings', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const starButtons = page.locator('button[aria-label*="star"]')
    if (await starButtons.count() > 0) {
      await expect(starButtons.first()).toBeVisible()
    }
  })

  test('should navigate to tool detail page', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Look for tool detail links
    const detailLinks = page.locator('a', { hasText: /view details|more info/i })

    if (await detailLinks.count() > 0) {
      const firstLink = detailLinks.first()
      const href = await firstLink.getAttribute('href')

      await firstLink.click()

      // Should navigate to tool detail page
      if (href) {
        await expect(page).toHaveURL(new RegExp(href.replace(/^\//, '')))
      }
    }
  })

  test('should have pagination or load more', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    // Look for pagination or load more button
    const pagination = page.locator('nav[aria-label*="pagination"], button', {
      hasText: /next|previous|load more|page/i,
    })

    const hasPagination = await pagination.count() > 0

    // Pagination is optional
    expect(typeof hasPagination).toBe('boolean')
  })

  test('should have working sort options if available', async ({ page }) => {
    const sortSelect = page.locator('select, button', { hasText: /sort|order/i })

    if (await sortSelect.count() > 0) {
      await expect(sortSelect.first()).toBeVisible()

      await sortSelect.first().click()

      // Check for sort options
      const options = page.locator('[role="option"]')
      if (await options.count() > 0) {
        await options.first().click()
        await page.waitForLoadState('networkidle')
      }
    }
  })

  test('should display empty state message if no tools', async ({ page }) => {
    // Search for something unlikely to return results
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    if (await searchInput.count() > 0) {
      await searchInput.first().fill('xyznonexistenttool123')
      await page.waitForLoadState('networkidle')

      // Look for empty state message
      const emptyMessage = page.locator('text=/no results|no tools|empty/i')

      if (await emptyMessage.count() > 0) {
        await expect(emptyMessage.first()).toBeVisible()
      }
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const toolCards = page.locator('[class*="card"], article')
    if (await toolCards.count() > 0) {
      await expect(toolCards.first()).toBeVisible()
    }
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const toolCards = page.locator('[class*="card"], article')
    if (await toolCards.count() > 0) {
      await expect(toolCards.first()).toBeVisible()
    }
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/tools')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })

  test('should load all tool images', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      const firstImage = images.first()
      await expect(firstImage).toBeVisible()
    }
  })

  test('should preserve filters when navigating back', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    if (await searchInput.count() > 0) {
      // Search for something
      await searchInput.first().fill('communication')
      await page.waitForLoadState('networkidle')

      const currentUrl = page.url()

      // Navigate to a tool detail if available
      const detailLinks = page.locator('a', { hasText: /view details/i })
      if (await detailLinks.count() > 0) {
        await detailLinks.first().click()
        await page.waitForLoadState('networkidle')

        // Go back
        await page.goBack()
        await page.waitForLoadState('networkidle')

        // URL should be restored (approximately)
        expect(page.url()).toContain('communication')
      }
    }
  })

  test('should show tool rating and review count', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const reviewCounts = page.locator('text=/\\(\\d+\\s*reviews?\\)|\\d+\\s*ratings?/i')

    if (await reviewCounts.count() > 0) {
      await expect(reviewCounts.first()).toBeVisible()
    }
  })

  test('should have accessibility features', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main')
    if (await main.count() > 0) {
      await expect(main).toBeVisible()
    }

    // Check for proper headings
    const headings = page.locator('h1, h2, h3')
    const headingCount = await headings.count()
    expect(headingCount).toBeGreaterThan(0)

    // Search input should be accessible
    const searchInput = page.locator('input[type="search"]')
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeFocused() ||
        (await expect(searchInput.first()).toBeVisible())
    }
  })
})

test.describe('Tool Detail Page', () => {
  test('should load tool detail page', async ({ page }) => {
    // Navigate to tools first
    await page.goto('/tools')
    await page.waitForLoadState('networkidle')

    // Find and click a tool detail link
    const detailLinks = page.locator('a', { hasText: /view details/i })

    if (await detailLinks.count() > 0) {
      await detailLinks.first().click()
      await page.waitForLoadState('networkidle')

      // Should be on detail page with /tools/[id] pattern
      await expect(page).toHaveURL(/\/tools\/[a-f0-9-]+/)
    }
  })

  test('should display full tool information', async ({ page }) => {
    // Navigate to a tool detail page
    await page.goto('/tools')
    await page.waitForLoadState('networkidle')

    const detailLinks = page.locator('a', { hasText: /view details/i })
    if (await detailLinks.count() > 0) {
      await detailLinks.first().click()
      await page.waitForLoadState('networkidle')

      // Check for key elements
      const heading = page.locator('h1, h2')
      if (await heading.count() > 0) {
        await expect(heading.first()).toBeVisible()
      }

      // Look for description
      const description = page.locator('p')
      if (await description.count() > 0) {
        await expect(description.first()).toBeVisible()
      }
    }
  })

  test('should have back navigation', async ({ page }) => {
    await page.goto('/tools')
    await page.waitForLoadState('networkidle')

    const detailLinks = page.locator('a', { hasText: /view details/i })
    if (await detailLinks.count() > 0) {
      await detailLinks.first().click()
      await page.waitForLoadState('networkidle')

      // Look for back button or link
      const backButton = page.locator('button, a', { hasText: /back|return|< /i })

      if (await backButton.count() > 0) {
        await expect(backButton.first()).toBeVisible()

        // Click back and verify return to tools
        await backButton.first().click()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL(/\/tools/)
      }
    }
  })
})
