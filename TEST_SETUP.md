# QA Test Suite Documentation

Complete test suite for Free For NonProfits project with Vitest, Playwright, and comprehensive test coverage.

## Setup Overview

### Dependencies Installed
- **Vitest** - Fast unit and integration test runner
- **@vitejs/plugin-react** - React support for Vitest
- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - DOM matchers
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for Node.js
- **@vitest/coverage-v8** - Code coverage reporting
- **@playwright/test** - End-to-end testing framework

## Test Structure

### Unit & Integration Tests (Vitest)

#### Configuration: `vitest.config.ts`
- TypeScript support with path aliases (@/)
- jsdom environment for component testing
- Coverage reporting (v8) with 80% threshold
- Setup file for global mocks

#### Test Setup: `src/test/setup.ts`
- Mocks Next.js router and navigation
- Mocks Supabase client
- Mocks IntersectionObserver
- Suppresses irrelevant console warnings

#### Test Utilities

**Mocks - `src/test/mocks/supabase.ts`**
- `createMockSupabaseClient()` - Full Supabase client mock with auth and query builders
- `createMockQueryBuilder()` - Chainable query builder for testing (select, eq, order, range, limit, etc.)

**Helpers - `src/test/helpers.ts`**
- `createMockTool()` - Generate mock tool objects
- `createMockReview()` - Generate mock review objects
- `createMockProfile()` - Generate mock user profile objects
- `createMockCategory()` - Generate mock category objects
- `createMockTools()` - Batch tool generation
- `createMockReviews()` - Batch review generation
- `renderWithProviders()` - Render components with providers
- `waitFor()` - Custom async wait utility

#### Test Files

**Validations - `src/__tests__/lib/validations.test.ts`**
Tests all Zod schemas:
- ✓ Valid inputs pass validation
- ✓ Invalid inputs fail with correct error messages
- ✓ Edge cases (empty strings, negative numbers, invalid URLs)
- ✓ Enum validation for pricing models, org sizes, sort options
- ✓ Coercion rules for pagination (string to number)
- ✓ Optional field handling

**API Helpers - `src/__tests__/lib/api-helpers.test.ts`**
Tests helper functions:
- ✓ `createErrorResponse()` - Error response formatting
- ✓ `createSuccessResponse()` - Success response formatting
- ✓ `parsePagination()` - Pagination parsing with defaults and limits
- ✓ Default value handling
- ✓ Invalid input fallback behavior

**Components - UI Layer**

`src/__tests__/components/ui/Button.test.tsx`
- ✓ Renders with correct variant styles (primary, secondary, outline, ghost)
- ✓ Size variants (sm, md, lg)
- ✓ Handles click events
- ✓ Disabled state and styling
- ✓ Keyboard activation (Enter, Space)
- ✓ Multiple clicks
- ✓ Accessibility (role, focus, disabled state)

`src/__tests__/components/ui/StarRating.test.tsx`
- ✓ Displays correct number of filled stars
- ✓ Half-star display for decimal ratings
- ✓ Interactive mode fires onChange
- ✓ Read-only mode doesn't fire onChange
- ✓ Hover state updates and resets
- ✓ Size variants (sm, md, lg)
- ✓ Rating text display
- ✓ Accessibility (aria-labels, keyboard navigation)

`src/__tests__/components/tools/ToolCard.test.tsx`
- ✓ Renders tool name, description, category
- ✓ Shows correct pricing badge (Free, Freemium, Paid)
- ✓ Displays star rating with review count
- ✓ Links to tool detail page
- ✓ Logo image rendering
- ✓ Line clamping and layout
- ✓ Handles special characters and long names
- ✓ Multiple cards independently

**API Routes - `src/__tests__/api/tools.test.ts`**
Tests API endpoints:
- ✓ GET /api/tools - Returns paginated list
- ✓ GET /api/tools with filters (category, pricing_model)
- ✓ POST /api/tools - Requires authentication
- ✓ POST /api/tools - Validates input schema
- ✓ POST /api/tools - Rejects duplicate tool names
- ✓ Pagination defaults and limits
- ✓ Error handling

### End-to-End Tests (Playwright)

#### Configuration: `playwright.config.ts`
- Base URL: localhost:3000
- Browsers: Chrome, Firefox, Safari, Mobile Chrome
- Screenshots on failure
- Videos on failure
- HTML reporter
- Trace recording

#### E2E Test Files

**Home Page - `e2e/home.spec.ts`**
- ✓ Page loads with correct title
- ✓ Hero section visible
- ✓ Browse Tools button present and functional
- ✓ Search bar functionality (if available)
- ✓ Navigation links working
- ✓ Responsive design (mobile, tablet, desktop)
- ✓ Images loading
- ✓ Accessibility landmarks (main, nav)
- ✓ No console errors
- ✓ Social links (if available)
- ✓ Footer present
- ✓ Contact information (if available)

**Tools Page - `e2e/tools.spec.ts`**
- ✓ Tools page loads
- ✓ Tool grid displays
- ✓ Category filter works
- ✓ Search functionality works
- ✓ Tools display name, description, pricing
- ✓ Star ratings visible
- ✓ Navigation to detail pages
- ✓ Pagination/load more (if available)
- ✓ Sort options (if available)
- ✓ Empty state message
- ✓ Responsive design
- ✓ Filter state preservation
- ✓ Accessibility features

**Tool Detail Page**
- ✓ Page loads with tool ID pattern
- ✓ Full tool information displayed
- ✓ Back navigation working

## Running Tests

### Unit Tests
```bash
# Run in watch mode (default)
npm run test

# Run once and exit
npm run test:run

# Run with coverage report
npm run test:coverage
```

### E2E Tests
```bash
# Run Playwright tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests for specific file
npx playwright test e2e/home.spec.ts
```

### CI Pipeline
```bash
# GitHub Actions runs on push and PR
# Tests run in the following order:
1. Lint (ESLint)
2. Type Check (TypeScript)
3. Unit Tests (Vitest)
4. Build
5. E2E Tests (Playwright)
6. Lighthouse CI (optional)
7. Security Audit (npm audit)
```

## Coverage Thresholds

Default coverage thresholds (80% for business logic):
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

View detailed coverage report:
```bash
npm run test:coverage
# Report generated in: coverage/index.html
```

## Test Data Management

### Mock Data Factory
All test helpers use consistent mock data generation:

```typescript
import {
  createMockTool,
  createMockReview,
  createMockProfile,
  createMockCategory,
} from '@/test/helpers'

// Create single mock
const tool = createMockTool({ name: 'Custom Tool' })

// Create multiple mocks
const tools = createMockTools(10)

// Override specific fields
const review = createMockReview({
  rating: 5,
  tool_id: 'custom-tool-id',
})
```

## Mocking Strategy

### Supabase Mocking
Supabase client is mocked in `src/test/setup.ts` globally:

```typescript
import { createMockSupabaseClient } from '@/test/mocks/supabase'

// In your test
const mockSupabase = createMockSupabaseClient()
vi.mocked(createClient).mockResolvedValue(mockSupabase)
```

### Next.js Mocking
Router and navigation are mocked globally:
- `next/router` - useRouter hook
- `next/navigation` - useRouter, usePathname, useSearchParams
- `next/link` - Link component

## Best Practices

### Writing Unit Tests
1. Use descriptive test names
2. Test behavior, not implementation
3. Use meaningful assertions
4. Mock external dependencies
5. Keep tests focused and isolated

### Writing E2E Tests
1. Test user workflows
2. Wait for page load completion
3. Use semantic selectors when possible
4. Handle optional elements gracefully
5. Make tests resilient to minor UI changes

### Code Coverage
1. Aim for 80%+ coverage on business logic
2. Focus on critical paths first
3. Test edge cases and error scenarios
4. Don't aim for 100% coverage on UI
5. Use coverage reports to identify gaps

## Troubleshooting

### Tests Failing Locally
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear cache: `npm run test -- --clearCache`
3. Check environment variables
4. Verify database mock setup

### E2E Tests Timing Out
1. Increase timeout in playwright.config.ts
2. Check if server is running: `npm run dev`
3. Verify base URL is correct
4. Check network connectivity

### Coverage Reports Not Generated
1. Ensure vitest is using v8 provider
2. Check coverage configuration in vitest.config.ts
3. Verify coverage paths are correct
4. Run `npm run test:coverage` explicitly

## CI/CD Integration

The GitHub Actions workflow runs:
- On push to main/develop branches
- On pull requests
- Produces coverage reports
- Uploads artifacts (build, reports)
- Fails if tests don't pass

All jobs are required to pass before merging to main.

## Files Created

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `playwright.config.ts` - Playwright configuration
- `.github/workflows/ci.yml` - CI/CD pipeline

### Test Files
- `src/test/setup.ts` - Global test setup
- `src/test/mocks/supabase.ts` - Supabase mocks
- `src/test/helpers.ts` - Test utilities
- `src/__tests__/lib/validations.test.ts` - Schema tests
- `src/__tests__/lib/api-helpers.test.ts` - API helper tests
- `src/__tests__/components/ui/Button.test.tsx` - Button tests
- `src/__tests__/components/ui/StarRating.test.tsx` - StarRating tests
- `src/__tests__/components/tools/ToolCard.test.tsx` - ToolCard tests
- `src/__tests__/api/tools.test.ts` - API route tests
- `e2e/home.spec.ts` - Home page E2E tests
- `e2e/tools.spec.ts` - Tools page E2E tests

### Scripts Added to package.json
- `test` - Run tests in watch mode
- `test:run` - Run tests once
- `test:coverage` - Generate coverage report
- `test:e2e` - Run E2E tests
- `test:e2e:ui` - Run E2E tests with UI

## Next Steps

1. **Run tests locally**: `npm run test:run && npm run test:coverage`
2. **Review coverage**: Open `coverage/index.html` in browser
3. **Run E2E tests**: `npm run test:e2e`
4. **Check CI**: Push to GitHub and verify workflow passes
5. **Expand tests**: Add more test cases for edge cases and new features
6. **Monitor coverage**: Track coverage trends over time

## Additional Resources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library Docs](https://testing-library.com)
- [Playwright Documentation](https://playwright.dev)
- [Zod Validation](https://zod.dev)
