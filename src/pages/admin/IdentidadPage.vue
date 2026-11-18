<template>
    <q-page class="q-pa-md identidad-page">
        <div class="row items-start justify-between q-mb-md q-col-gutter-sm">
            <div>
                <div class="text-overline text-primary">Apariencia</div>
                <div class="text-h5 text-weight-bold page-title">Identidad del negocio</div>
                <div class="text-caption text-grey-7">Nombre, logo y colores de toda la aplicación.</div>
            </div>
            <div class="row q-gutter-sm">
                <q-btn flat no-caps icon="undo" label="Descartar cambios" :disable="!dirty || saving" @click="discard" />
                <q-btn unelevated no-caps color="primary" icon="save" label="Guardar" :loading="saving" :disable="!dirty || !form.name.trim()" @click="save" />
            </div>
        </div>

        <div class="row q-col-gutter-md">
            <div class="col-12 col-lg-7 column q-gutter-y-md">
                <q-card flat bordered class="surface-card">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Nombre y eslogan</div>
                        <div class="text-caption text-grey-7">Se muestran en la cabecera, el login y la pestaña del navegador.</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none column q-gutter-y-sm">
                        <q-input
                            v-model="form.name"
                            outlined
                            dense
                            label="Nombre del negocio *"
                            maxlength="80"
                            counter
                            hint="La última palabra se resalta con el color de acento."
                            :rules="[(v) => !!String(v || '').trim() || 'El nombre es obligatorio']"
                        />
                        <q-input
                            v-model="form.tagline"
                            outlined
                            dense
                            label="Eslogan"
                            maxlength="120"
                            counter
                            hint="Opcional. Ej.: Gestión de hospedaje"
                        />
                    </q-card-section>
                </q-card>

                <q-card flat bordered class="surface-card">
                    <q-card-section>
                        <div class="text-subtitle1 text-weight-bold">Logo y favicon</div>
                        <div class="text-caption text-grey-7">El logo se ve sobre fondo oscuro; un PNG cuadrado con fondo transparente o negro queda mejor.</div>
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-sm-6">
                                <div class="brand-asset">
                                    <div class="brand-asset-preview brand-asset-preview--logo">
                                        <img :src="logoPreview" alt="Logo" />
                                    </div>
                                    <div class="col">
                                        <div class="text-weight-medium">Logo</div>
                                        <div class="text-caption text-grey-7">PNG, JPG o WEBP · máx. 2 MB</div>
                                        <div class="row q-gutter-xs q-mt-xs">
                                            <q-btn outline dense no-caps size="sm" color="primary" icon="upload" label="Subir" @click="logoInput.pickFiles()" />
                                            <q-btn v-if="hasCustomLogo" flat dense no-caps size="sm" color="negative" icon="delete" label="Quitar" @click="removeLogo" />
                                        </div>
                                    </div>
                                    <q-file
                                        ref="logoInput"
                                        v-model="logoFile"
                                        class="hidden"
                                        accept=".png,.jpg,.jpeg,.webp"
                                        max-file-size="2097152"
                                        @update:model-value="onLogoPicked"
                                        @rejected="onRejected('El logo debe ser PNG, JPG o WEBP y pesar menos de 2 MB.')"
                                    />
                                </div>
                            </div>
                            <div class="col-12 col-sm-6">
                                <div class="brand-asset">
                                    <div class="brand-asset-preview brand-asset-preview--favicon">
                                        <img :src="faviconPreview" alt="Favicon" />
                                    </div>
                                    <div class="col">
                                        <div class="text-weight-medium">Favicon</div>
                                        <div class="text-caption text-grey-7">Ícono de la pestaña · PNG o ICO · máx. 512 KB</div>
                                        <div class="row q-gutter-xs q-mt-xs">
                                            <q-btn outline dense no-caps size="sm" color="primary" icon="upload" label="Subir" @click="faviconInput.pickFiles()" />
                                            <q-btn v-if="hasCustomFavicon" flat dense no-caps size="sm" color="negative" icon="delete" label="Quitar" @click="removeFavicon" />
                                        </div>
                                    </div>
                                    <q-file
                                        ref="faviconInput"
                                        v-model="faviconFile"
                                        class="hidden"
                                        accept=".png,.ico,.jpg,.jpeg,.webp"
                                        max-file-size="524288"
                                        @update:model-value="onFaviconPicked"
                                        @rejected="onRejected('El favicon debe ser PNG, ICO, JPG o WEBP y pesar menos de 512 KB.')"
                                    />
                                </div>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <q-card flat bordered class="surface-card">
                    <q-card-section class="row items-center">
                        <div class="col">
                            <div class="text-subtitle1 text-weight-bold">Tema de colores</div>
                            <div class="text-caption text-grey-7">Elija un tema y ajústelo si hace falta. Los cambios se ven al instante; se guardan al pulsar Guardar.</div>
                        </div>
                        <q-chip v-if="currentPreset === 'custom'" outline color="accent" icon="tune" label="Personalizado" />
                    </q-card-section>
                    <q-card-section class="q-pt-none">
                        <div class="preset-grid">
                            <button
                                v-for="preset in PRESETS"
                                :key="preset.id"
                                type="button"
                                class="preset-card"
                                :class="{ 'preset-card--active': currentPreset === preset.id }"
                                @click="applyPreset(preset)"
                            >
                                <div class="preset-swatches">
                                    <span v-for="key in SWATCH_KEYS" :key="key" :style="{ background: preset.palette[key] }" />
                                </div>
                                <div class="preset-name">
                                    <q-icon v-if="currentPreset === preset.id" name="check_circle" size="16px" class="q-mr-xs" />
                                    {{ preset.name }}
                                </div>
                            </button>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-expansion-item v-model="fineTuneOpen" icon="colorize" label="Ajuste fino de colores" header-class="text-weight-medium">
                        <q-card-section class="q-pt-none">
                            <div v-for="group in PALETTE_GROUPS" :key="group.label" class="q-mb-md">
                                <div class="text-weight-medium">{{ group.label }}</div>
                                <div class="text-caption text-grey-7 q-mb-sm">{{ group.hint }}</div>
                                <div class="row q-col-gutter-sm">
                                    <div v-for="item in group.keys" :key="item.key" class="col-12 col-sm-6 col-md-4">
                                        <q-input
                                            v-model="form.palette[item.key]"
                                            outlined
                                            dense
                                            :label="item.label"
                                            maxlength="7"
                                            :rules="[(v) => isHex(v) || 'Formato #RRGGBB']"
                                            hide-bottom-space
                                        >
                                            <template #prepend>
                                                <span
                                                    class="color-dot"
                                                    :style="{ background: isHex(form.palette[item.key]) ? form.palette[item.key] : 'transparent' }"
                                                />
                                            </template>
                                            <template #append>
                                                <q-icon name="colorize" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                        <q-color v-model="form.palette[item.key]" format-model="hex" no-header-tabs default-view="spectrum" />
                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                </div>
                            </div>
                            <q-btn flat no-caps color="primary" icon="restart_alt" label="Restablecer a Rojo vino" @click="applyPreset(PRESETS[0])" />
                        </q-card-section>
                    </q-expansion-item>
                </q-card>
            </div>

            <div class="col-12 col-lg-5">
                <div class="preview-sticky">
                    <div class="text-overline text-grey-7 q-mb-xs">Vista previa</div>
                    <q-card flat bordered class="surface-card brand-preview">
                        <div class="bp-header">
                            <img class="bp-logo" :src="logoPreview" alt="" />
                            <div class="column">
                                <BrandName class="bp-title" :name="form.name || ' '" />
                                <span class="bp-subtitle">Sistema de reservas</span>
                            </div>
                        </div>
                        <div class="bp-body">
                            <div class="bp-sidebar">
                                <div class="bp-side-tagline">{{ form.tagline || ' ' }}</div>
                                <div class="bp-side-item bp-side-item--active"><q-icon name="calendar_month" size="14px" /> Calendario</div>
                                <div class="bp-side-item"><q-icon name="event_available" size="14px" /> Reservas</div>
                                <div class="bp-side-item"><q-icon name="assessment" size="14px" /> Reportes</div>
                            </div>
                            <div class="bp-content">
                                <div class="bp-kicker">{{ form.name || ' ' }}</div>
                                <div class="bp-page-title">Ocupación</div>
                                <div class="bp-product">
                                    <div class="text-caption text-grey-7">Habitación · Suite</div>
                                    <div class="text-weight-medium">Reserva de ejemplo</div>
                                    <div class="bp-price">3 noches</div>
                                </div>
                                <div class="row q-gutter-xs q-mt-sm">
                                    <q-btn unelevated dense no-caps size="sm" color="primary" label="Nueva" />
                                    <q-btn outline dense no-caps size="sm" color="primary" label="Filtros" />
                                    <q-chip dense color="accent" text-color="dark" label="Confirmada" />
                                </div>
                            </div>
                        </div>
                    </q-card>
                    <div class="text-caption text-grey-7 q-mt-sm">
                        La vista previa usa las mismas variables CSS que la aplicación real.
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useQuasar } from 'quasar'
import BrandName from 'src/components/brand/BrandName.vue'
import { useBrandStore } from 'src/stores/brand-store'
import { DEFAULT_LOGO, PALETTE_GROUPS, PRESETS, isHex, normalizePalette, presetMatching } from 'src/assets/js/util/theme'
import { Success, Error as NotifyError } from 'src/assets/js/util/notify'

defineOptions({ name: 'IdentidadPage' })

const SWATCH_KEYS = ['wine-deep', 'wine', 'wine-light', 'gold-light', 'ink', 'ivory']
const DEFAULT_FAVICON = '/favicon.ico'

const $q = useQuasar()
const brandStore = useBrandStore()

const form = reactive({ name: '', tagline: '', palette: normalizePalette(null) })
const logoFile = ref(null)
const faviconFile = ref(null)
const logoObjectUrl = ref(null)
const faviconObjectUrl = ref(null)
const removeLogoFlag = ref(false)
const removeFaviconFlag = ref(false)
const logoInput = ref(null)
const faviconInput = ref(null)
const fineTuneOpen = ref(false)
const saving = ref(false)

const saved = computed(() => brandStore.brand)

const currentPreset = computed(() => presetMatching(form.palette))

const dirty = computed(() =>
    form.name !== saved.value.name ||
    (form.tagline || '') !== (saved.value.tagline || '') ||
    PALETTE_GROUPS.some((g) => g.keys.some(({ key }) => form.palette[key] !== saved.value.palette[key])) ||
    !!logoFile.value || !!faviconFile.value || removeLogoFlag.value || removeFaviconFlag.value
)

const hasCustomLogo = computed(() => !!logoFile.value || (!!saved.value.logo_url && !removeLogoFlag.value))
const hasCustomFavicon = computed(() => !!faviconFile.value || (!!saved.value.favicon_url && !removeFaviconFlag.value))

const logoPreview = computed(() => {
    if (logoObjectUrl.value) return logoObjectUrl.value
    if (removeLogoFlag.value) return DEFAULT_LOGO
    return saved.value.logo_url || DEFAULT_LOGO
})

const faviconPreview = computed(() => {
    if (faviconObjectUrl.value) return faviconObjectUrl.value
    if (removeFaviconFlag.value) return DEFAULT_FAVICON
    return saved.value.favicon_url || DEFAULT_FAVICON
})

function apiErrorMessage(error) {
    return error?.response?.data?.message
        || error?.response?.data?.errors?.palette?.[0]
        || error?.message
        || 'No se pudo guardar la identidad.'
}

function revoke(urlRef) {
    if (urlRef.value) URL.revokeObjectURL(urlRef.value)
    urlRef.value = null
}

function resetFiles() {
    logoFile.value = null
    faviconFile.value = null
    revoke(logoObjectUrl)
    revoke(faviconObjectUrl)
    removeLogoFlag.value = false
    removeFaviconFlag.value = false
}

function loadForm() {
    form.name = saved.value.name
    form.tagline = saved.value.tagline || ''
    form.palette = { ...saved.value.palette }
    resetFiles()
}

function applyPreset(preset) {
    form.palette = { ...preset.palette }
}

function onLogoPicked(file) {
    revoke(logoObjectUrl)
    if (file) {
        logoObjectUrl.value = URL.createObjectURL(file)
        removeLogoFlag.value = false
    }
}

function onFaviconPicked(file) {
    revoke(faviconObjectUrl)
    if (file) {
        faviconObjectUrl.value = URL.createObjectURL(file)
        removeFaviconFlag.value = false
    }
}

function removeLogo() {
    logoFile.value = null
    revoke(logoObjectUrl)
    removeLogoFlag.value = !!saved.value.logo_url
}

function removeFavicon() {
    faviconFile.value = null
    revoke(faviconObjectUrl)
    removeFaviconFlag.value = !!saved.value.favicon_url
}

const onRejected = (message) => NotifyError(message)

watch(
    () => ({ ...form.palette }),
    (palette) => {
        if (PALETTE_GROUPS.every((g) => g.keys.every(({ key }) => isHex(palette[key])))) {
            brandStore.preview({ palette })
        }
    },
    { deep: true },
)

function discard() {
    loadForm()
    brandStore.apply()
}

async function save() {
    if (!form.name.trim()) return
    if (!PALETTE_GROUPS.every((g) => g.keys.every(({ key }) => isHex(form.palette[key])))) {
        NotifyError('Revise los colores: cada uno debe tener el formato #RRGGBB.')
        return
    }

    saving.value = true
    try {
        const data = new FormData()
        data.append('name', form.name.trim())
        data.append('tagline', (form.tagline || '').trim())
        data.append('theme_preset', currentPreset.value)
        data.append('palette', JSON.stringify(form.palette))
        if (logoFile.value) data.append('logo', logoFile.value)
        if (faviconFile.value) data.append('favicon', faviconFile.value)
        data.append('remove_logo', removeLogoFlag.value ? '1' : '0')
        data.append('remove_favicon', removeFaviconFlag.value ? '1' : '0')

        const res = await brandStore.save(data)
        loadForm()
        Success(res?.message || 'Identidad del negocio actualizada.')
    } catch (error) {
        NotifyError(apiErrorMessage(error))
    } finally {
        saving.value = false
    }
}

onBeforeRouteLeave((to, from, next) => {
    if (!dirty.value) return next()
    $q.dialog({
        title: 'Cambios sin guardar',
        message: 'Hay cambios en la identidad del negocio que no se han guardado. ¿Salir y descartarlos?',
        cancel: { flat: true, noCaps: true, label: 'Seguir editando' },
        ok: { unelevated: true, noCaps: true, color: 'primary', label: 'Descartar y salir' },
        persistent: true,
    })
        .onOk(() => next())
        .onCancel(() => next(false))
})

onMounted(async () => {
    loadForm()
    await brandStore.load()
    loadForm()
})

onBeforeUnmount(() => {
    resetFiles()
    brandStore.apply()
})
</script>

<style scoped lang="scss">
.page-title {
    font-family: $theme-serif;
    color: var(--theme-wine);
}

.preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}

.preset-card {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 12px;
    border: 1px solid var(--app-gold-line);
    background: var(--app-card-bg, var(--app-surface));
    padding: 10px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;

    &:hover {
        transform: translateY(-1px);
        border-color: var(--theme-gold-light);
    }

    &:focus-visible {
        outline: 2px solid var(--theme-gold-light);
        outline-offset: 2px;
    }

    &--active {
        border-color: var(--theme-gold);
        box-shadow: 0 0 0 1px var(--theme-gold), 0 8px 18px #{theme-a(wine-deep, 0.12)};
    }
}

.preset-swatches {
    display: flex;
    height: 34px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);

    span {
        flex: 1;
    }
}

.preset-name {
    display: flex;
    align-items: center;
    margin-top: 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--app-text, var(--app-ink));
}

.color-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
}

.brand-asset {
    display: flex;
    align-items: center;
    gap: 12px;
}

.brand-asset-preview {
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    overflow: hidden;

    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }

    &--logo {
        width: 76px;
        height: 76px;
        background: #000;
        border: 1.5px solid var(--theme-gold-light);
    }

    &--favicon {
        width: 52px;
        height: 52px;
        padding: 10px;
        background: var(--app-surface-muted);
        border: 1px solid var(--app-gold-line);
    }
}

.hidden {
    display: none;
}

.preview-sticky {
    position: sticky;
    top: 80px;
}

.brand-preview {
    overflow: hidden;
    padding: 0;
}

.bp-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    color: #fff;
    background: linear-gradient(100deg, var(--theme-wine-deep) 0%, var(--theme-wine) 55%, var(--theme-wine-light) 100%);
    border-bottom: 2px solid var(--theme-gold);
}

.bp-logo {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    object-fit: cover;
    background: #000;
    border: 1.5px solid var(--theme-gold-light);
}

.bp-title {
    font-family: $theme-serif;
    font-size: 1.1rem;
    font-weight: 600;
    line-height: 1.1;

    :deep(em) {
        color: var(--theme-gold-bright);
    }
}

.bp-subtitle {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #{theme-a(gold-pale, 0.8)};
}

.bp-body {
    display: flex;
    min-height: 220px;
}

.bp-sidebar {
    width: 38%;
    padding: 10px 8px;
    background: linear-gradient(180deg, var(--theme-ink) 0%, var(--theme-ink-2) 100%);
    color: #f1e6d6;
}

.bp-side-tagline {
    font-size: 10px;
    color: #{theme-a(gold-light, 0.85)};
    margin: 0 6px 8px;
    min-height: 14px;
}

.bp-side-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    padding: 6px 8px;
    border-radius: 8px;
    margin-bottom: 2px;

    &--active {
        background: linear-gradient(90deg, #{theme-a(wine-light, 0.95)} 0%, #{theme-a(wine, 0.25)} 100%);
        box-shadow: inset 3px 0 0 var(--theme-gold-light);
    }
}

.bp-content {
    flex: 1;
    padding: 12px 14px;
    background: var(--app-surface-elevated, var(--theme-ivory));
}

.bp-kicker {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--theme-gold);
}

.bp-page-title {
    font-family: $theme-serif;
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--theme-wine);
    margin-bottom: 8px;
}

.bp-product {
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--app-card-bg, #fff);
    border: 1px solid var(--app-gold-line);
}

.bp-price {
    font-weight: 700;
    color: var(--theme-wine);
}

:global(body.body--dark) {
    .bp-page-title,
    .bp-price,
    .page-title {
        color: var(--app-wine-on-dark);
    }
}
</style>
