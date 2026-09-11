const baseCategories = [
        {
            name: "5v5 D3/D4",
            marker: "M700",
            time: "8 minutos",
            format: "Race-To-3",
            prices: { before: 700, after: 800 },
            prizes: { first: 1000, second: 700, third: 350 },
        },
        {
            name: "3v3 D4/D5",
            marker: "M500",
            time: "5 minutos",
            format: "Race-To-3",
            prices: { before: 350, after: 450 },
            prizes: { first: 500, second: 350, third: 175 },
        },
        {
            name: "3v3 D6",
            marker: "M500",
            time: "5 minutos",
            format: "Race-To-2",
            prices: { before: 300, after: 400 },
            prizes: { first: 400, second: 200, third: 150 },
        },
        {
            name: "3v3 Open",
            marker: "M500",
            time: "5 minutos",
            format: "Race-To-3",
            prices: { before: 150, after: 150 },
            prizes: { first: 250, second: 150, third: null },
        },
    ]

export type FechaPageConfig = {
    titulo: string
    dias: string
    eventId: string
    registrationPath: string
    layoutDate: string
    registrationPeriod: string
    rosterDeadline: string
    priceDeadline: string
    hasOpenCategory: boolean
    categories: typeof baseCategories
}

export const fecha1Config: FechaPageConfig = {
    titulo: "Fecha 1",
    dias: "3 y 4 de abril",
    eventId: "axl-2026-fecha-1",
    registrationPath: "/player/fechas/fecha-1/inscribirme",
    layoutDate: "20 de marzo",
    registrationPeriod: "Las inscripciones se encuentran abiertas a partir del 1 de febrero.",
    rosterDeadline: "Los roster deben estar completos antes del 20 de marzo",
    priceDeadline: "3 de marzo",
    hasOpenCategory: false,
    categories: baseCategories.slice(0, 3),
}

export const fecha2Config: FechaPageConfig = {
    titulo: "Fecha 2",
    dias: "15 y 16 de agosto",
    eventId: "axl-2026-fecha-2",
    registrationPath: "/player/fechas/fecha-2/inscribirme",
    layoutDate: "31 de julio",
    registrationPeriod: "Las inscripciones se encuentran abiertas del 15 de junio al 1 de agosto.",
    rosterDeadline: "Los roster deben estar completos antes del 1 de agosto",
    priceDeadline: "15 de julio",
    hasOpenCategory: true,
    categories: baseCategories,
}

// Mantiene las condiciones comerciales de la segunda fecha.
export const fecha3Config: FechaPageConfig = {
    ...fecha2Config,
    titulo: "Fecha 3",
    dias: "21 y 22 de noviembre",
    eventId: "axl-2026-fecha-3",
    registrationPath: "/player/fechas/fecha-3/inscribirme",
    layoutDate: "7 de noviembre",
    registrationPeriod: "Las inscripciones se encuentran abiertas del 6 de septiembre al 7 de noviembre.",
    rosterDeadline: "Los roster deben estar completos hasta el 7 de noviembre inclusive.",
    priceDeadline: "7 de octubre",
}

export const seasonEvents = [fecha1Config, fecha2Config, fecha3Config]
export const currentEvent = fecha3Config
