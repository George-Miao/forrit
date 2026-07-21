import { expect, test } from '@playwright/test'

const pages = [
  { path: '/', title: 'Forrit' },
  { path: '/entry', title: '更新 | Forrit' },
  { path: '/entry/title-test', title: '资源详情 | Forrit' },
  { path: '/meta', title: '番剧 | Forrit' },
  { path: '/meta/title-test', title: '番剧详情 | Forrit' },
  { path: '/subscription', title: '订阅 | Forrit' },
  { path: '/download', title: '下载 | Forrit' },
]

for (const pageInfo of pages) {
  test(`${pageInfo.path} sets its page title`, async ({ page }) => {
    await page.goto(pageInfo.path)
    await expect(page).toHaveTitle(pageInfo.title)
  })
}
