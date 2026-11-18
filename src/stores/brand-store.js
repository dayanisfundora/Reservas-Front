import { defineStore } from 'pinia'
import { api } from 'boot/axios'
import { DEFAULT_BRAND, applyBrand, logoSrc, normalizePalette } from 'src/assets/js/util/theme'

const CACHE_KEY = 'reservas_brand'

function readCache() {
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
        return cached ? { ...DEFAULT_BRAND, ...cached, palette: normalizePalette(cached.palette) } : null
    } catch {
        return null
    }
}

function normalize(data) {
    return {
        name: data?.name || DEFAULT_BRAND.name,
        tagline: data?.tagline ?? '',
        logo_url: data?.logo_url || null,
        favicon_url: data?.favicon_url || null,
        theme_preset: data?.theme_preset || DEFAULT_BRAND.theme_preset,
        palette: normalizePalette(data?.palette),
    }
}

/**
 * Business identity shared by the layout, login and settings page.
 * Cached in localStorage so the theme is applied before the API answers.
 */
export const useBrandStore = defineStore('brand', {
    state: () => ({
        brand: readCache() || normalize(DEFAULT_BRAND),
        loaded: false,
    }),

    getters: {
        name: (state) => state.brand.name,
        tagline: (state) => state.brand.tagline,
        logoUrl: (state) => logoSrc(state.brand),
        palette: (state) => state.brand.palette,
    },

    actions: {
        apply() {
            applyBrand(this.brand)
        },

        setBrand(data) {
            this.brand = normalize(data)
            localStorage.setItem(CACHE_KEY, JSON.stringify(this.brand))
            this.apply()
        },

        async load() {
            try {
                const { data } = await api.get('/branding')
                this.setBrand(data)
                this.loaded = true
            } catch {
                this.apply()
            }
        },

        /** Applies a draft to the document without saving it (live preview). */
        preview(draft) {
            applyBrand({ ...this.brand, ...draft, palette: normalizePalette(draft?.palette ?? this.brand.palette) })
        },

        async save(formData) {
            const { data } = await api.post('/branding', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            this.setBrand(data.brand)
            return data
        },
    },
})
