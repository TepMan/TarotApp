export type Orientation = 'upright' | 'reversed'

export type ApiError = {
  status: number
  error: string
  message: string
  path: string
}

export type Card = {
  name: string
  suit: string
  number: string
  kernbotschaft: string
  psychologischAufrecht: string
  psychologischUmgekehrt: string
  anwendungsfelder: Record<string, string>
  archetyp: string
  imageFile: string
  imagePath: string
}

export type InterpretationResponse = {
  name: string
  suit: string
  number: string
  orientation: Orientation
  kernbotschaft: string
  psychologie: string
  anwendungsfelder: Record<string, string>
  archetyp: string
  imageFile: string
  imagePath: string
}

export type SpreadPosition = {
  index: number
  key: string
  label: string
  prompt: string
  layoutX: number
  layoutY: number
}

export type Spread = {
  id: string
  name: string
  description: string
  tags: string[]
  positions: SpreadPosition[]
}

export type SpreadSummary = {
  id: string
  name: string
  description: string
  positionCount: number
  tags: string[]
}

export type CardFilter = {
  suit?: string
  search?: string
  number?: string
}

