import { expect, test } from '@playwright/test'

test('renders subscriptions without browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/subscription')

  await expect(page.getByRole('heading', { name: '订阅' })).toBeVisible()
  await expect(page.getByRole('button', { name: '添加订阅' })).toBeVisible()
  expect(errors).toEqual([])
})
