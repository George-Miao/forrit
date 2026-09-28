import { expect, test, type Page } from '@playwright/test'

async function mockConfiguration(page: Page) {
  let revision = 1
  let value = 40
  const updates: unknown[] = []

  await page.route('**/api/config', async (route) => {
    const request = route.request()
    if (request.method() === 'PATCH') {
      const update = request.postDataJSON() as {
        changes: Array<{ op: string; path: string; value: number }>
      }
      updates.push(update)
      value = update.changes[0].value
      revision += 1
    }

    await route.fulfill({
      contentType: 'application/json',
      json: {
        fields: [
          {
            apply: 'immediate',
            locked: false,
            path: '/resolver/tmdb_rate_limit',
            secret: false,
            secret_set: false,
            source: 'ui',
            value,
          },
        ],
        revision,
        warnings: [],
      },
    })
  })

  return updates
}

async function mockSecretConfiguration(page: Page) {
  let revision = 1
  let source = 'file'
  const updates: unknown[] = []

  await page.route('**/api/config', async (route) => {
    const request = route.request()
    if (request.method() === 'PATCH') {
      const update = request.postDataJSON() as {
        changes: Array<{ op: 'set' | 'unset' }>
      }
      updates.push(update)
      source = update.changes[0].op === 'set' ? 'ui' : 'file'
      revision += 1
    }

    await route.fulfill({
      contentType: 'application/json',
      json: {
        fields: [
          {
            apply: 'immediate',
            locked: false,
            path: '/resolver/tmdb_api_key',
            secret: true,
            secret_set: true,
            source,
            value: null,
          },
        ],
        revision,
        warnings: [],
      },
    })
  })

  return updates
}

test('saves changed fields once after the debounce delay', async ({ page }) => {
  const updates = await mockConfiguration(page)
  await page.goto('/config')

  const input = page.getByRole('spinbutton', { name: 'TMDB 每秒请求数' })
  await input.focus()
  await page.keyboard.press('Tab')
  await page.waitForTimeout(600)
  expect(updates).toHaveLength(0)

  await input.fill('41')
  await input.fill('40')
  await page.waitForTimeout(600)
  expect(updates).toHaveLength(0)

  await input.fill('41')
  await input.fill('42')

  await expect.poll(() => updates).toHaveLength(1)
  expect(updates).toEqual([
    {
      changes: [
        { op: 'set', path: '/resolver/tmdb_rate_limit', value: 42 },
      ],
      revision: 1,
    },
  ])
})

test('replaces and clears a file-backed secret', async ({ page }) => {
  const updates = await mockSecretConfiguration(page)
  await page.goto('/config')

  const input = page.getByLabel('TMDB API 密钥')
  const clear = page.getByRole('button', { name: '清除' })
  await expect(input).toBeEnabled()
  await expect(clear).toBeDisabled()

  await input.fill('replacement')
  await page.getByRole('button', { name: '替换' }).click()
  await expect.poll(() => updates).toHaveLength(1)
  expect(updates[0]).toEqual({
    changes: [
      {
        op: 'set',
        path: '/resolver/tmdb_api_key',
        value: 'replacement',
      },
    ],
    revision: 1,
  })

  await expect(clear).toBeEnabled()
  await clear.click()
  await expect.poll(() => updates).toHaveLength(2)
  expect(updates[1]).toEqual({
    changes: [{ op: 'unset', path: '/resolver/tmdb_api_key' }],
    revision: 2,
  })
})
