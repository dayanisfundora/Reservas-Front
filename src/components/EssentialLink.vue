<template>
    <div class="menu-container">
        <q-list class="modern-menu-list">
            <template v-for="(group, groupIndex) in groupedLinks" :key="group.title + '-' + groupIndex">
                <div v-if="group.type === 'link'" class="menu-section">
                    <q-item
                        class="menu-item"
                        active-class="menu-item-active"
                        clickable
                        :to="{ name: group.link }"
                        exact
                    >
                        <q-item-section avatar class="min-w-0">
                            <q-icon size="20px" :name="group.icon || 'link'" />
                        </q-item-section>
                        <q-item-section v-if="!mini">
                            <q-item-label class="menu-label">{{ group.title }}</q-item-label>
                        </q-item-section>
                        <q-tooltip v-if="mini" anchor="center right" self="center left" :offset="[10, 0]">
                            {{ group.title }}
                        </q-tooltip>
                    </q-item>
                </div>

                <div
                    v-else
                    class="menu-section"
                    :class="{ 'menu-section--open': !mini && isSectionOpen(groupIndex) }"
                >
                    <q-item
                        clickable
                        class="menu-section-toggle"
                        :class="{
                            'menu-section-toggle--mini': mini,
                            'menu-section-toggle--current': sectionHasActiveRoute(group),
                        }"
                        @click="onSectionHeaderClick(groupIndex)"
                    >
                        <q-item-section avatar class="min-w-0">
                            <q-icon size="20px" :name="sectionIcon(group)" />
                        </q-item-section>
                        <q-item-section v-if="!mini">
                            <q-item-label class="menu-section-title">{{ group.title }}</q-item-label>
                        </q-item-section>
                        <q-item-section v-if="!mini" side class="section-chevron">
                            <q-icon :name="isSectionOpen(groupIndex) ? 'expand_less' : 'expand_more'" />
                        </q-item-section>
                        <q-tooltip v-if="mini" anchor="center right" self="center left" :offset="[10, 0]">
                            {{ group.title }}
                        </q-tooltip>

                        <q-menu
                            v-if="mini"
                            anchor="center right"
                            self="center left"
                            :offset="[12, 0]"
                            class="nav-flyout"
                        >
                            <q-list class="nav-flyout-list">
                                <div class="nav-flyout-title">{{ group.title }}</div>
                                <template v-for="(item, itemIndex) in groupItems(group)" :key="itemIndex">
                                    <q-item
                                        v-if="!item.children"
                                        v-close-popup
                                        clickable
                                        exact
                                        class="menu-item"
                                        active-class="menu-item-active"
                                        :to="{ name: item.link }"
                                    >
                                        <q-item-section avatar class="min-w-0">
                                            <q-icon size="18px" :name="item.icon || 'circle'" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="menu-label">{{ item.title }}</q-item-label>
                                        </q-item-section>
                                    </q-item>
                                    <template v-else>
                                        <div class="nav-flyout-subtitle">{{ item.title }}</div>
                                        <q-item
                                            v-for="(child, childIndex) in item.children"
                                            :key="childIndex"
                                            v-close-popup
                                            clickable
                                            exact
                                            class="menu-sub-item"
                                            active-class="menu-item-active"
                                            :to="{ name: child.link }"
                                        >
                                            <q-item-section avatar class="min-w-0">
                                                <q-icon size="18px" :name="child.icon || 'horizontal_rule'" />
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label class="menu-sub-label">{{ child.title }}</q-item-label>
                                            </q-item-section>
                                        </q-item>
                                    </template>
                                </template>
                            </q-list>
                        </q-menu>
                    </q-item>

                    <q-slide-transition>
                        <div v-show="!mini && isSectionOpen(groupIndex)">
                            <div class="menu-section-body">
                                <template v-for="(item, itemIndex) in groupItems(group)" :key="itemIndex">
                                    <q-item
                                        v-if="!item.children"
                                        class="menu-item"
                                        active-class="menu-item-active"
                                        clickable
                                        exact
                                        :to="{ name: item.link }"
                                    >
                                        <q-item-section avatar class="min-w-0">
                                            <q-icon size="20px" :name="item.icon || 'circle'" />
                                        </q-item-section>
                                        <q-item-section>
                                            <q-item-label class="menu-label">{{ item.title }}</q-item-label>
                                        </q-item-section>
                                    </q-item>

                                    <q-expansion-item
                                        v-else
                                        :model-value="isExpanded(groupIndex, itemIndex)"
                                        expand-separator
                                        class="menu-expansion"
                                        header-class="menu-expansion-header"
                                        :icon="item.icon || 'folder'"
                                        :label="item.title"
                                        @update:model-value="setExpanded(groupIndex, itemIndex, $event)"
                                    >
                                        <div class="menu-sub-list">
                                            <q-item
                                                v-for="(child, childIndex) in item.children"
                                                :key="childIndex"
                                                class="menu-sub-item"
                                                active-class="menu-item-active"
                                                clickable
                                                exact
                                                :to="{ name: child.link }"
                                            >
                                                <q-item-section avatar class="min-w-0" style="min-width: 32px">
                                                    <q-icon size="18px" :name="child.icon || 'horizontal_rule'" />
                                                </q-item-section>
                                                <q-item-section>
                                                    <q-item-label class="menu-sub-label">{{ child.title }}</q-item-label>
                                                </q-item-section>
                                            </q-item>
                                        </div>
                                    </q-expansion-item>
                                </template>
                            </div>
                        </div>
                    </q-slide-transition>
                </div>
            </template>
        </q-list>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { essentialListUrl } from 'src/assets/js/util/essentialListUrl'
import { useAuthStore } from 'src/stores/auth-store'

/**
 * Props for the EssentialLink component.
 *
 * @property {boolean} mini - When true, renders the menu in icon-only (mini) mode.
 */
const props = defineProps({
    mini: {
        type: Boolean,
        default: false,
    },
})

const SECTION_ICONS = {
    GENERAL: 'apps',
    RESERVAS: 'event_available',
    'CONFIGURACIÓN': 'settings',
    SEGURIDAD: 'shield',
}

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const openSection = ref(null)
const expandedItems = ref({})

function expansionKey(groupIndex, itemIndex) {
    return `${groupIndex}-${itemIndex}`
}

function isSectionOpen(groupIndex) {
    return openSection.value === groupIndex
}

function isExpanded(groupIndex, itemIndex) {
    return expandedItems.value[expansionKey(groupIndex, itemIndex)] === true
}

function setExpanded(groupIndex, itemIndex, expanded) {
    expandedItems.value = {
        ...expandedItems.value,
        [expansionKey(groupIndex, itemIndex)]: expanded,
    }
}

function onSectionHeaderClick(groupIndex) {
    if (props.mini) {
        return
    }

    openSection.value = openSection.value === groupIndex ? null : groupIndex
    expandedItems.value = {}
}

function groupItems(group) {
    return group.links || group.children || []
}

function sectionIcon(group) {
    return SECTION_ICONS[group.title] || groupItems(group)[0]?.icon || 'folder'
}

function collectRouteNames(items, names = []) {
    for (const item of items) {
        if (item.children?.length) {
            collectRouteNames(item.children, names)
            continue
        }

        if (item.link) {
            names.push(item.link)
        }
    }

    return names
}

function sectionHasActiveRoute(group) {
    return collectRouteNames(groupItems(group)).includes(route.name)
}

watch(
    () => props.mini,
    (mini, previousMini) => {
        if (previousMini === true && mini === false) {
            openSection.value = null
            expandedItems.value = {}
        }
    },
)

/**
 * Check whether a menu route is available for the current user.
 *
 * @param {string | undefined} routeName
 * @returns {boolean}
 */
function canAccessLink(routeName) {
    if (!routeName) {
        return true
    }

    const targetRoute = router.getRoutes().find((item) => item.name === routeName)

    if (!targetRoute) {
        return false
    }

    const requiredRoles = targetRoute.meta?.roles ?? []

    if (requiredRoles.length && !requiredRoles.some((role) => authStore.hasRole(role))) {
        return false
    }

    const requiredPermissions = targetRoute.meta?.permissions ?? []

    if (!requiredPermissions.length) {
        return true
    }

    return authStore.hasAllPermissions(requiredPermissions)
}

/**
 * Recursively filter menu entries by route access.
 *
 * @param {Array} links
 * @returns {Array}
 */
function filterLinks(links) {
    return links.reduce((filteredLinks, link) => {
        if (link.children?.length) {
            const visibleChildren = filterLinks(link.children)

            if (visibleChildren.length) {
                filteredLinks.push({
                    ...link,
                    children: visibleChildren,
                })
            }

            return filteredLinks
        }

        if (canAccessLink(link.link)) {
            filteredLinks.push(link)
        }

        return filteredLinks
    }, [])
}

const visibleLinks = computed(() => filterLinks(essentialListUrl))

/**
 * Standalone links render as direct menu items; links with children
 * render as collapsible sections.
 *
 * @param {Array} links
 * @returns {Array}
 */
function groupMenuLinks(links) {
    return links.map((link) => {
        if (link.children?.length) {
            return {
                type: 'section',
                title: link.title,
                children: link.children,
            }
        }

        return {
            type: 'link',
            ...link,
        }
    })
}

const groupedLinks = computed(() => groupMenuLinks(visibleLinks.value))

watch(
    () => route.name,
    () => {
        const activeIndex = groupedLinks.value.findIndex(
            (group) => group.type !== 'link' && sectionHasActiveRoute(group),
        )

        if (activeIndex !== -1) {
            openSection.value = activeIndex
        }
    },
    { immediate: true },
)
</script>

<style scoped>
/*
  Tipografía del menú (misma familia, tamaños por nivel):
  L0 sección  → 14px / 800
  L1 ítem     → 13.5px / 650
  L2 hijo     → 12px / 500
*/
.menu-container {
    --menu-font: var(--app-font);
    --menu-size-section: 13px;
    --menu-size-l1: 13.5px;
    --menu-size-l2: 12px;
    --menu-weight-section: 800;
    --menu-weight-l1: 650;
    --menu-weight-l2: 500;
    padding: 2px;
}

.modern-menu-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.menu-section {
    border-radius: 14px;
    background: var(--app-menu-section-bg);
    border: 1px solid var(--app-menu-section-border);
    overflow: hidden;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.14);
    backdrop-filter: blur(10px);
}

.menu-section-toggle {
    min-height: 42px;
    padding: 0 8px 0 4px;
    color: var(--app-menu-section-title) !important;
    background: var(--app-menu-section-title-bg);
}

.menu-section--open .menu-section-toggle {
    border-bottom: 1px solid var(--app-border);
}

.menu-section-toggle--current {
    box-shadow: inset 3px 0 0 #14b8a6;
}

.menu-section-toggle--mini {
    justify-content: center;
    padding: 0;
}

.menu-section-title {
    font-family: var(--menu-font);
    font-size: var(--menu-size-section) !important;
    font-weight: var(--menu-weight-section) !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--app-menu-section-title) !important;
    line-height: 1.25 !important;
}

.menu-section-toggle :deep(.q-item__label),
.menu-section-toggle :deep(.q-icon) {
    color: var(--app-menu-section-title) !important;
}

.section-chevron {
    min-width: 28px !important;
    padding-left: 0 !important;
}

.menu-section-body {
    padding: 4px;
}

.menu-item {
    border-radius: 10px;
    margin-bottom: 0;
    min-height: 34px;
    color: var(--app-menu-ink) !important;
    transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    padding: 0 12px;
}

.menu-item:hover {
    background-color: var(--app-menu-hover);
    color: var(--app-menu-ink) !important;
}

.menu-item-active {
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%) !important;
    color: #ffffff !important;
    font-weight: var(--menu-weight-l1);
    box-shadow: 0 6px 16px rgba(15, 118, 110, 0.28);
}

.menu-item-active .q-icon,
.menu-item-active .menu-label,
.menu-item-active .menu-sub-label {
    color: #ffffff !important;
}

.menu-label {
    font-family: var(--menu-font);
    font-size: var(--menu-size-l1) !important;
    font-weight: var(--menu-weight-l1) !important;
    line-height: 1.25 !important;
    color: var(--app-menu-ink) !important;
}

.menu-sub-label {
    font-family: var(--menu-font);
    font-size: var(--menu-size-l2) !important;
    font-weight: var(--menu-weight-l2) !important;
    line-height: 1.25 !important;
    color: var(--app-menu-ink) !important;
}

.menu-sub-item {
    border-radius: 10px;
    margin-bottom: 1px;
    min-height: 34px;
    padding: 0 12px 0 8px !important;
    color: var(--app-menu-ink) !important;
    transition: background-color 0.18s ease, color 0.18s ease;
}

.menu-sub-item:hover {
    background-color: var(--app-menu-hover);
    color: var(--app-menu-ink) !important;
}

.menu-sub-item:hover .menu-sub-label {
    color: var(--app-menu-ink) !important;
}

.menu-sub-item .q-icon {
    opacity: 0.85;
    color: var(--app-menu-ink) !important;
}

:deep(.q-item__label) {
    line-height: 1.25;
    font-family: var(--menu-font);
    color: var(--app-menu-ink) !important;
}

.menu-expansion {
    border-radius: 10px;
    margin-bottom: 0;
    background: color-mix(in srgb, var(--app-menu-hover) 70%, transparent);
}

:deep(.menu-expansion-header) {
    border-radius: 10px;
    color: var(--app-menu-ink) !important;
    transition: background-color 0.18s ease;
    min-height: 34px;
    padding: 0 12px;
}

:deep(.menu-expansion-header .q-item__label),
:deep(.menu-expansion-header .q-item-label),
:deep(.menu-expansion-header .q-item__section--main),
:deep(.q-expansion-item__header.menu-expansion-header .q-item__label),
:deep(.q-expansion-item__header.menu-expansion-header .q-item-label) {
    font-family: var(--menu-font) !important;
    font-size: var(--menu-size-l1) !important;
    font-weight: var(--menu-weight-l1) !important;
    line-height: 1.25 !important;
    color: var(--app-menu-ink) !important;
}

:deep(.menu-expansion-header .q-icon),
:deep(.menu-expansion-header .q-expansion-item__toggle-icon) {
    color: var(--app-menu-section-title) !important;
}

:deep(.menu-expansion-header .q-item__section--avatar),
:deep(.menu-expansion-header .q-item__section--side) {
    min-width: 36px !important;
    padding-right: 0 !important;
}

:deep(.menu-expansion-header:hover) {
    background-color: var(--app-menu-hover);
    color: var(--app-menu-ink) !important;
}

:deep(.q-expansion-item--expanded > .q-expansion-item__container > .q-item) {
    background-color: var(--app-menu-hover);
    color: var(--app-menu-ink) !important;
    border-bottom: 1px solid var(--app-border);
    border-radius: 10px 10px 0 0;
}

.menu-sub-list {
    padding: 4px 4px 6px 6px;
    margin: 0 4px 4px;
    background: var(--app-menu-sub-bg);
    border-radius: 0 0 10px 10px;
    border-left: 3px solid var(--app-primary);
}

:deep(.q-expansion-item__content) {
    padding: 0;
}

.menu-sub-item :deep(.q-item__label) {
    font-size: var(--menu-size-l2) !important;
    font-weight: var(--menu-weight-l2) !important;
    color: var(--app-menu-ink) !important;
}

.menu-item :deep(.q-item__label) {
    font-size: var(--menu-size-l1) !important;
    font-weight: var(--menu-weight-l1) !important;
    color: var(--app-menu-ink) !important;
}

.q-icon {
    color: inherit;
}

.min-w-0 {
    min-width: 36px;
}
</style>

<style>
.nav-flyout {
    border-radius: 14px;
    background: var(--app-menu-section-bg, #0f172a);
    border: 1px solid var(--app-menu-section-border, rgba(255, 255, 255, 0.12));
    color: var(--app-menu-ink, #e2e8f0);
    min-width: 240px;
}

.nav-flyout-list {
    padding: 6px;
}

.nav-flyout-title,
.nav-flyout-subtitle {
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--app-menu-section-title, #5eead4);
    padding: 8px 12px 4px;
}

.nav-flyout-subtitle {
    font-size: 10px;
    opacity: 0.85;
}
</style>
