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

test('redirects the root route to the bangumi page', async ({ page }) => {
  await page.route('**/api/meta/season**', (route) =>
    route.fulfill({ contentType: 'application/json', json: [] }),
  )

  await page.goto('/')

  await expect(page).toHaveURL(/\/meta$/)
  await expect(page.getByText('番剧', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: '这个季度还没有番剧' }),
  ).toBeVisible()
  await expect(page.getByText('请尝试选择其他季度')).toBeVisible()
})

test('shares season controls and page header height', async ({ page }) => {
  await page.route('**/api/meta/season**', (route) =>
    route.fulfill({ contentType: 'application/json', json: [] }),
  )
  await page.route('**/api/meta/subscription**', (route) =>
    route.fulfill({ contentType: 'application/json', json: [] }),
  )

  const now = new Date()
  const labels = ['冬季新番', '春季新番', '夏季新番', '秋季新番']
  const seasonValues = ['winter', 'spring', 'summer', 'fall']
  const currentIndex = Math.floor(now.getMonth() / 3)
  const nextIndex = (currentIndex + 1) % labels.length
  const nextYear = now.getFullYear() + (nextIndex === 0 ? 1 : 0)

  await page.goto('/meta')
  const homeHeader = page.locator('[data-page-header]')
  const homeHeight = (await homeHeader.boundingBox())?.height
  await expect(page.locator('[data-season-year]')).toHaveText(
    `${now.getFullYear()}年`,
  )
  await expect(
    page.getByRole('heading', { name: labels[currentIndex] }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '当前季度' })).toBeDisabled()
  await page.getByRole('button', { name: '下一季度' }).click()
  await expect(page).toHaveURL(
    new RegExp(`year=${nextYear}&season=${seasonValues[nextIndex]}`),
  )
  await expect(page.locator('[data-season-year]')).toHaveText(`${nextYear}年`)
  await expect(page.getByRole('heading', { name: labels[nextIndex] })).toBeVisible()
  await expect(page.getByRole('button', { name: '当前季度' })).toBeEnabled()
  await page.getByRole('button', { name: '当前季度' }).click()
  await expect(
    page.getByRole('heading', { name: labels[currentIndex] }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: '当前季度' })).toBeDisabled()
  await expect(
    page.locator('[aria-label="季度翻页"] button svg'),
  ).toHaveCount(4)
  expect(
    await page
      .locator('[aria-label="季度翻页"] button')
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute('aria-label')),
      ),
  ).toEqual(['上一季度', '当前季度', '下一季度', '选择季度'])

  await page.getByRole('button', { name: '选择季度' }).click()
  await page.getByLabel('年份').fill('2024')
  await page.getByRole('button', { name: '冬季新番' }).click()
  await expect(page).toHaveURL(/year=2024&season=winter/)
  await expect(page.locator('[data-season-year]')).toHaveText('2024年')
  await expect(page.getByRole('heading', { name: '冬季新番' })).toBeVisible()

  await page.goto('/meta?year=2026&season=summer')
  await expect(page.locator('[data-season-year]')).toHaveText('2026年')
  await expect(page.getByRole('heading', { name: '夏季新番' })).toBeVisible()

  await page.goto(`/subscription?year=${nextYear}&season=summer`)
  await expect(page.locator('[data-season-header]')).toBeVisible()
  await expect(page.locator('[data-season-year]')).toHaveText(`${nextYear}年`)
  await expect(page.getByRole('heading', { name: '夏季新番' })).toBeVisible()
  await expect(
    page.getByRole('heading', { exact: true, name: '订阅' }),
  ).toHaveCount(0)
  await expect(page.getByText('订阅', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '上一季度' })).toBeVisible()
  expect((await page.locator('[data-page-header]').boundingBox())?.height).toBe(
    homeHeight,
  )
})

test('uses the project logo to return home', async ({ page }) => {
  await page.goto('/entry')

  const homeLink = page.getByRole('link', { name: '返回首页' })
  await expect(homeLink).toBeVisible()
  await expect(homeLink.locator('img')).toHaveAttribute('src', '/favicon.svg')
  await expect(homeLink.locator('img')).toHaveCSS('width', '32px')

  await homeLink.click()
  await expect(page).toHaveURL(/\/meta$/)
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

  await page.goto('/meta')

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
  await page.goto('/meta')

  const trigger = page.getByRole('button', { name: '编辑订阅' }).first()
  await expect(trigger).toBeVisible()
  await expect(trigger.locator('svg')).toHaveCSS('color', 'rgb(249, 57, 32)')
  await trigger.click()

  await expect(page.getByLabel('12 个资源')).toBeVisible()
  await expect(page.getByText('测试字幕组', { exact: true })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: '编辑' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: '删除' })).toBeVisible()
})

test('opens a card subscription in the subscription page editor', async ({
  page,
}) => {
  let subscription = {
    directory: null,
    exclude: null,
    groups: ['原字幕组'],
    include: '1080p',
    max_size: null,
    min_size: null,
  }
  const meta = {
    _id: { $oid: '0123456789abcdef01234567' },
    begin: '2026-07-01T00:00:00Z',
    broadcast: 'R/2026-07-01T00:00:00Z/P7D',
    comment: null,
    end: null,
    lang: 'ja',
    official_site: '',
    season: null,
    season_override: null,
    sites: [],
    subscription,
    title: '测试番剧',
    title_translate: { 'zh-Hans': ['测试番剧'] },
    tv: {},
    type: 'tv',
  }

  await page.route('**/api/meta/season**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [{ ...meta, subscription }],
    }),
  )
  await page.route('**/api/meta/subscription**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [{ ...meta, subscription }],
    }),
  )
  await page.route('**/api/meta/*/group', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [
        { count: 1, name: '原字幕组' },
        { count: 2, name: '新字幕组' },
      ],
    }),
  )
  await page.route(
    '**/api/meta/0123456789abcdef01234567/subscription',
    async (route) => {
      subscription = route.request().postDataJSON()
      await route.fulfill({
        contentType: 'application/json',
        json: { updated: true },
      })
    },
  )

  await page.goto('/subscription?year=2026&season=summer')
  await expect(page.getByText('原字幕组', { exact: true })).toBeVisible()
  await page.goto('/meta?year=2026&season=summer')
  await page.getByRole('button', { name: '编辑订阅' }).click()
  await page.getByRole('menuitem', { name: /新字幕组/ }).click()
  await page.getByRole('menuitem', { name: '编辑' }).click()

  await expect(page).toHaveURL(
    '/subscription?year=2026&season=summer&edit=0123456789abcdef01234567',
  )
  await expect(page.getByLabel('包含正则')).toHaveValue('1080p')
  await expect(page.getByRole('button', { name: '选择字幕组' })).toContainText(
    '原字幕组、新字幕组',
  )
  await expect(
    page.getByRole('button', { name: '编辑 测试番剧' }),
  ).toBeVisible()
})

test('opens a detail subscription in the subscription page editor', async ({
  page,
}) => {
  const meta = {
    _id: { $oid: 'detail-meta-id' },
    begin: '2026-07-01T00:00:00Z',
    broadcast: 'R/2026-07-01T00:00:00Z/P7D',
    comment: null,
    end: null,
    lang: 'ja',
    official_site: '',
    season: null,
    season_override: null,
    sites: [],
    subscription: {
      directory: null,
      exclude: null,
      groups: ['测试字幕组'],
      include: '1080p',
      max_size: null,
      min_size: null,
    },
    title: '详情页测试番剧',
    title_translate: { 'zh-Hans': ['详情页测试番剧'] },
    tv: {},
    type: 'tv',
  }

  await page.route('**/api/meta/detail-meta-id', (route) =>
    route.fulfill({ contentType: 'application/json', json: meta }),
  )
  await page.route('**/api/meta/detail-meta-id/entry**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: { items: [], page_info: { has_next_page: false } },
    }),
  )
  await page.route('**/api/meta/detail-meta-id/group', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [{ count: 1, name: '测试字幕组' }],
    }),
  )
  await page.route('**/api/meta/subscription**', (route) =>
    route.fulfill({ contentType: 'application/json', json: [meta] }),
  )

  await page.goto('/meta/detail-meta-id')

  const trigger = page.getByRole('button', { name: '编辑订阅' })
  await expect(trigger).toContainText('已订阅')
  await trigger.click()
  await expect(page.getByRole('menuitem', { name: '编辑' })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('menuitem', { name: '编辑' }).click()

  await expect(page).toHaveURL(
    '/subscription?year=2026&season=summer&edit=detail-meta-id',
  )
  await expect(page.getByLabel('包含正则')).toHaveValue('1080p')
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
  await page.goto('/meta')

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
  await page.goto('/meta')

  await page.getByRole('button', { name: '订阅' }).first().click()

  await expect(page.getByRole('menuitem', { name: '编辑' })).toHaveCount(0)
  await expect(page.getByRole('menuitem', { name: '删除' })).toHaveCount(0)
})

test('keeps two mobile cards within the viewport using the fixed gap', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/meta')
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
