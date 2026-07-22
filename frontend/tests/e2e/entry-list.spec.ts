import { expect, test } from '@playwright/test'

test('shows parsed titles and a warning for unmatched entries', async ({
  page,
}) => {
  await page.route('**/api/entry**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      json: {
        items: [
          {
            _id: { $oid: 'unmatched-entry' },
            description: null,
            elements: {
              AnimeTitle: '解析后的番剧标题',
              EpisodeNumber: '07',
            },
            group: '测试字幕组',
            guid: 'unmatched-entry-guid',
            info_hash: 'unmatched-entry-hash',
            link: null,
            meta_id: null,
            meta_title: null,
            mime_type: 'application/x-bittorrent',
            pub_date: null,
            size: 1024,
            sourcer: 'test-feed',
            title: '[测试字幕组] 原始发布标题',
            torrent: 'https://example.com/unmatched-entry.torrent',
            torrent_name: 'unmatched-entry.torrent',
          },
        ],
        page_info: {
          end_cursor: null,
          has_next_page: false,
          has_previous_page: false,
          start_cursor: null,
        },
      },
    }),
  )

  await page.goto('/entry')

  const parsedTitle = page.getByText('解析后的番剧标题', { exact: true })
  await expect(parsedTitle).toBeVisible()
  await expect(parsedTitle).toHaveClass(/text-muted/)
  await expect(page.getByRole('article')).toContainText('第07集')

  const warning = page.getByLabel('未匹配条目')
  await expect(warning).toBeVisible()
  await warning.hover()
  await expect(page.getByText('此条目未匹配到番剧')).toBeVisible()
})
