import { expect, test, type Page } from '@playwright/test'

const meta = {
  _id: { $oid: 'subscription-meta-id' },
  begin: '2026-07-01T00:00:00Z',
  broadcast: null,
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
  title: '测试番剧',
  title_translate: { 'zh-Hans': ['测试番剧'] },
  tv: null,
  type: 'tv',
}

async function mockSubscriptions(
  page: Page,
  items: Record<string, unknown>[] = [meta],
) {
  await page.route('**/api/meta/subscription**', (route) =>
    route.fulfill({ contentType: 'application/json', json: items }),
  )
  await page.route('**/api/meta/*/group', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: [
        { count: 12, name: '测试字幕组' },
        { count: 3, name: '日本語字幕グループ' },
      ],
    }),
  )
}

test('pages subscriptions by season', async ({ page }) => {
  await mockSubscriptions(page)
  await page.goto('/subscription?year=2026&season=summer')

  await expect(page.locator('[data-season-year]')).toHaveText('2026年')
  await expect(page.getByRole('heading', { name: '夏季新番' })).toBeVisible()
  await expect(
    page.getByRole('heading', { exact: true, name: '订阅' }),
  ).toHaveCount(0)
  await expect(page.getByText('订阅', { exact: true })).toBeVisible()
  const count = page.getByText('共有 1 个订阅')
  await expect(count).toBeVisible()
  await expect
    .poll(() =>
      count.evaluate((element) =>
        element.parentElement
          ? getComputedStyle(element.parentElement).paddingTop
          : null,
      ),
    )
    .toBe('32px')
  await expect(
    page.getByRole('link', { name: '测试番剧', exact: true }),
  ).toBeVisible()

  await page.getByRole('button', { name: '下一季度' }).click()
  await expect(page).toHaveURL(/year=2026&season=fall/)
  await expect(page.locator('[data-season-year]')).toHaveText('2026年')
  await expect(page.getByRole('heading', { name: '秋季新番' })).toBeVisible()
})

test('edits a subscription inline', async ({ page }) => {
  await mockSubscriptions(page)
  let requestBody: unknown
  await page.route('**/api/meta/subscription-meta-id/subscription', async (route) => {
    requestBody = route.request().postDataJSON()
    await route.fulfill({
      contentType: 'application/json',
      json: { updated: true },
    })
  })
  await page.goto('/subscription?year=2026&season=summer')

  const editButton = page.getByRole('button', { name: '编辑 测试番剧' })
  await editButton.click()
  await expect(page).toHaveURL(
    '/subscription?year=2026&season=summer&edit=subscription-meta-id',
  )
  await editButton.click()
  await expect(page).toHaveURL('/subscription?year=2026&season=summer')
  await expect(page.getByLabel('包含正则')).toHaveCount(0)
  await editButton.click()
  await expect(page).toHaveURL(
    '/subscription?year=2026&season=summer&edit=subscription-meta-id',
  )
  await expect(
    page.getByRole('article').getByText('测试字幕组', { exact: true }),
  ).toHaveCount(2)
  const groupSelect = page.getByRole('button', { name: '选择字幕组' })
  await expect(groupSelect).toContainText('测试字幕组')
  await groupSelect.click()
  const chineseGroupName = page
    .getByRole('menuitemcheckbox', { name: /测试字幕组/ })
    .getByText('测试字幕组', { exact: true })
  await expect(chineseGroupName).toHaveCSS('font-family', /PingFang SC/)
  await expect(chineseGroupName).not.toHaveCSS(
    'font-family',
    /Forrit Japanese/,
  )
  const japaneseGroup = page.getByRole('menuitemcheckbox', {
    name: /日本語字幕グループ/,
  })
  await expect(japaneseGroup).not.toHaveAttribute('lang', 'ja')
  await expect(
    japaneseGroup.getByText('日本語字幕グループ', { exact: true }),
  ).toHaveCSS('font-family', /Forrit Japanese/)
  await japaneseGroup.click()
  await expect(page.getByRole('menu')).toBeVisible()
  await expect(groupSelect).toContainText('测试字幕组、日本語字幕グループ')
  await page.keyboard.press('Escape')
  await page.getByLabel('包含正则').fill('1080p|2160p')
  await page.getByRole('button', { name: '保存', exact: true }).click()

  await expect(page).toHaveURL('/subscription?year=2026&season=summer')
  await expect(page.getByText('包含 1080p|2160p')).toBeVisible()
  expect(requestBody).toMatchObject({
    groups: ['测试字幕组', '日本語字幕グループ'],
    include: '1080p|2160p',
  })
})

test('deletes a subscription after confirmation', async ({ page }) => {
  await mockSubscriptions(page)
  await page.route('**/api/meta/subscription-meta-id/subscription', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: { updated: true },
    }),
  )
  await page.goto('/subscription?year=2026&season=summer')

  await page.getByRole('button', { name: '删除 测试番剧' }).click()
  await expect(page.getByText('确认删除这个订阅？')).toBeVisible()
  await expect(page.getByText('测试字幕组', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '确认删除' }).click()

  await expect(page.getByText('这个季度还没有订阅')).toBeVisible()
})

test('rejects an empty subscription before sending it', async ({ page }) => {
  await mockSubscriptions(page, [
    {
      ...meta,
      subscription: {
        directory: null,
        exclude: null,
        groups: [],
        include: null,
        max_size: null,
        min_size: null,
      },
    },
  ])
  let writes = 0
  await page.route('**/api/meta/subscription-meta-id/subscription', (route) => {
    writes += 1
    return route.fulfill({
      contentType: 'application/json',
      json: { updated: true },
    })
  })
  await page.goto('/subscription?year=2026&season=summer')

  await page.getByRole('button', { name: '编辑 测试番剧' }).click()
  await page.getByRole('button', { name: '保存', exact: true }).click()

  await expect(page.getByRole('alert')).toHaveText(
    '请至少选择一个字幕组，或填写一项筛选设置。',
  )
  expect(writes).toBe(0)
})

test('shows only the API error brief in a notification', async ({ page }) => {
  await mockSubscriptions(page)
  let writes = 0
  await page.route('**/api/meta/subscription-meta-id/subscription', (route) => {
    writes += 1
    return route.fulfill({
      contentType: 'application/json',
      json: {
        error: {
          brief:
            'Invalid request: invalid exclude regex: regex parse error:\n    *\n    ^\nerror: repetition operator missing expression',
          cause: 'verbose Rust debug cause',
          code: 400,
          name: 'Bad Request',
        },
      },
      status: 400,
    })
  })
  await page.goto('/subscription?year=2026&season=summer')

  await page.getByRole('button', { name: '编辑 测试番剧' }).click()
  await page.getByRole('button', { name: '保存', exact: true }).click()

  await expect.poll(() => writes).toBe(1)
  const toastTitle = page.getByText('保存订阅失败', { exact: true }).first()
  await expect(toastTitle).toBeVisible()
  const toast = toastTitle.locator('..')
  await expect(toast).toContainText(
    'Invalid request: invalid exclude regex: regex parse error:',
  )
  await expect(toast).not.toContainText('verbose Rust debug cause')
})

test('shows a useful empty state', async ({ page }) => {
  await mockSubscriptions(page, [])
  await page.goto('/subscription?year=2026&season=summer')

  await expect(page.getByText('这个季度还没有订阅')).toBeVisible()
  await expect(page.getByRole('link', { name: '浏览番剧' })).toHaveAttribute(
    'href',
    '/',
  )
})
