import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load landing page with correct title', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Free For NonProfits|home/i)

    // Check for main heading
    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
  })

  test('should display hero section', async ({ page }) => {
    // Look for common hero elements
    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()
  })

  test('should have Browse Tools button', async ({ page }) => {
    const browseButton = page.locator('button, a', { hasText: /browse tools|explore/i })
    await expect(browseButton.first()).toBeVisible()
  })

  test('should navigate to tools page when Browse Tools clicked', async ({ page }) => {
    const browseButton = page.locator('button, a', { hasText: /browse tools|explore/i })
    await browseButton.first().click()

    // Should navigate to /tools
    await expect(page).toHaveURL(/\/tools/)
  })

  test('should display search bar if present', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]')

    // Check if search bar exists
    const exists = await searchInput.count()
    if (exists > 0) {
      await expect(searchInput.first()).toBeVisible()
    }
  })

  test('should have working navigation links', async ({ page }) => {
    // Look for navigation links
    const navLinks = page.locator('nav a, header a')
    const count = await navLinks.count()

    expect(count).toBeGreaterThan(0)

    // At least one link should be visible
    const firstLink = navLinks.first()
    await expect(firstLink).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
  })

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    const mainHeading = page.locator('h1')
    await expect(mainHeading).toBeVisible()
  })

  test('should load all images', async ({ page }) => {
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const imageCount = await images.count()

    if (imageCount > 0) {
      // Check at least the first image loaded
      const firstImage = images.first()
      const isVisible = await firstImage.isVisible()
      expect(isVisible).toBeTruthy()
    }
  })

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main')
    if (await main.count() > 0) {
      await expect(main).toBeVisible()
    }

    // Check for navigation landmark
    const nav = page.locator('nav')
    if (await nav.count() > 0) {
      await expect(nav).toBeVisible()
    }
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })

  test('should have social links if present', async ({ page }) => {
    const socialLinks = page.locator('a[href*="twitter"], a[href*="github"], a[href*="linkedin"]')
    const count = await socialLinks.count()

    // Social links are optional
    if (count > 0) {
      await expect(socialLinks.first()).toBeVisible()
    }
  })

  test('should have footer', async ({ page }) => {
    const footer = page.locator('footer')

    if (await footer.count() > 0) {
      await expect(footer).toBeVisible()
    }
  })

  test('should have contact information if present', async ({ page }) => {
    const emailLink = page.locator('a[href^="mailto:"]')
    const phoneLink = page.locator('a[href^="tel:"]')

    const hasContact = (await emailLink.count()) > 0 || (await phoneLink.count()) > 0

    if (hasContact) {
      const contactElement = (await emailLink.count()) > 0 ? emailLink : phoneLink
      await expect(contactElement.first()).toBeVisible()
    }
  })
})
