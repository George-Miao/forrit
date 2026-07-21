import { expect, test, type Page } from '@playwright/test'

async function mockGroups(page: Page) {
  await page.route('**/api/meta/*/group', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [
        { count: 12, name: '测试字幕组' },
        { count: 3, name: '另一字幕组' },
      ],
    }),
  )
}

async function mockSubscriptions(
  page: Page,
  subscription: Record<string, unknown> | null,
) {
  await page.route('**/api/meta/season**', async (route) => {
    const response = await route.fetch()
    const data = (await response.json()) as Array<Record<string, unknown>>
    await route.fulfill({
      response,
      json: data.map((meta) => ({ ...meta, subscription })),
    })
  })
}

test('uses the project logo to return home', async ({ page }) => {
  await page.goto('/entry')

  const homeLink = page.getByRole('link', { name: '返回首页' })
  await expect(homeLink).toBeVisible()
  await expect(homeLink.locator('img')).toHaveAttribute('src', '/favicon.svg')
  await expect(homeLink.locator('img')).toHaveCSS('width', '32px')

  await homeLink.click()
  await expect(page).toHaveURL(/\/$/)
})

test('opens the subscription menu without locking page scrolling', async ({
  page,
}) => {
  await mockGroups(page)
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')

  await expect(page.getByRole('heading', { name: '本季新番' })).toBeVisible()
  const trigger = page
    .getByRole('button', { name: /^(订阅|编辑订阅)$/ })
    .first()
  await expect(trigger).toBeVisible()
  await expect(trigger).toHaveCSS('width', '36px')
  const gridGap = await trigger.evaluate((element) => {
    const grid = element.closest('article')?.parentElement
    if (!grid) return null
    const style = getComputedStyle(grid)
    const cards = Array.from(grid.querySelectorAll('article')).slice(0, 2)
    const [first, second] = cards.map((card) => card.getBoundingClientRect())
    return {
      column: style.columnGap,
      edgeToEdge: second.x - first.right,
      row: style.rowGap,
    }
  })
  expect(gridGap).toEqual({ column: '20px', edgeToEdge: 20, row: '20px' })
  await trigger.click()

  await expect(page.getByText('订阅全部')).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const menu = page.getByRole('menu')
  await expect(menu).toBeVisible()
  const initialMenuPosition = await menu.boundingBox()
  expect(initialMenuPosition).not.toBeNull()
  await page.mouse.move(1000, 100)
  await expect
    .poll(async () => (await menu.boundingBox())?.y)
    .toBe(initialMenuPosition?.y)
  const menuItems = page.getByRole('menuitem')
  await expect(menuItems.first()).toBeVisible()
  expect(
    await menuItems.evaluateAll((items) =>
      items.every((item) => item.tagName === 'BUTTON'),
    ),
  ).toBe(true)
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.style.overflow !== 'hidden' &&
          document.body.style.overflow !== 'hidden',
      ),
    )
    .toBe(true)
  expect(errors).toEqual([])
})

test('shows subscribed cards in orange and displays group entry counts', async ({
  page,
}) => {
  await mockGroups(page)
  await mockSubscriptions(page, {
    directory: null,
    exclude: null,
    groups: 'all',
    include: null,
    max_size: null,
    min_size: null,
  })
  await page.goto('/')

  const trigger = page.getByRole('button', { name: '编辑订阅' }).first()
  await expect(trigger).toBeVisible()
  await expect(trigger.locator('svg')).toHaveCSS('color', 'rgb(249, 57, 32)')
  await trigger.click()

  await expect(page.getByLabel('12 个资源')).toBeVisible()
  await expect(page.getByText('测试字幕组', { exact: true })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: '编辑' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: '删除' })).toBeVisible()
})

test('keeps the subscription menu open when selecting a group', async ({
  page,
}) => {
  await mockGroups(page)
  await mockSubscriptions(page, null)
  await page.route('**/api/meta/*/subscription', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: { updated: true },
    }),
  )
  await page.goto('/')

  const trigger = page.getByRole('button', { name: '订阅' }).first()
  await trigger.click()
  await page.getByRole('menuitem', { name: /测试字幕组/ }).click()

  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('menu')).toBeVisible()
})

test('hides edit and delete actions when there is no subscription', async ({
  page,
}) => {
  await mockGroups(page)
  await mockSubscriptions(page, null)
  await page.goto('/')

  await page.getByRole('button', { name: '订阅' }).first().click()

  await expect(page.getByRole('menuitem', { name: '编辑' })).toHaveCount(0)
  await expect(page.getByRole('menuitem', { name: '删除' })).toHaveCount(0)
})

test('keeps two mobile cards within the viewport using the fixed gap', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: '本季新番' })).toBeVisible()
  await expect(
    page.getByRole('button', { name: /^(订阅|编辑订阅)$/ }).first(),
  ).toBeVisible()

  const layout = await page.locator('article').first().evaluate((card) => {
    const grid = card.parentElement
    if (!grid) return null
    const style = getComputedStyle(grid)
    return {
      columnGap: style.columnGap,
      overflows: document.documentElement.scrollWidth > window.innerWidth,
      rowGap: style.rowGap,
    }
  })

  expect(layout).toEqual({
    columnGap: '20px',
    overflows: false,
    rowGap: '20px',
  })
})
