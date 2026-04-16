export type Division = "D3/D4" | "D4/D5" | "D5/D4" | "D6"

export type PlayerPointsInput = {
  teamEventPoints: number
  division: Division
  eventSeason: number
  currentSeason: number
  playerCurrentAge: number
  numberOfTeams: number
}

function assertFiniteNumber(value: number, fieldName: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`Valor inválido para ${fieldName}`)
  }
}

function getDivisionMultiplier(division: Division) {
  const divisionMap: Record<Division, number> = {
    "D3/D4": 2,
    "D4/D5": 1,
    "D5/D4": 1,
    D6: 0.5,
  }

  const multiplier = divisionMap[division]
  if (!multiplier) throw new Error("División inválida")

  return multiplier
}

function getSeasonMultiplier(seasonsAgo: number) {
  if (seasonsAgo <= 2) return 1
  if (seasonsAgo === 3) return 0.7
  if (seasonsAgo === 4) return 0.5
  if (seasonsAgo === 5) return 0.35
  return 0.25
}

function getTeamsMultiplier(numberOfTeams: number) {
  if (numberOfTeams >= 10) return 1
  if (numberOfTeams === 9) return 0.95
  if (numberOfTeams === 8) return 0.9
  if (numberOfTeams === 7) return 0.85
  if (numberOfTeams === 6) return 0.8
  if (numberOfTeams === 5) return 0.75
  if (numberOfTeams === 4) return 0.7
  if (numberOfTeams === 3) return 0.65
  if (numberOfTeams === 2) return 0.6

  return 0.6
}

function getAgeMultiplier(seasonsAgo: number, playerCurrentAge: number) {
  if (seasonsAgo <= 2) return 1
  if (playerCurrentAge <= 40) return 1
  if (playerCurrentAge === 41) return 0.95
  if (playerCurrentAge === 42) return 0.9
  if (playerCurrentAge === 43) return 0.85
  if (playerCurrentAge === 44) return 0.8
  if (playerCurrentAge === 45) return 0.75
  if (playerCurrentAge === 46) return 0.7
  if (playerCurrentAge === 47) return 0.65
  if (playerCurrentAge === 48) return 0.6
  if (playerCurrentAge === 49) return 0.55

  return 0.5
}

function roundTo2Decimals(value: number) {
  return Math.round(value * 100) / 100
}

export function calculatePlayerPoints(input: PlayerPointsInput) {
  const {
    teamEventPoints,
    division,
    eventSeason,
    currentSeason,
    playerCurrentAge,
    numberOfTeams,
  } = input

  assertFiniteNumber(teamEventPoints, "teamEventPoints")
  assertFiniteNumber(eventSeason, "eventSeason")
  assertFiniteNumber(currentSeason, "currentSeason")
  assertFiniteNumber(playerCurrentAge, "playerCurrentAge")
  assertFiniteNumber(numberOfTeams, "numberOfTeams")

  if (teamEventPoints < 0) throw new Error("teamEventPoints debe ser >= 0")
  if (eventSeason < 0 || currentSeason < 0) throw new Error("Las temporadas deben ser >= 0")
  if (!Number.isInteger(eventSeason) || !Number.isInteger(currentSeason)) {
    throw new Error("eventSeason y currentSeason deben ser enteros")
  }

  if (playerCurrentAge < 0) throw new Error("playerCurrentAge debe ser >= 0")
  if (numberOfTeams < 2) throw new Error("numberOfTeams debe ser >= 2")

  const seasonsAgo = currentSeason - eventSeason
  if (seasonsAgo < 0) throw new Error("eventSeason no puede ser mayor que currentSeason")

  const finalPlayerPoints =
    teamEventPoints *
    getDivisionMultiplier(division) *
    getSeasonMultiplier(seasonsAgo) *
    getTeamsMultiplier(numberOfTeams) *
    getAgeMultiplier(seasonsAgo, playerCurrentAge)

  return roundTo2Decimals(finalPlayerPoints)
}

export function parseDivisionFromCategory(category: string): Division | null {
  if (category.includes("D3/D4")) return "D3/D4"
  if (category.includes("D4/D5")) return "D4/D5"
  if (category.includes("D5/D4")) return "D5/D4"
  if (category.includes("D6")) return "D6"
  return null
}
