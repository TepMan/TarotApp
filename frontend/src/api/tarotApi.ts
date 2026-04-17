import type {
  ApiError,
  Card,
  CardFilter,
  InterpretationResponse,
  Orientation,
  Spread,
  SpreadSummary,
} from '../types/tarot'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

function toQueryString(params: Record<string, string | undefined>): string {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    const cleaned = value?.trim()
    if (cleaned) {
      query.set(key, cleaned)
    }
  }

  const queryString = query.toString()
  return queryString ? `?${queryString}` : ''
}

async function parseApiError(response: Response): Promise<Error> {
  try {
    const body = (await response.json()) as Partial<ApiError>
    const message = body.message || `HTTP ${response.status}`
    return new Error(message)
  } catch {
    return new Error(`HTTP ${response.status}`)
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw await parseApiError(response)
  }

  return (await response.json()) as T
}

export async function getSpreads(): Promise<SpreadSummary[]> {
  return fetchJson<SpreadSummary[]>('/api/spreads')
}

export async function getSpreadById(id: string): Promise<Spread> {
  return fetchJson<Spread>(`/api/spreads/${encodeURIComponent(id)}`)
}

export async function getCards(filter: CardFilter = {}): Promise<Card[]> {
  const query = toQueryString({
    suit: filter.suit,
    search: filter.search,
    number: filter.number,
  })

  return fetchJson<Card[]>(`/api/cards${query}`)
}

export async function getInterpretation(
  cardName: string,
  orientation: Orientation = 'upright',
): Promise<InterpretationResponse> {
  const query = toQueryString({ orientation })
  const encodedName = encodeURIComponent(cardName)
  return fetchJson<InterpretationResponse>(`/api/cards/${encodedName}/interpretation${query}`)
}

