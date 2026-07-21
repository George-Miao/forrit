import { expect, test, type Page } from '@playwright/test'

type EntryList = {
  items: Array<{
    _id: { $oid: string }
    description?: string | null
    elements: Record<string, unknown>
    group?: string | null
    meta_id?: { $oid: string } | null
    meta_title?: string | null
    mime_type: string
    sourcer: string
    title: string
  }>
}

async function openEntry(page: Page) {
  const response = await page.request.get('/api/entry')
  expect(response.ok()).toBe(true)
  const list = (await response.json()) as EntryList
  const entry = list.items.find((item) => item.meta_id) ?? list.items[0]
  expect(entry).toBeTruthy()
  await page.goto(`/entry/${entry._id.$oid}`)
  return entry
}

test('links the bangumi title and renders sanitized entry HTML', async ({
  page,
}) => {
  await page.route('**/api/entry/entry-with-meta', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      json: {
        _id: { $oid: 'entry-with-meta' },
        description:
          '<p>本集由 <strong>测试字幕组</strong> 发布。</p><script>window.__unsafe = true</script>',
        elements: {
          AnimeSeason: '02',
          AnimeTitle: '测试番剧',
          EpisodeNumber: '03',
          FileName: 'test.mkv',
          AudioTerm: 'AAC',
          VideoResolution: '1080P',
          VideoTerm: 'HEVC',
        },
        group: '测试字幕组',
        guid: 'test-guid',
        link: 'https://example.com/release',
        meta_id: { $oid: 'bangumi-meta-id' },
        meta_title: '测试番剧',
        mime_type: 'application/x-bittorrent',
        pub_date: null,
        size: 1024,
        sourcer: 'test-feed',
        title: '测试番剧 - 03',
        torrent: 'https://example.com/test.torrent',
      },
    })
  })

  await page.goto('/entry/entry-with-meta')

  await expect(page.locator('h1 a')).toHaveAttribute(
    'href',
    '/meta/bangumi-meta-id',
  )
  await expect(page.locator('h1')).toHaveText('测试番剧 S02E03')
  await expect(page.locator('[data-entry-tags]')).toContainText('测试字幕组')
  await expect(page.locator('[data-entry-tags]')).toContainText('test-feed')
  await expect(page.locator('[data-entry-tags]')).toContainText('音频 AAC')
  await expect(page.locator('[data-entry-tags]')).toContainText('视频 HEVC')
  await expect(page.locator('[data-entry-tags]')).toContainText('1080P')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('1.0 KiB')
  await expect(page.locator('[data-entry-file]')).toContainText('大小')
  await expect(page.locator('[data-entry-file]')).toContainText('1.0 KiB')
  await expect(
    page.locator('[data-entry-tags]').getByRole('link', { name: 'test-feed' }),
  ).toHaveAttribute('href', 'https://example.com/release')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('来源')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('大小')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('分辨率')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('S02')
  await expect(page.locator('[data-entry-tags]')).not.toContainText('E03')
  await expect(page.locator('.entry-body strong')).toHaveText('测试字幕组')
  await expect(page.locator('.entry-body script')).toHaveCount(0)
  await expect(
    page.locator('[data-entry-file] dt').getByText('正文', { exact: true }),
  ).toHaveCount(0)
  expect(
    await page.locator('[data-entry-body]').evaluate(
      (body) => body.parentElement?.lastElementChild === body,
    ),
  ).toBe(true)
  expect(await page.evaluate(() => '__unsafe' in window)).toBe(false)
})

test('presents entry details in a compact card layout', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  const entry = await openEntry(page)
  const bangumiTitle = String(
    entry.meta_title ?? entry.elements.AnimeTitle ?? '资源详情',
  )
  const releaseCode = `${
    entry.elements.AnimeSeason ? `S${String(entry.elements.AnimeSeason)}` : ''
  }${
    entry.elements.EpisodeNumber
      ? `E${String(entry.elements.EpisodeNumber)}`
      : ''
  }`

  await expect(page.locator('h1')).toHaveText(
    `${bangumiTitle}${releaseCode ? ` ${releaseCode}` : ''}`,
  )
  if (entry.meta_id) {
    await expect(page.locator('h1 a')).toHaveAttribute(
      'href',
      `/meta/${entry.meta_id.$oid}`,
    )
  }
  const tags = page.locator('[data-entry-tags]')
  if (entry.group) await expect(tags).toContainText(entry.group)
  if (releaseCode && entry.group) {
    await expect(tags).not.toContainText(releaseCode)
  }
  await expect(
    page.locator('[data-entry-file]').getByText(entry.title, { exact: true }).first(),
  ).toBeVisible()
  const torrentMime = page.getByText('application/x-bittorrent', {
    exact: true,
  })
  await expect(torrentMime).toHaveClass(/font-mono/)
  await expect(page.getByRole('heading', { name: '资源信息' })).toBeVisible()
  await expect(page.getByText(entry.mime_type, { exact: true })).toBeVisible()
  await expect(page.getByText(entry.sourcer, { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '下载' })).toBeVisible()
  await expect(page.getByRole('button', { name: '复制链接' })).toBeVisible()
  if (entry.description) {
    await expect(page.getByText(entry.description, { exact: true })).toBeVisible()
  }

  const mainLocator = page.locator('[data-entry-main]')
  const main = await mainLocator.boundingBox()
  const title = await page.locator('h1').boundingBox()
  const titleSection = await page.locator('[data-entry-title]').boundingBox()
  await expect(page.locator('[data-entry-title]')).toHaveCSS(
    'margin-top',
    '64px',
  )
  expect(main).not.toBeNull()
  expect(title).not.toBeNull()
  expect(titleSection).not.toBeNull()
  const downloadButton = await page
    .getByRole('button', { name: '下载' })
    .boundingBox()
  expect(downloadButton).not.toBeNull()
  expect((downloadButton?.y ?? 0) + (downloadButton?.height ?? 0)).toBeLessThan(
    main?.y ?? 0,
  )
  expect(Math.abs((main?.x ?? 0) - (title?.x ?? 0))).toBeLessThanOrEqual(1)
  const titleToContentGap =
    (main?.y ?? 0) -
    (titleSection?.y ?? 0) -
    (titleSection?.height ?? 0)
  expect(titleToContentGap).toBeGreaterThanOrEqual(32)
  expect(titleToContentGap).toBeLessThanOrEqual(64)
  expect(await mainLocator.locator(':scope > section').count()).toBe(1)
  const firstCard = page.locator('[data-entry-file]')
  await expect(firstCard).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(firstCard).toHaveCSS('border-top-left-radius', '6px')
  await expect(firstCard).not.toHaveCSS('box-shadow', 'none')
  await expect(page.getByRole('heading', { name: '解析属性' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('keeps entry details and actions within the mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openEntry(page)

  const layout = await page.locator('[data-entry-layout]').evaluate((element) => {
    const main = element.querySelector('[data-entry-main]')
    if (!(main instanceof HTMLElement)) {
      return null
    }
    return {
      overflows: document.documentElement.scrollWidth > window.innerWidth,
    }
  })

  expect(layout).toEqual({ overflows: false })
  await expect(page.getByRole('button', { name: '下载' })).toBeVisible()
  await expect(page.getByRole('button', { name: '复制链接' })).toBeVisible()
})
