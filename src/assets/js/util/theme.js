import { setCssVar } from 'quasar'

/**
 * Business identity (name, logo, palette) applied at runtime through CSS variables.
 * Keys must match BusinessSetting::DEFAULT_PALETTE on the backend.
 */

export const DEFAULT_LOGO = '/brand/default-logo.svg'
export const DEFAULT_PRESET = 'vino'

/** Software developer brand; fixed, not part of the client-configurable identity. */
export const DEVELOPER_NAME = 'Double Team'

export const PALETTE_GROUPS = [
    {
        label: 'Color principal',
        hint: 'Cabecera, botones principales y títulos.',
        keys: [
            { key: 'wine', label: 'Principal' },
            { key: 'wine-deep', label: 'Principal oscuro' },
            { key: 'wine-light', label: 'Principal claro' },
        ],
    },
    {
        label: 'Acentos',
        hint: 'Bordes, ornamentos, íconos destacados y precios.',
        keys: [
            { key: 'gold', label: 'Acento' },
            { key: 'gold-light', label: 'Acento claro' },
            { key: 'gold-pale', label: 'Acento pálido' },
        ],
    },
    {
        label: 'Barra lateral y fondos de marca',
        hint: 'Fondo del menú lateral y del login.',
        keys: [
            { key: 'ink', label: 'Tinta' },
            { key: 'ink-2', label: 'Tinta secundaria' },
        ],
    },
    {
        label: 'Superficies',
        hint: 'Fondos de página en modo claro y oscuro.',
        keys: [
            { key: 'ivory', label: 'Fondo claro' },
            { key: 'ivory-2', label: 'Fondo claro 2' },
            { key: 'dark', label: 'Superficie oscura' },
            { key: 'dark-page', label: 'Fondo oscuro' },
        ],
    },
]

export const PALETTE_KEYS = PALETTE_GROUPS.flatMap((g) => g.keys.map((k) => k.key))

export const PRESETS = [
    {
        id: 'vino',
        name: 'Rojo vino',
        palette: {
            'wine-deep': '#4a111b', wine: '#7a1f2b', 'wine-light': '#8e2a36',
            ink: '#2a1418', 'ink-2': '#3b1a20',
            gold: '#b8893b', 'gold-light': '#d4af6a', 'gold-pale': '#efe0bf',
            ivory: '#faf6f0', 'ivory-2': '#f3ece1', dark: '#241a1c', 'dark-page': '#1a1214',
        },
    },
    {
        id: 'azul',
        name: 'Azul Atlántico',
        palette: {
            'wine-deep': '#0f2747', wine: '#1d4e89', 'wine-light': '#2a65a8',
            ink: '#0e1a2b', 'ink-2': '#16263d',
            gold: '#c08a3e', 'gold-light': '#e0b46c', 'gold-pale': '#f3e3c3',
            ivory: '#f6f8fb', 'ivory-2': '#e9eef5', dark: '#18202b', 'dark-page': '#10161e',
        },
    },
    {
        id: 'verde',
        name: 'Verde Bosque',
        palette: {
            'wine-deep': '#13362a', wine: '#1f5c45', 'wine-light': '#2b7559',
            ink: '#10231c', 'ink-2': '#183329',
            gold: '#b8893b', 'gold-light': '#d8b86e', 'gold-pale': '#f0e4c4',
            ivory: '#f7f8f3', 'ivory-2': '#ecefe4', dark: '#19221e', 'dark-page': '#111815',
        },
    },
    {
        id: 'grafito',
        name: 'Grafito y Cobre',
        palette: {
            'wine-deep': '#1f2328', wine: '#3a4049', 'wine-light': '#4d5560',
            ink: '#16191d', 'ink-2': '#22262c',
            gold: '#b26a3c', 'gold-light': '#d08b5b', 'gold-pale': '#f1dccb',
            ivory: '#f7f7f6', 'ivory-2': '#ececea', dark: '#1e2125', 'dark-page': '#141619',
        },
    },
    {
        id: 'turquesa',
        name: 'Turquesa Caribe',
        palette: {
            'wine-deep': '#064a4d', wine: '#0b7076', 'wine-light': '#12888f',
            ink: '#062a2c', 'ink-2': '#0b3a3d',
            gold: '#d9774c', 'gold-light': '#f2a07b', 'gold-pale': '#fbe3d6',
            ivory: '#f5faf9', 'ivory-2': '#e6f2f1', dark: '#142123', 'dark-page': '#0d1718',
        },
    },
    {
        id: 'carmin',
        name: 'Carmín',
        palette: {
            'wine-deep': '#6b1219', wine: '#a21c2c', 'wine-light': '#c4392a',
            ink: '#2c1214', 'ink-2': '#3d181b',
            gold: '#c9a227', 'gold-light': '#e0c04a', 'gold-pale': '#f5ebc4',
            ivory: '#faf7f4', 'ivory-2': '#f1ebe4', dark: '#261618', 'dark-page': '#1a1011',
        },
    },
    {
        id: 'marino',
        name: 'Azul Marino',
        palette: {
            'wine-deep': '#0a1628', wine: '#152a4a', 'wine-light': '#243f6b',
            ink: '#0b1220', 'ink-2': '#141e30',
            gold: '#a8b0bc', 'gold-light': '#c8cdd6', 'gold-pale': '#e8ebf0',
            ivory: '#f4f6f9', 'ivory-2': '#e6eaf0', dark: '#121925', 'dark-page': '#0b1018',
        },
    },
    {
        id: 'oliva',
        name: 'Oliva',
        palette: {
            'wine-deep': '#3a3f1f', wine: '#5c6432', 'wine-light': '#737c3f',
            ink: '#242818', 'ink-2': '#32361f',
            gold: '#c4a35a', 'gold-light': '#dbc07a', 'gold-pale': '#f2e6c4',
            ivory: '#f7f6ef', 'ivory-2': '#eceade', dark: '#22251a', 'dark-page': '#161910',
        },
    },
    {
        id: 'cacao',
        name: 'Cacao',
        palette: {
            'wine-deep': '#3b2418', wine: '#6b3e28', 'wine-light': '#855033',
            ink: '#241610', 'ink-2': '#342018',
            gold: '#d4a574', 'gold-light': '#e6c49a', 'gold-pale': '#f6e8d6',
            ivory: '#faf6f1', 'ivory-2': '#f0e8df', dark: '#2a1c14', 'dark-page': '#1c120c',
        },
    },
    {
        id: 'esmeralda',
        name: 'Esmeralda',
        palette: {
            'wine-deep': '#0d3d32', wine: '#157a5f', 'wine-light': '#1d9674',
            ink: '#0c241e', 'ink-2': '#12352c',
            gold: '#e0b04a', 'gold-light': '#efc86a', 'gold-pale': '#f8e9c0',
            ivory: '#f3faf7', 'ivory-2': '#e2f1ea', dark: '#14241f', 'dark-page': '#0d1814',
        },
    },
    {
        id: 'rosa',
        name: 'Rosa antiguo',
        palette: {
            'wine-deep': '#5c2a3a', wine: '#8e4558', 'wine-light': '#a85a6e',
            ink: '#2a161c', 'ink-2': '#3b2028',
            gold: '#c9a66b', 'gold-light': '#dfc08a', 'gold-pale': '#f3e6cc',
            ivory: '#faf6f7', 'ivory-2': '#f1e8ea', dark: '#24181c', 'dark-page': '#171014',
        },
    },
    {
        id: 'mostaza',
        name: 'Mostaza',
        palette: {
            'wine-deep': '#6b4e12', wine: '#9a7018', 'wine-light': '#b8861f',
            ink: '#2a220e', 'ink-2': '#3a2f14',
            gold: '#5c4030', 'gold-light': '#8a6550', 'gold-pale': '#e8d5c4',
            ivory: '#faf8f0', 'ivory-2': '#f0ead8', dark: '#241e12', 'dark-page': '#18140c',
        },
    },
    {
        id: 'hielo',
        name: 'Hielo',
        palette: {
            'wine-deep': '#2a3a48', wine: '#4a6274', 'wine-light': '#5f7a8f',
            ink: '#1a242c', 'ink-2': '#26323c',
            gold: '#7a9eb0', 'gold-light': '#a0c0d0', 'gold-pale': '#dceaf0',
            ivory: '#f5f8fa', 'ivory-2': '#e6eef2', dark: '#1c262e', 'dark-page': '#12181e',
        },
    },
    {
        id: 'ciruela',
        name: 'Ciruela',
        palette: {
            'wine-deep': '#3d1a32', wine: '#6b2d55', 'wine-light': '#843a69',
            ink: '#22101c', 'ink-2': '#321828',
            gold: '#c9a36a', 'gold-light': '#dfbf88', 'gold-pale': '#f3e6cc',
            ivory: '#faf5f8', 'ivory-2': '#f0e6ec', dark: '#22151e', 'dark-page': '#160e14',
        },
    },
]

export const DEFAULT_PALETTE = { ...PRESETS[0].palette }

export const DEFAULT_BRAND = {
    name: 'Reservas',
    tagline: 'Gestión de hospedaje',
    logo_url: null,
    favicon_url: null,
    theme_preset: DEFAULT_PRESET,
    palette: { ...DEFAULT_PALETTE },
}

export function isHex(value) {
    return /^#[0-9a-f]{6}$/i.test(String(value || ''))
}

export function normalizePalette(palette) {
    const result = { ...DEFAULT_PALETTE }
    PALETTE_KEYS.forEach((key) => {
        if (isHex(palette?.[key])) result[key] = palette[key].toLowerCase()
    })
    return result
}

export function presetMatching(palette) {
    const normalized = normalizePalette(palette)
    return PRESETS.find((p) => PALETTE_KEYS.every((k) => p.palette[k] === normalized[k]))?.id || 'custom'
}

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function withAlpha(hex, alpha) {
    return `rgba(${hexToRgb(hex).join(',')},${alpha})`
}

function rgbToHex([r, g, b]) {
    return '#' + [r, g, b].map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0')).join('')
}

/** Mixes `hex` toward `target` by `amount` (0 = hex, 1 = target). */
export function mix(hex, target, amount) {
    const a = hexToRgb(hex)
    const b = hexToRgb(target)
    return rgbToHex(a.map((c, i) => c + (b[i] - c) * amount))
}

function rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const l = (max + min) / 2
    if (max === min) return [0, 0, l]
    const d = max - min
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    let h
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    return [h / 6, s, l]
}

function hslToRgb([h, s, l]) {
    if (s === 0) return [l * 255, l * 255, l * 255]
    const hue = (p, q, t) => {
        if (t < 0) t += 1
        if (t > 1) t -= 1
        if (t < 1 / 6) return p + (q - p) * 6 * t
        if (t < 1 / 2) return q
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
        return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    return [hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)].map((c) => c * 255)
}

/** Readable tint of the primary color for text on dark surfaces. */
function onDarkTint(hex) {
    const [h, s] = rgbToHsl(hexToRgb(hex))
    return rgbToHex(hslToRgb([h, Math.min(s, 0.65), 0.78]))
}

/** Colors derived from the palette that are not edited directly. */
export function derivedColors(palette) {
    return {
        'gold-bright': mix(palette['gold-light'], palette['gold-pale'], 0.45),
        'wine-on-dark': onDarkTint(palette.wine),
        'header-dark-1': mix(palette['wine-deep'], '#000000', 0.42),
        'header-dark-3': mix(palette['wine-deep'], palette['wine-light'], 0.35),
    }
}

export function logoSrc(brand) {
    return brand?.logo_url || DEFAULT_LOGO
}

let originalFavicons = null

function applyFavicon(url) {
    const links = Array.from(document.querySelectorAll('link[rel~="icon"]'))
    if (!originalFavicons) originalFavicons = links.map((l) => ({ el: l, href: l.getAttribute('href'), type: l.getAttribute('type') }))
    originalFavicons.forEach(({ el, href, type }) => {
        el.setAttribute('href', url || href)
        if (url) el.removeAttribute('type')
        else if (type) el.setAttribute('type', type)
    })
}

/** Applies name, palette and favicon to the running document. */
export function applyBrand(brand) {
    if (typeof document === 'undefined') return
    const palette = normalizePalette(brand?.palette)
    const root = document.documentElement
    const colors = { ...palette, ...derivedColors(palette) }

    Object.entries(colors).forEach(([key, hex]) => {
        root.style.setProperty(`--theme-${key}`, hex)
        root.style.setProperty(`--theme-${key}-rgb`, hexToRgb(hex).join(', '))
    })
    root.style.setProperty('--app-wine-on-dark', colors['wine-on-dark'])
    root.style.setProperty('--app-wine-on-dark-rgb', hexToRgb(colors['wine-on-dark']).join(', '))

    setCssVar('primary', palette.wine)
    setCssVar('secondary', palette.gold)
    setCssVar('accent', palette['gold-light'])
    setCssVar('dark', palette.dark)
    setCssVar('dark-page', palette['dark-page'])

    const name = String(brand?.name || DEFAULT_BRAND.name).trim()
    document.title = `${name} - Reservas`
    applyFavicon(brand?.favicon_url || null)
}
