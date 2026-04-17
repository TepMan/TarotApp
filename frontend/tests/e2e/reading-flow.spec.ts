import { expect, test } from '@playwright/test'
import { Buffer } from 'node:buffer'

async function mockApi(page: import('@playwright/test').Page) {
  await page.route('**/api/spreads', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 'three-card',
          name: '3-Karten Legung',
          description: 'Klassische Legung für Vergangenheit, Gegenwart und Tendenz.',
          positionCount: 3,
          tags: ['einsteiger'],
        },
      ]),
    })
  })

  await page.route('**/api/spreads/three-card', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'three-card',
        name: '3-Karten Legung',
        description: 'Klassische Legung für Vergangenheit, Gegenwart und Tendenz.',
        tags: ['einsteiger'],
        positions: [
          {
            index: 1,
            key: 'past',
            label: 'Vergangenheit',
            prompt: 'Welche Prägung wirkt noch nach?',
            layoutX: 0,
            layoutY: 0,
          },
          {
            index: 2,
            key: 'present',
            label: 'Gegenwart',
            prompt: 'Was ist jetzt wesentlich?',
            layoutX: 1,
            layoutY: 0,
          },
        ],
      }),
    })
  })

  await page.route('**/api/cards**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          name: 'Der Narr',
          suit: 'Große Arkana',
          number: '0',
          kernbotschaft: 'Neubeginn',
          psychologischAufrecht: 'Mut',
          psychologischUmgekehrt: 'Risiko',
          anwendungsfelder: {},
          archetyp: 'Suchender',
          imageFile: '00_Fool.jpg',
          imagePath: '/images/00_Fool.jpg',
        },
        {
          name: 'Der Magier',
          suit: 'Große Arkana',
          number: 'I',
          kernbotschaft: 'Wille',
          psychologischAufrecht: 'Klarheit',
          psychologischUmgekehrt: 'Manipulation',
          anwendungsfelder: {},
          archetyp: 'Meister',
          imageFile: '01_Magician.jpg',
          imagePath: '/images/01_Magician.jpg',
        },
      ]),
    })
  })

  await page.route('**/api/cards/*/interpretation**', async (route) => {
    const url = new URL(route.request().url())
    const orientation = url.searchParams.get('orientation') ?? 'upright'
    const cardName = decodeURIComponent(url.pathname.split('/').at(-2) ?? 'Der Narr')

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        name: cardName,
        suit: 'Große Arkana',
        number: cardName === 'Der Magier' ? 'I' : '0',
        orientation,
        kernbotschaft: cardName === 'Der Magier' ? 'Wille und Fokus' : 'Neubeginn und Offenheit',
        psychologie: orientation === 'reversed' ? 'Schattenseite' : 'Klarheit',
        anwendungsfelder: {},
        archetyp: cardName === 'Der Magier' ? 'Meister' : 'Suchender',
        imageFile: cardName === 'Der Magier' ? '01_Magician.jpg' : '00_Fool.jpg',
        imagePath: cardName === 'Der Magier' ? '/images/01_Magician.jpg' : '/images/00_Fool.jpg',
      }),
    })
  })

  await page.route('**/images/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/jpeg',
      body: Buffer.from([255, 216, 255, 217]),
    })
  })
}

test('happy path: spread laden, karte waehlen, interpretation anzeigen', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await expect(page.getByRole('heading', { name: "TepMan's Tarot App" })).toBeVisible()
  await expect(page.getByText(/Klassische Legung für Vergangenheit/i)).toBeVisible()

  const firstSearch = page.locator('.spread-position-tile').first().locator('.tile-search')
  await firstSearch.fill('Der Narr')
  await firstSearch.press('Enter')

  await expect(page.locator('.spread-position-tile').first()).toContainText('Gewählt: Der Narr')
  await expect(page.locator('.spread-position-tile').first()).toContainText('Kernbotschaft:')
})

test('duplikate werden verhindert', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  const tiles = page.locator('.spread-position-tile')
  const firstSearch = tiles.nth(0).locator('.tile-search')
  const secondSearch = tiles.nth(1).locator('.tile-search')

  await firstSearch.fill('Der Narr')
  await firstSearch.press('Enter')

  await secondSearch.fill('Der Narr')
  await secondSearch.press('Enter')

  await expect(tiles.nth(1)).toContainText('bereits in #1')
})

