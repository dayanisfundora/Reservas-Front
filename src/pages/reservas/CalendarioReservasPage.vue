<template>
    <q-page class="planning-page">
        <div v-if="needsCasaBanner" class="q-pa-md">
            <q-banner class="bg-warning text-dark" rounded>
                Seleccione una casa en el filtro del calendario para la vista mensual.
            </q-banner>
        </div>

        <div v-else class="planning-shell">
            <!-- Sidebar -->
            <aside class="planning-sidebar">
                <div class="sidebar-brand">
                    <img
                        v-if="brandStore.logoUrl"
                        class="sidebar-brand-mark sidebar-brand-mark--logo"
                        :src="brandStore.logoUrl"
                        :alt="brandStore.name"
                    />
                    <div v-else class="sidebar-brand-mark">{{ brandInitial }}</div>
                    <div>
                        <div class="sidebar-brand-title">{{ brandStore.name }}</div>
                        <div class="sidebar-brand-sub">{{ brandStore.tagline || 'Planning workspace' }}</div>
                    </div>
                </div>

                <div class="sidebar-block">
                    <q-date
                        v-model="selectedDate"
                        mask="YYYY-MM-DD"
                        minimal
                        flat
                        bordered
                        class="mini-date"
                        :locale="dateLocale"
                        @update:model-value="onMiniDateChange"
                    />
                </div>

                <div class="sidebar-block">
                    <div class="sidebar-section-label">Habitaciones</div>
                    <div class="room-filters">
                        <template v-for="grupo in roomsGrouped" :key="`filtro-${grupo.casa_id}`">
                            <div v-if="showCasaSections" class="room-casa-label">{{ grupo.casa_nombre }}</div>
                            <q-checkbox
                                v-for="room in grupo.rooms"
                                :key="room.id"
                                v-model="selectedHabitacionIds"
                                :val="room.id"
                                :label="room.nombre"
                                dense
                                keep-color
                                color="primary"
                                class="room-check"
                                :style="{ '--q-primary': roomColor(room) }"
                            />
                        </template>
                    </div>
                    <div class="row q-gutter-xs q-mt-sm">
                        <q-btn flat dense size="sm" color="primary" label="Todas" @click="selectAllRooms" />
                        <q-btn flat dense size="sm" color="grey-7" label="Ninguna" @click="selectedHabitacionIds = []" />
                    </div>
                </div>

                <div class="sidebar-block sidebar-stats">
                    <div class="sidebar-section-label">Atajos y estadísticas</div>
                    <div class="workload-card">
                        <div class="row items-center justify-between">
                            <span class="text-weight-medium">Porciento de ocupación</span>
                            <span class="text-caption text-grey-7">{{ occupancyPct }}%</span>
                        </div>
                        <q-linear-progress
                            :value="occupancyPct / 100"
                            color="primary"
                            track-color="grey-3"
                            rounded
                            size="10px"
                            class="q-mt-sm"
                        />
                        <div class="text-caption text-grey-7 q-mt-xs">
                            {{ occupancyLabel }}
                        </div>
                    </div>

                    <div class="row q-col-gutter-sm q-mt-sm">
                        <div class="col-6">
                            <div class="stat-mini stat-mini--warn">
                                <div class="stat-mini-value">{{ stats.pendientes }}</div>
                                <div class="stat-mini-label">Pendientes</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="stat-mini stat-mini--ok">
                                <div class="stat-mini-value">{{ stats.confirmadas }}</div>
                                <div class="stat-mini-label">Confirmadas</div>
                            </div>
                        </div>
                    </div>

                    <q-btn
                        outline
                        no-caps
                        class="full-width q-mt-md plan-outline-btn"
                        label="Reservas mes"
                        icon="analytics"
                        @click="metricsOpen = true"
                    />
                    <q-btn
                        flat
                        color="grey-8"
                        class="full-width q-mt-xs"
                        label="Listado de reservas"
                        icon="list"
                        :to="{ name: 'Reservas' }"
                    />
                </div>
            </aside>

            <!-- Main -->
            <section class="planning-main">
                <header class="planning-toolbar">
                    <div class="toolbar-left">
                        <div class="month-title">
                            {{ monthParts.month }} <em>{{ monthParts.year }}</em>
                        </div>
                        <q-btn flat round dense icon="chevron_left" class="nav-arrow-btn" @click="shiftPeriod(-1)" />
                        <q-btn flat round dense icon="chevron_right" class="nav-arrow-btn" @click="shiftPeriod(1)" />
                        <q-btn outline dense no-caps label="Hoy" class="hoy-btn plan-outline-btn" @click="goToday" />
                        <q-select
                            v-model="filtroCasaId"
                            :options="casaFilterOptions"
                            emit-value
                            map-options
                            dense
                            outlined
                            options-dense
                            label="Casa"
                            class="casa-filter-select"
                            hide-bottom-space
                        />
                    </div>

                    <div class="view-switch">
                        <q-btn
                            v-for="opt in viewOptions"
                            :key="opt.value"
                            dense
                            unelevated
                            no-caps
                            :outline="viewMode !== opt.value"
                            :class="viewMode === opt.value ? 'view-active' : 'plan-outline-btn'"
                            :label="opt.label"
                            @click="viewMode = opt.value"
                        />
                    </div>

                    <div class="toolbar-right">
                        <q-input
                            v-model="search"
                            dense
                            outlined
                            clearable
                            placeholder="Buscar cliente o habitación..."
                            class="search-input"
                        >
                            <template #prepend>
                                <q-icon name="search" />
                            </template>
                        </q-input>
                        <q-btn
                            outline
                            dense
                            no-caps
                            icon="picture_as_pdf"
                            label="PDF"
                            class="plan-outline-btn"
                            :loading="downloadingPdf"
                            :disable="loading || downloadingPdf || printingPdf"
                            @click="downloadCalendarPdf"
                        >
                            <q-tooltip>Descargar PDF de la vista actual</q-tooltip>
                        </q-btn>
                        <q-btn
                            outline
                            dense
                            no-caps
                            icon="print"
                            label="Imprimir"
                            class="plan-outline-btn"
                            :loading="printingPdf"
                            :disable="loading || downloadingPdf || printingPdf"
                            @click="printCalendarPdf"
                        >
                            <q-tooltip>Imprimir PDF de la vista actual</q-tooltip>
                        </q-btn>
                        <q-btn
                            v-if="canManage"
                            unelevated
                            no-caps
                            icon="add"
                            label="Nueva reserva"
                            class="create-btn"
                            @click="goCreate(null, selectedDate)"
                        />
                    </div>
                </header>

                <div
                    ref="calendarExportRef"
                    class="calendar-export-root"
                    :class="{ 'is-exporting': downloadingPdf || printingPdf }"
                >
                <div class="legend-row">
                    <span v-for="item in legend" :key="item.key" class="legend-item">
                        <span class="legend-dot" :style="{ background: item.color }" />
                        {{ item.label }}
                    </span>
                    <span class="legend-keys">
                        <template v-if="viewMode === 'mensual'">
                            <span class="legend-key"><span class="legend-swatch is-arrival" />Llegada</span>
                            <span class="legend-key"><span class="legend-swatch" />Estancia</span>
                            <span class="legend-key"><span class="legend-swatch is-pendiente" />Pendiente</span>
                        </template>
                        <span class="legend-key">
                            <q-icon name="local_taxi" size="14px" />
                            Taxi <b>L</b> llegada · <b>S</b> salida
                        </span>
                        <span class="legend-key">
                            <span class="cal-taxi is-ok">L<q-icon name="check" size="10px" /></span>
                            Solicitado
                        </span>
                        <span class="legend-key">
                            <span class="cal-taxi is-warn">L<q-icon name="close" size="10px" /></span>
                            Sin taxi
                        </span>
                    </span>
                </div>

                <div v-if="loading" class="flex flex-center q-pa-xl">
                    <q-spinner color="primary" size="42px" />
                </div>

                <!-- MENSUAL -->
                <div v-else-if="viewMode === 'mensual'" class="calendar-panel">
                    <q-calendar-month
                        v-model="selectedDate"
                        locale="es-ES"
                        animated
                        hoverable
                        focusable
                        date-align="left"
                        :weekdays="[1, 2, 3, 4, 5, 6, 0]"
                        :day-min-height="128"
                        :show-month-label="false"
                        :day-class="monthDayClass"
                        short-weekday-label
                        class="ep-month"
                        @click-date="onMonthClick"
                        @click-day="onMonthClick"
                    >
                        <template #head-day-label="{ scope }">
                            <span
                                class="day-num"
                                :class="{
                                    'is-today': scope.timestamp.date === todayIso,
                                    'is-outside': scope.outside
                                }"
                            >
                                {{ scope.dayLabel }}
                            </span>
                        </template>
                        <template #day="{ scope }">
                            <div class="mday">
                                <div class="mday-corner">
                                    <span
                                        v-if="dayEventsMap[scope.timestamp.date]?.length"
                                        class="mday-count"
                                    >
                                        <!-- Misma cama del favicon.svg -->
                                        <svg class="mday-bed-icon" viewBox="10 18 44 32" aria-hidden="true">
                                            <rect x="10" y="18" width="5" height="32" rx="2" fill="currentColor"/>
                                            <rect x="15" y="34" width="39" height="9" rx="2" fill="currentColor"/>
                                            <rect x="49" y="34" width="5" height="16" rx="2" fill="currentColor"/>
                                            <rect x="18" y="26" width="11" height="7" rx="3" fill="currentColor"/>
                                            <path d="M31 26h17a6 6 0 0 1 6 6v2H31z" fill="currentColor"/>
                                        </svg>
                                        {{ dayEventsMap[scope.timestamp.date].length }}
                                        <q-tooltip>
                                            {{ dayEventsMap[scope.timestamp.date].length }}
                                            {{ dayEventsMap[scope.timestamp.date].length === 1 ? 'reserva ocupando' : 'reservas ocupando' }}
                                            este día
                                        </q-tooltip>
                                    </span>
                                    <button
                                        v-if="canManage"
                                        type="button"
                                        class="day-add-btn"
                                        aria-label="Nueva reserva este día"
                                        @click.stop="goCreate(null, scope.timestamp.date)"
                                    >
                                        <q-icon name="add" size="14px" />
                                        <q-tooltip>Nueva reserva este día</q-tooltip>
                                    </button>
                                </div>

                                <button
                                    v-for="ev in (dayEventsMap[scope.timestamp.date] || []).slice(0, 3)"
                                    :key="ev.id"
                                    type="button"
                                    class="cal-ev"
                                    :class="{
                                        'is-arrival': ev.fecha_entrada === scope.timestamp.date,
                                        'is-pendiente': ev.estado === 'pendiente'
                                    }"
                                    :style="{ '--room-color': roomColor(ev) }"
                                    @click.stop="openReserva(ev)"
                                >
                                    <span class="cal-ev-bar" />
                                    <span class="cal-ev-body">
                                        <span class="cal-ev-top">
                                            <span class="cal-ev-name">{{ ev.cliente_nombre }}</span>
                                            <span
                                                v-if="ev.fecha_entrada === scope.timestamp.date && ev.hora_llegada"
                                                class="cal-ev-time"
                                            >
                                                {{ ev.hora_llegada }}
                                            </span>
                                        </span>
                                        <span class="cal-ev-taxis">
                                            <q-icon name="local_taxi" size="12px" class="cal-ev-taxi-icon" />
                                            <span
                                                v-for="flag in taxiFlags(ev)"
                                                :key="flag.key"
                                                class="cal-taxi"
                                                :class="flag.ok ? 'is-ok' : 'is-warn'"
                                            >
                                                {{ flag.letter }}
                                                <q-icon :name="flag.ok ? 'check' : 'close'" size="10px" />
                                            </span>
                                        </span>
                                    </span>
                                    <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 6]">
                                        <div class="text-weight-bold">{{ ev.cliente_nombre }}</div>
                                        <div>{{ ev.habitacion_nombre }} · {{ ev.cantidad_personas }} pax</div>
                                        <div>{{ formatDayShort(ev.fecha_entrada) }} → {{ formatDayShort(ev.fecha_salida) }}</div>
                                        <div v-if="ev.estado === 'pendiente'">Pendiente de confirmar</div>
                                        <div v-for="flag in taxiFlags(ev)" :key="flag.key">
                                            {{ flag.label }}: {{ flag.ok ? 'solicitado' : 'sin taxi' }}
                                        </div>
                                    </q-tooltip>
                                </button>

                                <button
                                    v-if="(dayEventsMap[scope.timestamp.date] || []).length > 3"
                                    type="button"
                                    class="mday-more"
                                    @click.stop="openDayDetail(scope.timestamp.date)"
                                >
                                    +{{ dayEventsMap[scope.timestamp.date].length - 3 }} más
                                </button>
                            </div>
                        </template>
                    </q-calendar-month>
                </div>

                <!-- LIBRO: filas = días, columnas = habitaciones -->
                <div v-else-if="viewMode === 'libro'" class="book-grid-wrap">
                    <div v-if="!visibleRooms.length" class="q-pa-lg text-grey-7">
                        Seleccione al menos una habitación en el panel izquierdo.
                    </div>
                    <div v-else class="book-grid" :style="bookGridStyle">
                        <div class="book-corner">Día</div>
                        <div
                            v-for="room in visibleRooms"
                            :key="`bh-${room.id}`"
                            class="book-room-head"
                            :style="{ '--room-color': roomColor(room) }"
                        >
                            <div v-if="showCasaSections && room.casa_nombre" class="book-room-casa">
                                {{ room.casa_nombre }}
                            </div>
                            <div class="book-room-head-title">
                                <span class="legend-dot" :style="{ background: roomColor(room) }" />
                                <span class="book-room-head-name">{{ room.nombre }}</span>
                            </div>
                            <span class="book-room-head-meta">
                                {{ room.tipo === 'privada' ? 'Priv.' : 'Comp.' }} · {{ room.capacidad }}
                            </span>
                        </div>

                        <template v-for="day in bookDays" :key="`bd-${day}`">
                            <div
                                class="book-day-label"
                                :class="{ 'is-today': day === todayIso, 'is-weekend': isWeekend(day) }"
                            >
                                <div class="grid-day-wd">{{ weekdayShort(day) }}</div>
                                <div class="grid-day-num">{{ day.slice(8) }}</div>
                            </div>
                            <div
                                v-for="room in visibleRooms"
                                :key="`bc-${room.id}-${day}`"
                                class="book-cell"
                                :class="{ 'is-today': day === todayIso, 'is-weekend': isWeekend(day) }"
                                @click="onBookCellClick(room, day)"
                            >
                                <template v-if="cellReservas(room.id, day).length">
                                    <button
                                        v-for="ev in cellReservas(room.id, day)"
                                        :key="ev.id"
                                        type="button"
                                        class="book-name"
                                        :class="{ 'is-pendiente': ev.estado === 'pendiente' }"
                                        :style="roomToneStyle(ev)"
                                        @click.stop="openReserva(ev)"
                                    >
                                        <span class="book-name-text">{{ ev.cliente_nombre }}</span>
                                        <span class="book-name-meta">
                                            {{ ev.cantidad_personas }}p
                                            <template v-if="ev.genero">
                                                · {{ ev.genero === 'femenino' ? 'F' : 'M' }}
                                            </template>
                                        </span>
                                        <span class="event-taxi-flags book-taxi-flags">
                                            <span class="taxi-flag" :class="ev.taxi_llegada ? 'taxi-flag-ok' : 'taxi-flag-warn'">
                                                <q-icon :name="ev.taxi_llegada ? 'local_taxi' : 'warning'" size="12px" />
                                                <span class="taxi-flag-letter">L</span>
                                                <q-tooltip>{{ ev.taxi_llegada ? 'Taxi llegada: sí' : 'Sin taxi de llegada' }}</q-tooltip>
                                            </span>
                                            <span class="taxi-flag" :class="ev.taxi_salida ? 'taxi-flag-ok' : 'taxi-flag-warn'">
                                                <q-icon :name="ev.taxi_salida ? 'local_taxi' : 'warning'" size="12px" />
                                                <span class="taxi-flag-letter">S</span>
                                                <q-tooltip>{{ ev.taxi_salida ? 'Taxi salida: sí' : 'Sin taxi de salida' }}</q-tooltip>
                                            </span>
                                        </span>
                                    </button>
                                    <button
                                        v-if="canManage"
                                        type="button"
                                        class="cell-add-btn"
                                        @click.stop="goCreate(room.id, day)"
                                    >
                                        <q-icon name="add" size="14px" /> Agregar
                                    </button>
                                </template>
                                <div v-else-if="canManage" class="book-empty">
                                    <q-icon name="add" size="14px" />
                                </div>
                            </div>
                        </template>
                    </div>
                </div>

                <!-- PLANNING / DÍA -->
                <div v-else class="planning-grid-wrap">
                    <div class="planning-grid" :style="gridStyle">
                        <div class="grid-corner">Habitación</div>
                        <div
                            v-for="day in planningDays"
                            :key="`h-${day}`"
                            class="grid-day-head"
                            :class="{ 'is-today': day === todayIso, 'is-weekend': isWeekend(day) }"
                        >
                            <div class="grid-day-wd">{{ weekdayShort(day) }}</div>
                            <div class="grid-day-num">{{ day.slice(8) }}</div>
                        </div>

                        <template v-for="row in planningRows" :key="row.key">
                            <template v-if="row.type === 'casa'">
                                <div
                                    class="grid-casa-head"
                                    :style="{ gridColumn: `1 / span ${planningDays.length + 1}` }"
                                >
                                    {{ row.casa_nombre }}
                                </div>
                            </template>
                            <template v-else>
                            <div class="grid-room" :style="{ '--room-color': roomColor(row.room) }">
                                <div class="grid-room-name">
                                    <span class="legend-dot" :style="{ background: roomColor(row.room) }" />
                                    {{ row.room.nombre }}
                                </div>
                                <div class="grid-room-meta">
                                    {{ row.room.tipo === 'privada' ? 'Privada' : 'Compartida' }} · {{ row.room.capacidad }}
                                </div>
                            </div>
                            <div
                                v-for="day in planningDays"
                                :key="`${row.room.id}-${day}`"
                                class="grid-cell"
                                :class="{ 'is-today': day === todayIso, 'is-weekend': isWeekend(day) }"
                                @click="onPlanningCellClick(row.room, day)"
                            >
                                <template v-if="cellReservas(row.room.id, day).length">
                                    <div
                                        v-for="ev in cellReservas(row.room.id, day)"
                                        :key="ev.id"
                                        class="plan-card"
                                        :class="{ 'is-pendiente': ev.estado === 'pendiente' }"
                                        :style="roomToneStyle(ev)"
                                        @click.stop="openReserva(ev)"
                                    >
                                        <div class="plan-card-top">
                                            <span>
                                                <q-icon name="schedule" size="12px" />
                                                {{ ev.hora_llegada || '—' }}
                                            </span>
                                            <span class="plan-nights">{{ ev.cantidad_noches }}n</span>
                                        </div>
                                        <div class="plan-card-title">{{ ev.cliente_nombre }}</div>
                                        <div class="plan-card-bottom">
                                            <span>
                                                <q-icon name="group" size="12px" />
                                                {{ ev.cantidad_personas }} pax
                                            </span>
                                            <span class="event-taxi-flags">
                                                <span class="taxi-flag" :class="ev.taxi_llegada ? 'taxi-flag-ok' : 'taxi-flag-warn'">
                                                    <q-icon :name="ev.taxi_llegada ? 'local_taxi' : 'warning'" size="13px" />
                                                    <span class="taxi-flag-letter">L</span>
                                                    <q-tooltip>{{ ev.taxi_llegada ? 'Taxi llegada: sí' : 'Sin taxi de llegada' }}</q-tooltip>
                                                </span>
                                                <span class="taxi-flag" :class="ev.taxi_salida ? 'taxi-flag-ok' : 'taxi-flag-warn'">
                                                    <q-icon :name="ev.taxi_salida ? 'local_taxi' : 'warning'" size="13px" />
                                                    <span class="taxi-flag-letter">S</span>
                                                    <q-tooltip>{{ ev.taxi_salida ? 'Taxi salida: sí' : 'Sin taxi de salida' }}</q-tooltip>
                                                </span>
                                            </span>
                                            <span class="plan-tag">{{ row.room.tipo === 'privada' ? 'PRIVADA' : 'COMPARTIDA' }}</span>
                                        </div>
                                    </div>
                                    <button
                                        v-if="canManage"
                                        type="button"
                                        class="cell-add-btn"
                                        @click.stop="goCreate(row.room.id, day)"
                                    >
                                        <q-icon name="add" size="14px" /> Agregar
                                    </button>
                                </template>
                                <div v-else-if="canManage" class="empty-slot">
                                    <q-icon name="add" size="16px" />
                                </div>
                            </div>
                            </template>
                        </template>
                    </div>
                </div>
                </div>
            </section>
        </div>

        <!-- Day / reserva detail -->
        <q-dialog v-model="detailOpen" persistent @hide="resetDetailState">
            <q-card class="detail-card rv-card no-accent-bar">
                <!-- Confirmar cancelación -->
                <template v-if="confirmCancel && activeReserva">
                    <div class="rv-confirm">
                        <div class="rv-confirm-icon">
                            <q-icon name="event_busy" size="26px" />
                        </div>
                        <div class="rv-confirm-title">¿Cancelar esta reserva?</div>
                        <div class="rv-confirm-text">
                            La reserva de <strong>{{ activeReserva.cliente_nombre }}</strong> en
                            {{ activeReserva.habitacion_nombre }}
                            ({{ formatDayShort(activeReserva.fecha_entrada) }} → {{ formatDayShort(activeReserva.fecha_salida) }})
                            quedará cancelada y la habitación volverá a estar disponible.
                        </div>
                    </div>
                    <div class="rv-actions">
                        <q-space />
                        <q-btn flat no-caps label="Volver" :disable="canceling" @click="confirmCancel = false" />
                        <q-btn
                            unelevated
                            no-caps
                            color="negative"
                            icon="event_busy"
                            label="Sí, cancelar"
                            :loading="canceling"
                            @click="confirmCancelReserva"
                        />
                    </div>
                </template>

                <!-- Detalle de una reserva -->
                <template v-else-if="activeReserva">
                    <div class="rv-hero" :style="{ '--room-color': roomColor(activeReserva) }">
                        <div class="rv-hero-top">
                            <span class="rv-status" :class="`is-${activeReserva.estado}`">
                                <span class="rv-status-dot" />
                                {{ estadoLabel(activeReserva.estado) }}
                            </span>
                            <q-btn flat round dense icon="close" class="rv-close" v-close-popup />
                        </div>
                        <div class="rv-guest">
                            <div class="rv-avatar">{{ initials(activeReserva.cliente_nombre) }}</div>
                            <div class="rv-guest-text">
                                <div class="rv-name">{{ activeReserva.cliente_nombre }}</div>
                                <div class="rv-room">
                                    <span class="rv-room-dot" />
                                    {{ activeReserva.habitacion_nombre }}
                                    <span class="rv-room-type">
                                        {{ activeReserva.habitacion_tipo === 'compartida' ? 'Compartida' : 'Privada' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rv-body">
                        <div class="rv-stay">
                            <div class="rv-stay-col">
                                <div class="rv-label">Check-in</div>
                                <div class="rv-date">{{ formatDayLong(activeReserva.fecha_entrada) }}</div>
                                <div class="rv-sub">
                                    <q-icon name="schedule" size="14px" />
                                    {{ activeReserva.hora_llegada ? `Llegada ${activeReserva.hora_llegada}` : 'Hora sin definir' }}
                                </div>
                            </div>
                            <div class="rv-stay-mid">
                                <span class="rv-nights">
                                    <q-icon name="nights_stay" size="14px" />
                                    {{ activeReserva.cantidad_noches }} {{ Number(activeReserva.cantidad_noches) === 1 ? 'noche' : 'noches' }}
                                </span>
                            </div>
                            <div class="rv-stay-col is-end">
                                <div class="rv-label">Check-out</div>
                                <div class="rv-date">{{ formatDayLong(activeReserva.fecha_salida) }}</div>
                                <div class="rv-sub">{{ formatYear(activeReserva.fecha_salida) }}</div>
                            </div>
                        </div>

                        <div class="rv-grid">
                            <div class="rv-tile">
                                <q-icon name="group" class="rv-tile-icon" />
                                <div>
                                    <div class="rv-label">Huéspedes</div>
                                    <div class="rv-value">
                                        {{ activeReserva.cantidad_personas }}
                                        {{ Number(activeReserva.cantidad_personas) === 1 ? 'persona' : 'personas' }}
                                    </div>
                                    <div class="rv-tile-sub">{{ formatGenerosResumen(activeReserva) }}</div>
                                </div>
                            </div>
                            <div class="rv-tile">
                                <svg class="rv-tile-icon rv-tile-bed" viewBox="10 18 44 32" aria-hidden="true">
                                    <rect x="10" y="18" width="5" height="32" rx="2" fill="currentColor"/>
                                    <rect x="15" y="34" width="39" height="9" rx="2" fill="currentColor"/>
                                    <rect x="49" y="34" width="5" height="16" rx="2" fill="currentColor"/>
                                    <rect x="18" y="26" width="11" height="7" rx="3" fill="currentColor"/>
                                    <path d="M31 26h17a6 6 0 0 1 6 6v2H31z" fill="currentColor"/>
                                </svg>
                                <div>
                                    <div class="rv-label">Camas</div>
                                    <div class="rv-value">{{ formatCamasResumen(activeReserva.camas) }}</div>
                                </div>
                            </div>
                            <div v-if="activeReserva.agencia" class="rv-tile">
                                <q-icon name="storefront" class="rv-tile-icon" />
                                <div>
                                    <div class="rv-label">Agencia</div>
                                    <div class="rv-value">{{ activeReserva.agencia }}</div>
                                </div>
                            </div>
                            <div v-if="activeReserva.vuelo" class="rv-tile">
                                <q-icon name="flight" class="rv-tile-icon" />
                                <div>
                                    <div class="rv-label">Vuelo</div>
                                    <div class="rv-value">{{ activeReserva.vuelo }}</div>
                                </div>
                            </div>
                        </div>

                        <div class="rv-section-title">Traslados en taxi</div>
                        <div class="rv-transfers">
                            <div class="rv-transfer">
                                <q-icon name="flight_land" size="18px" class="rv-transfer-icon" />
                                <span class="rv-transfer-label">Llegada</span>
                                <span class="rv-pill" :class="activeReserva.taxi_llegada ? 'is-ok' : 'is-danger'">
                                    <q-icon :name="activeReserva.taxi_llegada ? 'check' : 'priority_high'" size="13px" />
                                    {{ activeReserva.taxi_llegada ? 'Solicitado' : 'Sin taxi' }}
                                </span>
                            </div>
                            <div class="rv-transfer">
                                <q-icon name="flight_takeoff" size="18px" class="rv-transfer-icon" />
                                <span class="rv-transfer-label">Salida</span>
                                <span class="rv-pill" :class="activeReserva.taxi_salida ? 'is-ok' : 'is-danger'">
                                    <q-icon :name="activeReserva.taxi_salida ? 'check' : 'priority_high'" size="13px" />
                                    {{ activeReserva.taxi_salida ? 'Solicitado' : 'Sin taxi' }}
                                </span>
                            </div>
                        </div>
                        <div v-if="hasMissingTaxi(activeReserva)" class="rv-hint">
                            <q-icon name="tips_and_updates" size="16px" />
                            <span class="col">{{ formatTaxiAlerta(activeReserva) }}. Pregunte al cliente si desea pedirlo.</span>
                            <button
                                v-if="canEditActive"
                                type="button"
                                class="rv-hint-action"
                                @click="openEditReserva(activeReserva)"
                            >
                                Agregar taxi
                            </button>
                        </div>

                        <template v-if="activeReserva.notas">
                            <div class="rv-section-title">Notas</div>
                            <div class="rv-notes">{{ activeReserva.notas }}</div>
                        </template>
                    </div>

                    <div class="rv-actions">
                        <q-btn
                            v-if="canManage && (activeReserva.estado === 'confirmada' || activeReserva.estado === 'pendiente')"
                            flat
                            no-caps
                            color="negative"
                            icon="event_busy"
                            label="Cancelar reserva"
                            @click="confirmCancel = true"
                        />
                        <q-space />
                        <q-btn
                            v-if="canManage && activeReserva.estado === 'pendiente'"
                            unelevated
                            no-caps
                            color="positive"
                            icon="check_circle"
                            label="Confirmar"
                            :loading="confirming"
                            @click="confirmarReservaActiva"
                        />
                        <q-btn
                            v-if="canEditActive"
                            unelevated
                            no-caps
                            color="primary"
                            icon="edit"
                            label="Editar reserva"
                            @click="openEditReserva(activeReserva)"
                        />
                    </div>
                </template>

                <!-- Reservas de un día -->
                <template v-else>
                    <div class="rv-day-head">
                        <div>
                            <div class="rv-label">Ocupación del día</div>
                            <div class="rv-day-title">{{ detailLabel }}</div>
                        </div>
                        <q-btn flat round dense icon="close" v-close-popup />
                    </div>

                    <div class="rv-body">
                        <div v-if="!dayDetailList.length" class="rv-empty">
                            <q-icon name="event_available" size="34px" />
                            <div>No hay reservas este día.</div>
                        </div>
                        <div v-else class="rv-day-list">
                            <button
                                v-for="ev in dayDetailList"
                                :key="ev.id"
                                type="button"
                                class="rv-day-item"
                                :style="{ '--room-color': roomColor(ev) }"
                                @click="openReserva(ev)"
                            >
                                <span class="rv-day-bar" />
                                <span class="rv-day-main">
                                    <span class="rv-day-name">{{ ev.cliente_nombre }}</span>
                                    <span class="rv-day-meta">
                                        {{ ev.habitacion_nombre }}
                                        · {{ ev.cantidad_personas }} pax
                                        <template v-if="ev.fecha_entrada === selectedDate && ev.hora_llegada">
                                            · llega {{ ev.hora_llegada }}
                                        </template>
                                    </span>
                                </span>
                                <span v-if="ev.estado === 'pendiente'" class="rv-pill is-warn">Pendiente</span>
                                <span class="cal-ev-taxis">
                                    <q-icon name="local_taxi" size="14px" class="cal-ev-taxi-icon" />
                                    <span
                                        v-for="flag in taxiFlags(ev)"
                                        :key="flag.key"
                                        class="cal-taxi"
                                        :class="flag.ok ? 'is-ok' : 'is-warn'"
                                    >
                                        {{ flag.letter }}
                                        <q-icon :name="flag.ok ? 'check' : 'close'" size="10px" />
                                        <q-tooltip>{{ flag.label }}: {{ flag.ok ? 'solicitado' : 'sin taxi' }}</q-tooltip>
                                    </span>
                                </span>
                                <q-icon name="chevron_right" size="18px" class="rv-day-chevron" />
                            </button>
                        </div>
                    </div>

                    <div class="rv-actions">
                        <q-space />
                        <q-btn flat no-caps label="Cerrar" v-close-popup />
                        <q-btn
                            v-if="canManage"
                            unelevated
                            no-caps
                            color="primary"
                            icon="add"
                            label="Nueva reserva"
                            @click="goCreate(null, selectedDate)"
                        />
                    </div>
                </template>
            </q-card>
        </q-dialog>

        <!-- Metrics -->
        <q-dialog v-model="metricsOpen" persistent>
            <q-card class="metrics-card no-accent-bar">
                <q-card-section class="row items-center">
                    <div class="text-h6 text-primary">Reservas mes</div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>
                <q-card-section>
                    <div class="row q-col-gutter-md">
                        <div v-for="card in metricCards" :key="card.label" class="col-6 col-sm-3">
                            <div class="metric-tile" :class="`metric-tile--${card.tone}`">
                                <div class="metric-icon">
                                    <q-icon :name="card.icon" />
                                </div>
                                <div class="metric-label">{{ card.label }}</div>
                                <div class="metric-value">{{ card.value }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="metrics-section-label q-mt-lg">Distribución por tipo</div>
                    <div v-for="bar in typeBars" :key="bar.label" class="q-mb-sm">
                        <div class="row justify-between text-caption">
                            <span>{{ bar.label }}</span>
                            <span>{{ bar.value }}</span>
                        </div>
                        <q-linear-progress :value="bar.ratio" color="primary" track-color="grey-8" rounded size="12px" class="q-mt-xs metrics-bar" />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

        <!-- Crear / editar reserva (sin salir del calendario) -->
        <q-dialog v-model="createOpen" persistent>
            <q-card class="reserva-dialog no-accent-bar">
                <q-card-section class="row items-center q-pb-none">
                    <div class="text-h6">{{ editingReservaId ? 'Editar reserva' : 'Nueva reserva' }}</div>
                    <q-space />
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-card-section>

                <q-card-section class="q-pt-md q-pb-none">
                    <div class="reserva-layout">
                        <section class="reserva-pane">
                            <div class="reserva-pane-title">Estancia</div>

                            <div class="reserva-block">
                                <q-select
                                    v-model="createForm.habitacion_id"
                                    :options="habitacionOptions"
                                    emit-value
                                    map-options
                                    outlined
                                    dense
                                    label="Habitación *"
                                    hide-bottom-space
                                    @update:model-value="onCreateHabitacionChange"
                                />
                            </div>

                            <div class="reserva-block">
                                <div class="reserva-block-label">Fechas</div>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-sm-5">
                                        <q-input
                                            v-model="createForm.fecha_entrada"
                                            outlined
                                            dense
                                            label="Entrada *"
                                            mask="####-##-##"
                                            hide-bottom-space
                                            @update:model-value="onCreateStayChange"
                                        >
                                            <template #append>
                                                <q-icon name="event" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                        <q-date
                                                            v-model="createForm.fecha_entrada"
                                                            mask="YYYY-MM-DD"
                                                            @update:model-value="onCreateStayChange"
                                                        >
                                                            <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Cerrar" color="primary" flat />
                                                            </div>
                                                        </q-date>
                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                    <div class="col-5 col-sm-3">
                                        <q-input
                                            v-model.number="createForm.cantidad_noches"
                                            outlined
                                            dense
                                            type="number"
                                            min="1"
                                            label="Noches *"
                                            hide-bottom-space
                                            @update:model-value="onCreateStayChange"
                                        />
                                    </div>
                                    <div class="col-7 col-sm-4">
                                        <div class="reserva-salida">
                                            <div class="reserva-salida-label">Salida</div>
                                            <div class="reserva-salida-value">{{ fechaSalidaCalculada || '—' }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="reserva-block">
                                <div class="reserva-block-label">Ocupación</div>
                                <div class="row q-col-gutter-md items-end">
                                    <div class="col-5 col-sm-4">
                                        <q-input
                                            v-model.number="createForm.cantidad_personas"
                                            outlined
                                            dense
                                            type="number"
                                            min="1"
                                            label="Personas *"
                                            hide-bottom-space
                                            @update:model-value="onCreatePersonasChange"
                                        />
                                    </div>
                                    <div class="col-7 col-sm-8">
                                        <div class="reserva-camas-meta">
                                            Camas * · <strong>{{ plazasCamasCreate }}</strong> plazas /
                                            <strong>{{ createForm.cantidad_personas || 0 }}</strong> pers.
                                        </div>
                                    </div>
                                    <div class="col-4">
                                        <q-input
                                            v-model.number="createForm.camas.matrimonial"
                                            outlined
                                            dense
                                            type="number"
                                            min="0"
                                            label="Matrimonial"
                                            hide-bottom-space
                                        />
                                    </div>
                                    <div class="col-4">
                                        <q-input
                                            v-model.number="createForm.camas.twin"
                                            outlined
                                            dense
                                            type="number"
                                            min="0"
                                            label="Twin"
                                            hide-bottom-space
                                        />
                                    </div>
                                    <div class="col-4">
                                        <q-input
                                            v-model.number="createForm.camas.single"
                                            outlined
                                            dense
                                            type="number"
                                            min="0"
                                            label="Single"
                                            hide-bottom-space
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="reserva-block reserva-block--last">
                                <div class="reserva-block-label">Género</div>
                                <div class="row q-col-gutter-md">
                                    <template v-if="selectedCreateHabitacionTipo === 'privada'">
                                        <div
                                            v-for="(_, idx) in createForm.generos"
                                            :key="`cg-${idx}`"
                                            class="col-12 col-sm-6"
                                        >
                                            <q-select
                                                v-model="createForm.generos[idx]"
                                                :options="generoOptions"
                                                emit-value
                                                map-options
                                                outlined
                                                dense
                                                :label="`Persona ${idx + 1} *`"
                                                hide-bottom-space
                                                @update:model-value="checkCreateDisponibilidad"
                                            />
                                        </div>
                                    </template>
                                    <div v-else class="col-12 col-sm-6">
                                        <q-select
                                            v-model="createForm.genero"
                                            :options="generoOptions"
                                            emit-value
                                            map-options
                                            outlined
                                            dense
                                            label="Género *"
                                            hide-bottom-space
                                            @update:model-value="checkCreateDisponibilidad"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section class="reserva-pane">
                            <div class="reserva-pane-title">Cliente y llegada</div>

                            <div class="reserva-block">
                                <div class="row q-col-gutter-md">
                                    <div class="col-12">
                                        <q-input v-model="createForm.cliente_nombre" outlined dense label="Nombre del cliente *" hide-bottom-space />
                                    </div>
                                    <div class="col-12">
                                        <q-input v-model="createForm.agencia" outlined dense label="Agencia" hide-bottom-space />
                                    </div>
                                </div>
                            </div>

                            <div class="reserva-block">
                                <div class="reserva-block-label">Llegada</div>
                                <div class="row q-col-gutter-md">
                                    <div class="col-12 col-sm-5">
                                        <q-input
                                            v-model="createForm.hora_llegada"
                                            outlined
                                            dense
                                            label="Hora llegada (24h)"
                                            mask="##:##"
                                            placeholder="HH:mm"
                                            hide-bottom-space
                                        >
                                            <template #append>
                                                <q-icon name="access_time" class="cursor-pointer">
                                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                                        <q-time v-model="createForm.hora_llegada" format24h mask="HH:mm">
                                                            <div class="row items-center justify-end">
                                                                <q-btn v-close-popup label="Cerrar" color="primary" flat dense />
                                                            </div>
                                                        </q-time>
                                                    </q-popup-proxy>
                                                </q-icon>
                                            </template>
                                        </q-input>
                                    </div>
                                    <div class="col-12 col-sm-7">
                                        <q-input v-model="createForm.vuelo" outlined dense label="Vuelo" hide-bottom-space />
                                    </div>
                                    <div class="col-12">
                                        <div class="reserva-toggles">
                                            <q-toggle v-model="createForm.taxi_llegada" dense color="primary" label="Taxi llegada" />
                                            <q-toggle v-model="createForm.taxi_salida" dense color="primary" label="Taxi salida" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="reserva-block reserva-block--last">
                                <q-input
                                    v-model="createForm.notas"
                                    outlined
                                    dense
                                    type="textarea"
                                    :rows="3"
                                    label="Notas"
                                    hide-bottom-space
                                    class="reserva-notas"
                                />
                            </div>

                            <div class="reserva-block reserva-block--last">
                                <q-banner
                                    v-if="disponibilidad"
                                    dense
                                    rounded
                                    class="reserva-banner"
                                    :class="disponibilidad.disponible ? 'bg-positive text-white' : 'bg-negative text-white'"
                                >
                                    <template v-if="disponibilidad.disponible">
                                        Disponible · Capacidad {{ disponibilidad.capacidad }} ·
                                        Ocupado {{ disponibilidad.ocupado }} · Restante {{ disponibilidad.restante }}
                                    </template>
                                    <template v-else>
                                        {{ disponibilidad.mensaje || 'Sin disponibilidad.' }}
                                    </template>
                                </q-banner>
                                <div v-else class="reserva-banner-placeholder text-caption text-grey-6">
                                    Complete habitación, fechas, personas y género para verificar disponibilidad.
                                </div>
                            </div>
                        </section>
                    </div>
                </q-card-section>

                <q-card-actions align="right" class="q-px-md q-pb-md">
                    <q-btn flat label="Cerrar" v-close-popup />
                    <q-btn
                        color="primary"
                        unelevated
                        :label="editingReservaId ? 'Guardar cambios' : 'Crear reserva'"
                        :loading="saving"
                        :disable="disponibilidad && !disponibilidad.disponible"
                        @click="saveCreateReserva"
                    />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Notify, date as qdate } from 'quasar'
import { api } from 'src/boot/axios'
import { useProyectoStore } from 'src/stores/proyecto-store'
import { useAuthStore } from 'src/stores/auth-store'
import { useBrandStore } from 'src/stores/brand-store'
import {
    emptyCamas,
    formatCamasResumen,
    formatGenerosResumen,
    formatTaxiAlerta,
    formatTaxiAlertaCorta,
    formatTaxiResumen,
    hasMissingTaxi,
    hasTaxi,
    plazasFromCamas,
    syncGenerosList
} from 'src/assets/js/util/reservaFormHelpers'
import {
    downloadBlob,
    printPdfBlob
} from 'src/assets/js/util/calendarPdfExport'

defineOptions({ name: 'CalendarioReservasPage' })

const route = useRoute()
const router = useRouter()
const proyectoStore = useProyectoStore()
const authStore = useAuthStore()
const brandStore = useBrandStore()
const brandInitial = computed(() => String(brandStore.name || 'R').trim().charAt(0).toUpperCase() || 'R')
const canManage = computed(() => authStore.hasPermission('gestionar_reservas'))
let skipMonthWatch = false

const loading = ref(false)
const rooms = ref([])
const reservas = ref([])
const selectedDate = ref(formatLocalDate(new Date()))
const viewMode = ref('libro')
const search = ref('')
const selectedHabitacionIds = ref([])
const detailOpen = ref(false)
const metricsOpen = ref(false)
const activeReserva = ref(null)
const dayDetailList = ref([])
const confirmCancel = ref(false)
const canceling = ref(false)
const confirming = ref(false)
const downloadingPdf = ref(false)
const printingPdf = ref(false)
const createOpen = ref(false)
const editingReservaId = ref(null)
const saving = ref(false)
const disponibilidad = ref(null)
let disponibilidadTimer = null

const canEditActive = computed(() => (
    canManage.value
    && ['pendiente', 'confirmada'].includes(activeReserva.value?.estado)
))

const createForm = reactive({
    habitacion_id: null,
    cliente_nombre: '',
    genero: null,
    generos: [null],
    agencia: '',
    hora_llegada: '',
    vuelo: '',
    taxi_llegada: false,
    taxi_salida: false,
    cantidad_personas: 1,
    camas: emptyCamas(),
    cantidad_noches: 1,
    fecha_entrada: '',
    notas: ''
})

const generoOptions = [
    { label: 'Femenino', value: 'femenino' },
    { label: 'Masculino', value: 'masculino' }
]

const viewOptions = [
    { label: 'Día', value: 'dia' },
    // { label: 'Planificación', value: 'planning' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Mapa', value: 'libro' }
]

const dateLocale = {
    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    daysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthsShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
}

const casaActivaId = computed(() => proyectoStore.casaActivaId)
const filtroCasaId = ref(proyectoStore.casaActivaId ?? null)
const todayIso = formatLocalDate(new Date())
const monthKey = computed(() => selectedDate.value.slice(0, 7))

const casaFilterOptions = computed(() => {
    const casas = proyectoStore.casas.map((c) => ({ label: c.nombre, value: c.id }))
    if (viewMode.value === 'mensual') return casas
    return [{ label: 'Todas las casas', value: null }, ...casas]
})

const showCasaSections = computed(() => (
    filtroCasaId.value == null && roomsGrouped.value.length > 1
))

const needsCasaBanner = computed(() => (
    viewMode.value === 'mensual' && calendarCasaId.value == null
))

const calendarCasaId = computed(() => {
    if (viewMode.value === 'mensual') {
        return filtroCasaId.value ?? casaActivaId.value ?? proyectoStore.casas[0]?.id ?? null
    }
    return filtroCasaId.value
})

const monthLabel = computed(() => {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    const label = parsed.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
})

const monthParts = computed(() => {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    const month = parsed.toLocaleDateString('es-ES', { month: 'long' })
    return {
        month: month.charAt(0).toUpperCase() + month.slice(1),
        year: parsed.getFullYear()
    }
})

const detailLabel = computed(() => {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    return parsed.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
})

const roomsGrouped = computed(() => {
    const map = new Map()
    for (const room of rooms.value) {
        const key = Number(room.casa_id) || 0
        if (!map.has(key)) {
            map.set(key, {
                casa_id: key,
                casa_nombre: room.casa_nombre || 'Casa',
                rooms: []
            })
        }
        map.get(key).rooms.push(room)
    }
    return [...map.values()]
})

const visibleRoomsGrouped = computed(() => (
    roomsGrouped.value
        .map((grupo) => ({
            ...grupo,
            rooms: grupo.rooms.filter((r) => selectedHabitacionIds.value.includes(r.id))
        }))
        .filter((grupo) => grupo.rooms.length)
))

const visibleRooms = computed(() => visibleRoomsGrouped.value.flatMap((grupo) => grupo.rooms))

const planningRows = computed(() => {
    const rows = []
    for (const grupo of visibleRoomsGrouped.value) {
        if (showCasaSections.value) {
            rows.push({
                type: 'casa',
                key: `casa-${grupo.casa_id}`,
                casa_nombre: grupo.casa_nombre
            })
        }
        for (const room of grupo.rooms) {
            rows.push({ type: 'room', key: `room-${room.id}`, room })
        }
    }
    return rows
})

const legend = computed(() =>
    visibleRooms.value.map((r) => ({
        key: `room-${r.id}`,
        label: showCasaSections.value && r.casa_nombre ? `${r.casa_nombre} · ${r.nombre}` : r.nombre,
        color: roomColor(r)
    }))
)

const habitacionOptions = computed(() =>
    rooms.value
        .filter((h) => h.activo !== false)
        .map((h) => ({
            label: showCasaSections.value && h.casa_nombre
                ? `${h.casa_nombre} · ${h.nombre} (${h.tipo}, cap. ${h.capacidad})`
                : `${h.nombre} (${h.tipo}, cap. ${h.capacidad})`,
            value: h.id
        }))
)

const selectedCreateHabitacionTipo = computed(() => {
    const room = rooms.value.find((h) => h.id === createForm.habitacion_id)
    return room?.tipo || null
})

const plazasCamasCreate = computed(() => plazasFromCamas(createForm.camas))

const generoCreateDisponibilidad = computed(() => {
    if (selectedCreateHabitacionTipo.value === 'privada') {
        return createForm.generos.find((g) => g) || null
    }
    return createForm.genero
})

const fechaSalidaCalculada = computed(() => {
    if (!createForm.fecha_entrada || !createForm.cantidad_noches || createForm.cantidad_noches < 1) {
        return ''
    }
    const parts = String(createForm.fecha_entrada).split('-').map(Number)
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
        return ''
    }
    const start = new Date(parts[0], parts[1] - 1, parts[2])
    start.setDate(start.getDate() + Number(createForm.cantidad_noches))
    return formatLocalDate(start)
})

const enrichedReservas = computed(() => {
    const roomMap = Object.fromEntries(rooms.value.map((r) => [r.id, r]))
    return (reservas.value || [])
        .filter((r) => r.estado === 'confirmada' || r.estado === 'pendiente')
        .map((r) => {
            const room = r.habitacion || roomMap[r.habitacion_id] || {}
            return {
                ...r,
                taxi_llegada: Boolean(r.taxi_llegada),
                taxi_salida: Boolean(r.taxi_salida),
                habitacion_nombre: room.nombre || 'Habitación',
                habitacion_tipo: room.tipo || 'privada',
                habitacion_color: room.color || roomColor(roomMap[r.habitacion_id] || room)
            }
        })
})

const filteredReservas = computed(() => {
    const q = (search.value || '').trim().toLowerCase()
    return enrichedReservas.value.filter((r) => {
        if (selectedHabitacionIds.value.length && !selectedHabitacionIds.value.includes(r.habitacion_id)) {
            return false
        }
        if (!q) return true
        return (
            r.cliente_nombre?.toLowerCase().includes(q)
            || r.habitacion_nombre?.toLowerCase().includes(q)
            || r.agencia?.toLowerCase().includes(q)
        )
    })
})

const dayEventsMap = computed(() => {
    const map = {}
    for (const r of filteredReservas.value) {
        const start = qdate.extractDate(r.fecha_entrada, 'YYYY-MM-DD')
        const end = qdate.extractDate(r.fecha_salida, 'YYYY-MM-DD')
        const cursor = new Date(start)
        while (cursor < end) {
            const key = formatLocalDate(cursor)
            if (!map[key]) map[key] = []
            map[key].push(r)
            cursor.setDate(cursor.getDate() + 1)
        }
    }
    for (const key of Object.keys(map)) {
        map[key].sort(compareByHoraLlegada)
    }
    return map
})

const monthDays = computed(() => {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    const start = new Date(parsed.getFullYear(), parsed.getMonth(), 1)
    const end = new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0)
    const days = []
    const cur = new Date(start)
    while (cur <= end) {
        days.push(formatLocalDate(cur))
        cur.setDate(cur.getDate() + 1)
    }
    return days
})

const planningDays = computed(() => {
    if (viewMode.value === 'dia') {
        return [selectedDate.value]
    }
    return monthDays.value
})

const bookDays = computed(() => monthDays.value)

const gridStyle = computed(() => ({
    gridTemplateColumns: `180px repeat(${planningDays.value.length}, minmax(${viewMode.value === 'dia' ? '220px' : '120px'}, 1fr))`
}))

const bookGridStyle = computed(() => ({
    gridTemplateColumns: `72px repeat(${Math.max(visibleRooms.value.length, 1)}, minmax(140px, 1fr))`
}))

const stats = computed(() => {
    // Solo reservas con ≥1 noche ocupada en el mes visible (no cruce “fantasma” del API)
    const idsConfirmadas = new Set()
    const idsPendientes = new Set()
    for (const day of monthDays.value) {
        for (const r of dayEventsMap.value[day] || []) {
            if (r.estado === 'confirmada') idsConfirmadas.add(r.id)
            if (r.estado === 'pendiente') idsPendientes.add(r.id)
        }
    }
    const confirmadas = idsConfirmadas.size
    const pendientes = idsPendientes.size

    let parciales = 0
    for (const room of visibleRooms.value) {
        for (const cell of room.dias || []) {
            if (cell.estado === 'parcial') parciales += 1
        }
    }

    // Igual que el dashboard de Impuestos: noches-habitación confirmadas ÷ (habitaciones de la casa × días del mes)
    let occupiedSlots = 0
    let totalSlots = 0
    for (const room of rooms.value) {
        for (const cell of room.dias || []) {
            totalSlots += 1
            if ((cell.reservas || []).some((r) => r.estado === 'confirmada')) occupiedSlots += 1
        }
    }

    return { confirmadas, pendientes, parciales, occupiedSlots, totalSlots }
})

const occupancyPct = computed(() => {
    if (!stats.value.totalSlots) return 0
    return Math.min(100, Math.round((stats.value.occupiedSlots / stats.value.totalSlots) * 1000) / 10)
})

const occupancyLabel = computed(() => `${occupancyPct.value}% de noches-habitación ocupadas (confirmadas)`)

const metricCards = computed(() => [
    { label: 'Confirmadas', value: stats.value.confirmadas, icon: 'event_available', tone: 'wine' },
    { label: 'Pendientes', value: stats.value.pendientes, icon: 'hourglass_top', tone: 'warn' },
    { label: 'Privadas', value: filteredReservas.value.filter((r) => r.habitacion_tipo === 'privada').length, icon: 'lock', tone: 'blue' },
    { label: 'Compartidas', value: filteredReservas.value.filter((r) => r.habitacion_tipo === 'compartida').length, icon: 'groups', tone: 'violet' }
])

const typeBars = computed(() => {
    const total = Math.max(filteredReservas.value.length, 1)
    const privada = filteredReservas.value.filter((r) => r.habitacion_tipo === 'privada').length
    const compartida = filteredReservas.value.filter((r) => r.habitacion_tipo === 'compartida').length
    return [
        { label: 'Privadas', value: privada, ratio: privada / total },
        { label: 'Compartidas', value: compartida, ratio: compartida / total }
    ]
})

watch([filtroCasaId, monthKey, viewMode], () => {
    if (skipMonthWatch) return
    loadData()
})

watch(viewMode, (mode) => {
    if (mode !== 'mensual' || filtroCasaId.value != null) return
    const fallback = casaActivaId.value ?? proyectoStore.casas[0]?.id ?? null
    if (fallback == null) return
    skipMonthWatch = true
    filtroCasaId.value = fallback
    skipMonthWatch = false
    Notify.create({
        type: 'info',
        message: 'La vista mensual muestra una sola casa.'
    })
})

watch(
    () => [route.query.reserva_id, route.query.fecha],
    () => {
        applyReservaDeepLink()
    }
)

watch(rooms, (list) => {
    if (!list.length) {
        selectedHabitacionIds.value = []
        return
    }
    if (!selectedHabitacionIds.value.length) {
        selectedHabitacionIds.value = list.map((r) => r.id)
    }
}, { immediate: true })

function formatLocalDate(value) {
    const d = value instanceof Date ? value : new Date(value)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function isWeekend(iso) {
    const weekday = qdate.extractDate(iso, 'YYYY-MM-DD').getDay()
    return weekday === 0 || weekday === 6
}

function weekdayShort(iso) {
    const d = qdate.extractDate(iso, 'YYYY-MM-DD')
    return d.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '').toUpperCase()
}

/** "1 oct" */
function formatDayShort(iso) {
    if (!iso) return '—'
    const d = qdate.extractDate(iso, 'YYYY-MM-DD')
    return `${d.getDate()} ${dateLocale.monthsShort[d.getMonth()].toLowerCase()}`
}

/** "Jue, 1 oct" */
function formatDayLong(iso) {
    if (!iso) return '—'
    const d = qdate.extractDate(iso, 'YYYY-MM-DD')
    return `${dateLocale.daysShort[d.getDay()]}, ${formatDayShort(iso)}`
}

function formatYear(iso) {
    return iso ? String(iso).slice(0, 4) : ''
}

function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return '?'
    const first = parts[0][0] || ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0][1] || '')
    return `${first}${last}`.toUpperCase()
}

function taxiFlags(ev) {
    return [
        { key: 'llegada', letter: 'L', label: 'Taxi llegada', ok: Boolean(ev?.taxi_llegada) },
        { key: 'salida', letter: 'S', label: 'Taxi salida', ok: Boolean(ev?.taxi_salida) }
    ]
}

function monthDayClass({ scope }) {
    const weekday = Number(scope?.timestamp?.weekday)
    return { 'is-weekend': weekday === 0 || weekday === 6 }
}

function compareByHoraLlegada(a, b) {
    const ha = normalizeHora(a?.hora_llegada)
    const hb = normalizeHora(b?.hora_llegada)
    if (ha === hb) {
        return String(a?.cliente_nombre || '').localeCompare(String(b?.cliente_nombre || ''), 'es')
    }
    if (ha === null) return 1
    if (hb === null) return -1
    return ha < hb ? -1 : 1
}

function normalizeHora(value) {
    if (!value || typeof value !== 'string') return null
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/)
    if (!match) return null
    const hh = String(match[1]).padStart(2, '0')
    const mm = match[2]
    return `${hh}:${mm}`
}

function roomColor(roomOrEv) {
    const color = roomOrEv?.habitacion_color || roomOrEv?.color
    if (typeof color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(color)) {
        return color
    }
    return '#7a1f2b'
}

/** Tint derived from the theme surface so the cards stay readable in light and dark mode. */
function roomToneStyle(ev) {
    const color = roomColor(ev)
    return {
        '--room-color': color,
        '--room-border': `color-mix(in srgb, ${color} 35%, transparent)`,
        background: `color-mix(in srgb, ${color} 14%, var(--plan-day))`,
        borderLeft: `3px solid ${color}`
    }
}

function cellReservas(roomId, day) {
    return (dayEventsMap.value[day] || []).filter((r) => r.habitacion_id === roomId)
}

function selectAllRooms() {
    selectedHabitacionIds.value = rooms.value.map((r) => r.id)
}

function shiftPeriod(delta) {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    if (viewMode.value === 'dia') {
        parsed.setDate(parsed.getDate() + delta)
    } else {
        parsed.setMonth(parsed.getMonth() + delta, 1)
    }
    selectedDate.value = formatLocalDate(parsed)
}

function goToday() {
    selectedDate.value = formatLocalDate(new Date())
}

function onMiniDateChange() {
    // selectedDate already updated; month watch reloads if needed
}

function onMonthClick({ scope }) {
    const day = scope?.timestamp?.date
    if (!day) return
    selectedDate.value = day
    openDayDetail(day)
}

function openDayDetail(day) {
    selectedDate.value = day
    activeReserva.value = null
    confirmCancel.value = false
    dayDetailList.value = dayEventsMap.value[day] || []
    detailOpen.value = true
}

function openReserva(ev) {
    activeReserva.value = ev
    confirmCancel.value = false
    dayDetailList.value = []
    detailOpen.value = true
}

async function clearReservaQuery() {
    if (route.query.reserva_id === undefined && route.query.fecha === undefined) return
    const nextQuery = { ...route.query }
    delete nextQuery.reserva_id
    delete nextQuery.fecha
    await router.replace({ query: nextQuery })
}

async function applyReservaDeepLink() {
    const id = Number(route.query.reserva_id)
    if (!Number.isFinite(id) || id <= 0) return

    const fechaRaw = String(route.query.fecha || '').slice(0, 10)
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(fechaRaw) ? fechaRaw : null

    if (fecha) {
        const monthChanged = selectedDate.value.slice(0, 7) !== fecha.slice(0, 7)
        selectedDate.value = fecha
        if (monthChanged) {
            skipMonthWatch = true
            try {
                await loadData()
            } finally {
                skipMonthWatch = false
            }
        }
    }

    const roomMap = Object.fromEntries(rooms.value.map((r) => [r.id, r]))
    const raw = (reservas.value || []).find((r) => Number(r.id) === id)
    if (!raw) {
        Notify.create({
            type: 'warning',
            message: 'No se encontró esa reserva en el calendario del mes actual.',
        })
        await clearReservaQuery()
        return
    }

    if (
        selectedHabitacionIds.value.length
        && !selectedHabitacionIds.value.includes(raw.habitacion_id)
    ) {
        selectedHabitacionIds.value = [...selectedHabitacionIds.value, raw.habitacion_id]
    }

    const room = raw.habitacion || roomMap[raw.habitacion_id] || {}
    openReserva({
        ...raw,
        taxi_llegada: Boolean(raw.taxi_llegada),
        taxi_salida: Boolean(raw.taxi_salida),
        habitacion_nombre: room.nombre || 'Habitación',
        habitacion_tipo: room.tipo || 'privada',
        habitacion_color: room.color || roomColor(roomMap[raw.habitacion_id] || room),
    })
    await clearReservaQuery()
}

function resetDetailState() {
    confirmCancel.value = false
    canceling.value = false
    confirming.value = false
}

function viewModeLabel() {
    const opt = viewOptions.find((o) => o.value === viewMode.value)
    return opt?.label || viewMode.value
}

function buildExportTitle() {
    const casa = calendarCasaId.value == null
        ? 'Todas las casas'
        : (proyectoStore.casas.find((c) => Number(c.id) === Number(calendarCasaId.value))?.nombre
            || proyectoStore.casaActiva?.nombre)
        || 'Casa'
    const period = viewMode.value === 'dia' ? selectedDate.value : monthLabel.value
    return `${casa} · ${period} · ${viewModeLabel()}`
}

function buildExportFilename() {
    const safe = String(monthKey.value || selectedDate.value || 'calendario').replace(/[^\w.-]+/g, '_')
    return `calendario_${viewMode.value}_${safe}.pdf`
}

async function withExpandedCalendar(busyRef, run) {
    busyRef.value = true
    try {
        return await run()
    } finally {
        busyRef.value = false
    }
}

function currentRange() {
    const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
    const desde = formatLocalDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
    const hasta = formatLocalDate(new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0))
    return { desde, hasta }
}

async function requestCalendarPdf() {
    if (loading.value) {
        throw new Error('El calendario aún no está listo.')
    }
    const { desde, hasta } = currentRange()
    if (viewMode.value === 'mensual' && calendarCasaId.value == null) {
        throw new Error('Seleccione una casa para exportar la vista mensual.')
    }
    const params = {
        casa_id: calendarCasaId.value ?? undefined,
        desde,
        hasta,
        view_mode: viewMode.value,
        selected_date: selectedDate.value,
        habitacion_ids: selectedHabitacionIds.value,
        search: search.value || undefined,
    }

    const response = await api.get('/reservas/calendario/pdf', {
        params,
        responseType: 'blob',
        skipScopeParams: true,
    })

    const mime = response.headers['content-type'] || 'application/pdf'
    const blob = new Blob([response.data], { type: mime })
    return { blob, filename: buildExportFilename() }
}

async function parseBlobError(blob) {
    try {
        const text = await blob.text()
        const parsed = JSON.parse(text)
        return parsed?.message
            || Object.values(parsed?.errors || {})?.[0]?.[0]
            || null
    } catch {
        return null
    }
}

async function downloadCalendarPdf() {
    if (downloadingPdf.value || printingPdf.value) return
    try {
        const { blob, filename } = await withExpandedCalendar(downloadingPdf, () => requestCalendarPdf())
        if (blob.type.includes('application/json')) {
            throw new Error((await parseBlobError(blob)) || 'No se pudo generar el PDF.')
        }
        downloadBlob(blob, filename)
        Notify.create({ type: 'positive', message: 'PDF descargado.' })
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error?.message || 'No se pudo generar el PDF.'
        })
    }
}

async function printCalendarPdf() {
    if (downloadingPdf.value || printingPdf.value) return
    try {
        const { blob } = await withExpandedCalendar(printingPdf, () => requestCalendarPdf())
        if (blob.type.includes('application/json')) {
            throw new Error((await parseBlobError(blob)) || 'No se pudo generar el PDF.')
        }
        await printPdfBlob(blob)
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error?.message || 'No se pudo imprimir el PDF.'
        })
    }
}

function estadoLabel(estado) {
    if (estado === 'pendiente') return 'Pendiente a confirmar'
    if (estado === 'confirmada') return 'Confirmada'
    if (estado === 'cancelada') return 'Cancelada'
    return (estado || '—').toUpperCase()
}

async function confirmarReservaActiva() {
    if (!activeReserva.value?.id || confirming.value) return
    if (activeReserva.value.estado !== 'pendiente') return

    confirming.value = true
    try {
        const { data } = await api.patch(`/reservas/${activeReserva.value.id}/confirmar`)
        Notify.create({ type: 'positive', message: 'Reserva confirmada.' })
        activeReserva.value = {
            ...activeReserva.value,
            ...(data.data || {}),
            estado: 'confirmada',
            habitacion_nombre: activeReserva.value.habitacion_nombre
        }
        await loadData()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message
                || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                || 'No se pudo confirmar la reserva.'
        })
    } finally {
        confirming.value = false
    }
}

async function confirmCancelReserva() {
    if (!activeReserva.value?.id || canceling.value) return

    canceling.value = true
    try {
        await api.patch(`/reservas/${activeReserva.value.id}/cancelar`)
        Notify.create({ type: 'positive', message: 'Reserva cancelada.' })
        detailOpen.value = false
        activeReserva.value = null
        confirmCancel.value = false
        await loadData()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message || 'No se pudo cancelar la reserva.'
        })
    } finally {
        canceling.value = false
    }
}

function onPlanningCellClick(room, day) {
    const list = cellReservas(room.id, day)
    if (list.length) {
        openDayDetail(day)
        return
    }
    if (canManage.value) {
        goCreate(room.id, day)
    }
}

function onBookCellClick(room, day) {
    const list = cellReservas(room.id, day)
    if (list.length === 1) {
        openReserva(list[0])
        return
    }
    if (list.length > 1) {
        openDayDetail(day)
        return
    }
    if (canManage.value) {
        goCreate(room.id, day)
    }
}

function goCreate(habitacionId, fecha) {
    detailOpen.value = false
    confirmCancel.value = false
    editingReservaId.value = null
    disponibilidad.value = null
    createForm.habitacion_id = habitacionId || null
    createForm.cliente_nombre = ''
    createForm.genero = null
    createForm.generos = [null]
    createForm.agencia = ''
    createForm.hora_llegada = ''
    createForm.vuelo = ''
    createForm.taxi_llegada = false
    createForm.taxi_salida = false
    createForm.cantidad_personas = 1
    createForm.camas = emptyCamas()
    createForm.cantidad_noches = 1
    createForm.fecha_entrada = fecha || selectedDate.value || formatLocalDate(new Date())
    createForm.notas = ''
    if (selectedCreateHabitacionTipo.value === 'privada') {
        createForm.generos = syncGenerosList([], 1)
    }
    createOpen.value = true
    checkCreateDisponibilidad()
}

function openEditReserva(reserva) {
    if (!reserva?.id) return

    detailOpen.value = false
    confirmCancel.value = false
    editingReservaId.value = reserva.id
    disponibilidad.value = null
    createForm.habitacion_id = reserva.habitacion_id
    createForm.cliente_nombre = reserva.cliente_nombre || ''
    createForm.genero = reserva.genero || null
    createForm.generos = syncGenerosList(
        Array.isArray(reserva.generos) && reserva.generos.length ? reserva.generos : [reserva.genero || null],
        reserva.cantidad_personas || 1
    )
    createForm.agencia = reserva.agencia || ''
    createForm.hora_llegada = reserva.hora_llegada ? String(reserva.hora_llegada).slice(0, 5) : ''
    createForm.vuelo = reserva.vuelo || ''
    createForm.taxi_llegada = Boolean(reserva.taxi_llegada)
    createForm.taxi_salida = Boolean(reserva.taxi_salida)
    createForm.cantidad_personas = reserva.cantidad_personas || 1
    createForm.camas = { ...emptyCamas(), ...(reserva.camas || {}) }
    createForm.cantidad_noches = reserva.cantidad_noches || 1
    createForm.fecha_entrada = String(reserva.fecha_entrada || '').slice(0, 10)
    createForm.notas = reserva.notas || ''
    createOpen.value = true
    checkCreateDisponibilidad()
}

function onCreateStayChange() {
    checkCreateDisponibilidad()
}

function onCreatePersonasChange() {
    const size = Math.max(1, Number(createForm.cantidad_personas) || 1)
    createForm.cantidad_personas = size
    createForm.generos = syncGenerosList(createForm.generos, size)
    checkCreateDisponibilidad()
}

function onCreateHabitacionChange() {
    if (selectedCreateHabitacionTipo.value === 'privada') {
        createForm.generos = syncGenerosList(
            createForm.generos,
            Math.max(1, Number(createForm.cantidad_personas) || 1)
        )
        if (!createForm.generos[0] && createForm.genero) {
            createForm.generos[0] = createForm.genero
        }
    }
    checkCreateDisponibilidad()
}

function checkCreateDisponibilidad() {
    clearTimeout(disponibilidadTimer)
    disponibilidad.value = null

    if (
        !createForm.habitacion_id
        || !createForm.fecha_entrada
        || !createForm.cantidad_noches
        || !createForm.cantidad_personas
        || !generoCreateDisponibilidad.value
    ) {
        return
    }

    disponibilidadTimer = setTimeout(async () => {
        try {
            const { data } = await api.get('/reservas/disponibilidad', {
                params: {
                    habitacion_id: createForm.habitacion_id,
                    fecha_entrada: createForm.fecha_entrada,
                    cantidad_noches: createForm.cantidad_noches,
                    cantidad_personas: createForm.cantidad_personas,
                    genero: generoCreateDisponibilidad.value,
                    exclude_reserva_id: editingReservaId.value || undefined
                },
                skipScopeParams: true
            })
            disponibilidad.value = data.data
        } catch (error) {
            disponibilidad.value = {
                disponible: false,
                mensaje: error.response?.data?.message
                    || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                    || 'No se pudo verificar disponibilidad.'
            }
        }
    }, 250)
}

async function saveCreateReserva() {
    const isPrivada = selectedCreateHabitacionTipo.value === 'privada'
    const generosOk = isPrivada
        ? createForm.generos.length === createForm.cantidad_personas && createForm.generos.every(Boolean)
        : Boolean(createForm.genero)

    if (
        !createForm.habitacion_id
        || !createForm.cliente_nombre
        || !generosOk
        || !createForm.fecha_entrada
        || !createForm.cantidad_noches
        || !createForm.cantidad_personas
    ) {
        Notify.create({ type: 'warning', message: 'Complete los campos obligatorios.' })
        return
    }

    const camasPayload = {
        matrimonial: Number(createForm.camas.matrimonial) || 0,
        twin: Number(createForm.camas.twin) || 0,
        single: Number(createForm.camas.single) || 0
    }

    if (plazasFromCamas(camasPayload) < createForm.cantidad_personas) {
        Notify.create({ type: 'warning', message: 'Las camas no cubren la cantidad de personas.' })
        return
    }

    if (camasPayload.matrimonial + camasPayload.twin + camasPayload.single < 1) {
        Notify.create({ type: 'warning', message: 'Indique al menos una cama.' })
        return
    }

    saving.value = true
    try {
        const payload = {
            habitacion_id: createForm.habitacion_id,
            cliente_nombre: createForm.cliente_nombre,
            genero: isPrivada ? createForm.generos[0] : createForm.genero,
            generos: isPrivada ? createForm.generos : null,
            agencia: createForm.agencia || null,
            hora_llegada: createForm.hora_llegada || null,
            vuelo: createForm.vuelo || null,
            taxi_llegada: Boolean(createForm.taxi_llegada),
            taxi_salida: Boolean(createForm.taxi_salida),
            cantidad_personas: createForm.cantidad_personas,
            camas: camasPayload,
            cantidad_noches: createForm.cantidad_noches,
            fecha_entrada: createForm.fecha_entrada,
            notas: createForm.notas || null
        }

        if (editingReservaId.value) {
            await api.put(`/reservas/${editingReservaId.value}`, payload)
            Notify.create({ type: 'positive', message: 'Reserva actualizada.' })
        } else {
            await api.post('/reservas', payload)
            Notify.create({ type: 'positive', message: 'Reserva creada (pendiente a confirmar).' })
        }
        createOpen.value = false
        editingReservaId.value = null
        await loadData()
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message
                || error.response?.data?.errors?.disponibilidad?.[0]
                || error.response?.data?.errors?.camas?.[0]
                || error.response?.data?.errors?.generos?.[0]
                || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                || 'No se pudo guardar la reserva.'
        })
        await checkCreateDisponibilidad()
    } finally {
        saving.value = false
    }
}

async function loadData() {
    if (viewMode.value === 'mensual' && calendarCasaId.value == null) {
        rooms.value = []
        reservas.value = []
        return
    }

    loading.value = true
    try {
        const parsed = qdate.extractDate(selectedDate.value, 'YYYY-MM-DD')
        const desde = formatLocalDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1))
        const hasta = formatLocalDate(new Date(parsed.getFullYear(), parsed.getMonth() + 1, 0))
        const params = { desde, hasta }
        if (calendarCasaId.value != null) {
            params.casa_id = calendarCasaId.value
        }

        const [calRes, listRes] = await Promise.all([
            api.get('/reservas/calendario', {
                params,
                skipScopeParams: true
            }),
            api.get('/reservas', {
                params,
                skipScopeParams: true
            })
        ])

        rooms.value = calRes.data.data?.habitaciones ?? []
        reservas.value = listRes.data.data ?? []

        const ids = new Set(rooms.value.map((r) => r.id))
        selectedHabitacionIds.value = selectedHabitacionIds.value.filter((id) => ids.has(id))
        if (!selectedHabitacionIds.value.length) {
            selectedHabitacionIds.value = [...ids]
        }
    } catch (error) {
        Notify.create({
            type: 'negative',
            message: error.response?.data?.message
                || Object.values(error.response?.data?.errors || {})?.[0]?.[0]
                || 'No se pudo cargar el calendario.'
        })
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    if (!proyectoStore.initialized) {
        await proyectoStore.refreshCatalog()
    }
    if (filtroCasaId.value == null && casaActivaId.value != null) {
        filtroCasaId.value = casaActivaId.value
    }
    const fechaRaw = String(route.query.fecha || '').slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaRaw)) {
        selectedDate.value = fechaRaw
    }
    skipMonthWatch = true
    try {
        await loadData()
    } finally {
        skipMonthWatch = false
    }
    await applyReservaDeepLink()
})
</script>

<style scoped>
/*
 * Superficies del planning. En body para que los diálogos (teleport)
 * hereden el mismo tema que la página.
 */
:global(body) {
    --plan-surface: var(--app-surface, #ffffff);
    --plan-day: #ffffff;
    --plan-muted-bg: var(--app-surface-muted, #f3ece1);
    --plan-soft: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.06);
    --plan-today-bg: rgba(var(--theme-gold-rgb, 184, 137, 59), 0.12);
    --plan-ink: var(--app-ink, #2b1d1f);
    --plan-ink-2: var(--app-ink-muted, #7b6a62);
    --plan-muted: var(--app-ink-muted, #7b6a62);
    --plan-faint: var(--app-ink-faint, #a89890);
    --plan-border: var(--app-border, rgba(184, 137, 59, 0.18));
    --plan-border-soft: var(--app-gold-soft, rgba(184, 137, 59, 0.1));
    --plan-shadow: var(--app-shadow-md, 0 8px 24px rgba(42, 20, 24, 0.07));
    --plan-cell-shadow: var(--app-shadow-sm, 0 1px 3px rgba(42, 20, 24, 0.05));
    --plan-brand: var(--theme-wine, #7a1f2b);
    --plan-brand-soft: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.35);
    --plan-warn: #b45309;
    --plan-count: #ea580c;
    --plan-outside: #c4b5a8;
    --plan-weekend: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.03);
    --plan-ok-ink: #047857;
    --plan-ok-bg: rgba(16, 185, 129, 0.12);
    --plan-warn-ink: #b45309;
    --plan-warn-bg: rgba(245, 158, 11, 0.14);
    --plan-danger: #dc2626;
    --plan-danger-ink: #b91c1c;
    --plan-danger-bg: rgba(239, 68, 68, 0.12);
}

:global(body.body--dark) {
    --plan-surface: color-mix(in srgb, var(--theme-dark, #241a1c) 92%, #000);
    --plan-day: color-mix(in srgb, var(--theme-dark, #241a1c) 88%, var(--theme-wine-deep, #4a111b));
    --plan-muted-bg: var(--theme-dark-page, #1a1214);
    --plan-soft: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.16);
    --plan-today-bg: rgba(var(--theme-gold-rgb, 184, 137, 59), 0.14);
    --plan-ink: #f1e8dc;
    --plan-ink-2: #e2d5c8;
    --plan-muted: #b3a597;
    --plan-faint: #8a7a70;
    --plan-border: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.22);
    --plan-border-soft: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.12);
    --plan-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
    --plan-cell-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
    --plan-brand: var(--theme-gold-light, #d4af6a);
    --plan-brand-soft: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.45);
    --plan-warn: #fbbf24;
    --plan-count: #fb923c;
    --plan-outside: #8a7a70;
    --plan-weekend: rgba(255, 255, 255, 0.03);
    --plan-ok-ink: #6ee7b7;
    --plan-ok-bg: rgba(16, 185, 129, 0.16);
    --plan-warn-ink: #fcd34d;
    --plan-warn-bg: rgba(245, 158, 11, 0.14);
    --plan-danger: #f87171;
    --plan-danger-ink: #fca5a5;
    --plan-danger-bg: rgba(239, 68, 68, 0.18);
}

.planning-page {
    padding: 12px 16px 24px;
    min-height: calc(100vh - 70px);
    color: var(--plan-ink);
    background: transparent;
}

.planning-shell {
    display: grid;
    grid-template-columns: 288px minmax(0, 1fr);
    gap: 14px;
    align-items: stretch;
}

.planning-sidebar,
.planning-main,
.calendar-panel,
.planning-grid-wrap,
.book-grid-wrap {
    background: var(--plan-surface);
    border: 1px solid var(--plan-border);
    border-radius: 18px;
    box-shadow: var(--plan-shadow);
}

.planning-sidebar {
    padding: 14px;
    position: sticky;
    top: 12px;
}

.sidebar-brand {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 12px;
}

.sidebar-brand-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #0a0a0a;
    color: var(--theme-gold-pale, #efe0bf);
    border: 1.5px solid var(--theme-gold-light, #d4af6a);
    box-shadow: 0 0 0 2px rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.16);
    display: grid;
    place-items: center;
    font-family: var(--app-font-display), Georgia, serif;
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
    object-fit: cover;
}

.sidebar-brand-mark--logo {
    padding: 0;
}

.sidebar-brand-title {
    font-family: var(--app-font-display), Georgia, serif;
    font-weight: 700;
    color: var(--theme-gold-bright, var(--theme-gold-light, #d4af6a));
}

.sidebar-brand-sub {
    font-size: 11px;
    color: var(--plan-faint);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.sidebar-block {
    margin-top: 14px;
}

.sidebar-section-label {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--plan-faint);
    margin-bottom: 8px;
}

.mini-date {
    display: flex;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    border-radius: 14px;
    box-shadow: none;
}

.mini-date :deep(.q-date__content),
.mini-date :deep(.q-date__main),
.mini-date :deep(.q-date__view) {
    min-width: 0;
    width: 100%;
}

.mini-date :deep(.q-date__view) {
    min-height: 236px;
    padding: 8px;
}

.mini-date :deep(.q-date__calendar-days-container) {
    min-height: 172px;
}

.mini-date :deep(.q-date__calendar-item) {
    padding: 0;
}

.mini-date :deep(.q-date__calendar-item .q-btn) {
    font-size: 12px;
}

.room-filters {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.room-filters :deep(.q-checkbox) {
    margin-bottom: 0;
}

.room-check :deep(.q-checkbox__label) {
    color: var(--plan-ink-2);
    font-size: 13px;
}

.workload-card,
.stat-mini {
    border-radius: 12px;
    background: var(--plan-muted-bg);
    border: 1px solid var(--plan-border-soft);
    padding: 10px;
}

.stat-mini-value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.1;
}

.stat-mini-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--plan-muted);
}

.stat-mini--warn .stat-mini-value { color: var(--plan-warn); }
.stat-mini--ok .stat-mini-value { color: var(--plan-brand); }

.planning-main {
    padding: 14px 16px 18px;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.planning-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
}

.toolbar-left,
.toolbar-right,
.view-switch {
    display: flex;
    align-items: center;
    gap: 8px;
}

.month-title {
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--plan-ink);
    min-width: 160px;
}

.casa-filter-select {
    min-width: 180px;
    max-width: 240px;
}

.room-casa-label {
    margin: 8px 0 4px;
    font-size: 0.68rem;
    font-weight: 750;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--app-ink-muted);
}

.book-room-casa {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--app-ink-muted);
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.grid-casa-head {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    font-size: 0.75rem;
    font-weight: 750;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--q-primary);
    background: color-mix(in srgb, var(--q-primary) 8%, transparent);
    border-bottom: 1px solid var(--app-border);
}

.nav-arrow-btn {
    color: var(--plan-ink) !important;
    background: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.08);
    border: 1px solid var(--plan-border);
}

.nav-arrow-btn:hover {
    background: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.14);
    border-color: var(--theme-gold-light, #d4af6a);
    color: var(--theme-gold-light, #d4af6a) !important;
}

.plan-outline-btn {
    border-radius: 10px !important;
    font-weight: 650 !important;
    letter-spacing: 0.04em;
    color: var(--theme-wine, #7a1f2b) !important;
    border: 1px solid rgba(var(--theme-wine-rgb, 122, 31, 43), 0.45) !important;
    background: transparent !important;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.plan-outline-btn :deep(.q-icon) {
    color: inherit !important;
}

.plan-outline-btn:hover {
    border-color: var(--theme-gold, #b8893b) !important;
    color: var(--theme-wine-deep, #4a111b) !important;
    background: rgba(var(--theme-gold-rgb, 184, 137, 59), 0.1) !important;
    box-shadow: 0 0 0 1px rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.25);
}

.hoy-btn {
    border-radius: 999px !important;
    min-width: 52px;
    padding: 0 14px !important;
    text-transform: uppercase;
    font-size: 0.72rem !important;
    letter-spacing: 0.08em;
}

.view-switch .q-btn {
    border-radius: 10px;
    min-width: 88px;
    font-weight: 600;
}

.view-active {
    background: linear-gradient(135deg, var(--theme-wine-light, #8e2a36) 0%, var(--theme-wine, #7a1f2b) 55%, var(--theme-wine-deep, #4a111b) 100%) !important;
    color: #f7efe3 !important;
    border: 1px solid rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.45) !important;
    box-shadow: 0 4px 14px rgba(var(--theme-wine-rgb, 122, 31, 43), 0.28);
}

.search-input {
    min-width: 220px;
}

.create-btn {
    border-radius: 12px;
    font-weight: 650;
    letter-spacing: 0.02em;
    color: #f7efe3 !important;
    background: linear-gradient(135deg, var(--theme-wine-light, #8e2a36) 0%, var(--theme-wine, #7a1f2b) 55%, var(--theme-wine-deep, #4a111b) 100%) !important;
    border: 1px solid rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.4);
    box-shadow: 0 4px 14px rgba(var(--theme-wine-rgb, 122, 31, 43), 0.28);
}

.create-btn:hover {
    box-shadow: 0 6px 18px rgba(var(--theme-wine-rgb, 122, 31, 43), 0.36), 0 0 0 1px rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.35);
}

.legend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin: 12px 0 10px;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--plan-muted);
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.calendar-panel {
    padding: 0;
    overflow: auto;
    max-height: calc(100vh - 210px);
    flex: 1 1 auto;
    min-height: 0;
}

.calendar-export-root {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    flex-direction: column;
}

.calendar-export-root > .calendar-panel {
    min-height: 0;
}

.calendar-export-root.is-exporting .calendar-panel,
.calendar-export-root.is-exporting .book-grid-wrap,
.calendar-export-root.is-exporting .planning-grid-wrap {
    max-height: none !important;
    overflow: visible !important;
    height: auto !important;
}

.calendar-export-root.is-exporting .day-add-btn,
.calendar-export-root.is-exporting .cell-add-btn,
.calendar-export-root.is-exporting .empty-slot,
.calendar-export-root.is-exporting .book-empty {
    display: none !important;
}

.calendar-panel :deep(.ep-month) {
    min-width: 780px;
}

.day-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px;
    height: 26px;
    padding: 0 7px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--plan-ink-2) !important;
}

.day-num.is-today {
    background: var(--plan-brand);
    color: var(--plan-surface) !important;
    font-weight: 800;
    box-shadow: 0 4px 12px var(--plan-brand-soft);
}

.day-num.is-outside {
    color: var(--plan-outside) !important;
    font-weight: 500;
}

/* Contenido de cada día del mes */
.mday {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-height: 88px;
    padding: 2px 6px 6px;
}

.mday-corner {
    position: absolute;
    top: -29px;
    right: 6px;
    height: 24px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.mday-count {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 1px 7px 1px 5px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--plan-muted);
    background: var(--plan-surface);
    border: 1px solid var(--plan-border);
}

.mday-bed-icon {
    width: 15px;
    height: 11px;
    flex-shrink: 0;
    display: block;
}

.day-add-btn {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--plan-brand) 45%, var(--plan-border));
    background: color-mix(in srgb, var(--plan-brand) 10%, var(--plan-surface));
    color: var(--plan-brand);
    cursor: pointer;
    box-shadow: none;
    opacity: 0.9;
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, opacity 0.15s ease;
}

.day-add-btn:hover {
    opacity: 1;
    background: color-mix(in srgb, var(--plan-brand) 18%, var(--plan-surface));
    border-color: var(--plan-brand);
}

.day-add-btn:focus-visible {
    outline: 2px solid var(--plan-brand);
    outline-offset: 1px;
}

:global(body.body--dark) .day-add-btn,
:global(body.app-dark) .day-add-btn {
    background: color-mix(in srgb, var(--plan-brand) 16%, transparent);
    border-color: color-mix(in srgb, var(--plan-brand) 40%, transparent);
    color: color-mix(in srgb, var(--plan-brand) 85%, #fff);
    box-shadow: none;
}

:global(body.body--dark) .day-add-btn:hover,
:global(body.app-dark) .day-add-btn:hover {
    background: color-mix(in srgb, var(--plan-brand) 28%, transparent);
    border-color: var(--plan-brand);
}

.cal-ev {
    appearance: none;
    display: flex;
    align-items: stretch;
    gap: 6px;
    width: 100%;
    min-width: 0;
    padding: 0 6px 0 0;
    border: 0;
    border-radius: 7px;
    overflow: hidden;
    font: inherit;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
    color: var(--plan-ink-2);
    background: color-mix(in srgb, var(--room-color) 11%, transparent);
    transition: background-color 0.15s ease, transform 0.15s ease;
}

.cal-ev:hover {
    background: color-mix(in srgb, var(--room-color) 24%, transparent);
}

.cal-ev:focus-visible {
    outline: 2px solid var(--room-color);
    outline-offset: 1px;
}

.cal-ev-bar {
    align-self: stretch;
    flex-shrink: 0;
    width: 3px;
    background: color-mix(in srgb, var(--room-color) 55%, transparent);
}

.cal-ev-body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1 1 auto;
    min-width: 0;
    padding: 3px 0 4px;
}

.cal-ev-top {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    line-height: 1.25;
}

.cal-ev-taxis {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    flex-shrink: 0;
}

.cal-ev-taxi-icon {
    color: var(--plan-muted);
}

.cal-taxi {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    height: 15px;
    padding: 0 4px 0 5px;
    border-radius: 999px;
    font-size: 9.5px;
    font-weight: 800;
    line-height: 1;
}

.cal-taxi.is-ok {
    color: var(--plan-ok-ink);
    background: var(--plan-ok-bg);
}

.cal-taxi.is-warn {
    color: var(--plan-danger-ink);
    background: var(--plan-danger-bg);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--plan-danger) 45%, transparent);
}

.cal-ev-name {
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
}

.cal-ev.is-arrival {
    color: var(--plan-ink);
    background: color-mix(in srgb, var(--room-color) 22%, transparent);
}

.cal-ev.is-arrival .cal-ev-bar {
    width: 4px;
    background: var(--room-color);
}

.cal-ev.is-arrival .cal-ev-name {
    font-weight: 700;
}

.cal-ev.is-pendiente {
    background: repeating-linear-gradient(
        135deg,
        color-mix(in srgb, var(--room-color) 18%, transparent) 0 6px,
        color-mix(in srgb, var(--room-color) 6%, transparent) 6px 12px
    );
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--plan-warn) 60%, transparent);
}

.cal-ev-time {
    flex-shrink: 0;
    font-size: 11px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--plan-muted);
}

.mday-more {
    appearance: none;
    align-self: flex-start;
    border: 0;
    border-radius: 6px;
    padding: 2px 6px;
    background: transparent;
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    color: var(--plan-brand);
    cursor: pointer;
}

.mday-more:hover {
    background: var(--plan-soft);
}

/* Leyenda de cómo leer las reservas del mes */
.legend-keys {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    font-size: 11px;
    color: var(--plan-muted);
}

.legend-key {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.legend-swatch {
    width: 18px;
    height: 10px;
    border-radius: 3px;
    --room-color: var(--plan-brand);
    background: color-mix(in srgb, var(--room-color) 11%, transparent);
    border-left: 3px solid color-mix(in srgb, var(--room-color) 55%, transparent);
}

.legend-swatch.is-arrival {
    background: color-mix(in srgb, var(--room-color) 22%, transparent);
    border-left-color: var(--room-color);
}

.legend-swatch.is-pendiente {
    background: repeating-linear-gradient(
        135deg,
        color-mix(in srgb, var(--room-color) 18%, transparent) 0 3px,
        color-mix(in srgb, var(--room-color) 6%, transparent) 3px 6px
    );
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--plan-warn) 60%, transparent);
    border-left: 0;
}

.book-name.is-pendiente,
.plan-card.is-pendiente {
    outline: 2px dashed var(--plan-warn);
    outline-offset: -1px;
}

.event-taxi-flags {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.taxi-flag {
    display: inline-flex;
    align-items: center;
    gap: 1px;
    line-height: 1;
}

.taxi-flag-letter {
    font-size: 9px;
    font-weight: 800;
}

.taxi-flag-ok {
    color: var(--plan-ok-ink);
}

.taxi-flag-warn {
    color: var(--plan-danger-ink);
}

.book-taxi-flags {
    margin-top: 2px;
}

.planning-grid-wrap {
    overflow: auto;
    padding: 8px;
}

.book-grid-wrap {
    overflow: auto;
    padding: 8px;
    max-height: calc(100vh - 210px);
}

.book-grid {
    display: grid;
    gap: 0;
    min-width: max-content;
}

.book-corner,
.book-room-head,
.book-day-label,
.book-cell {
    border: 1px solid var(--plan-border-soft);
    background: var(--plan-surface);
}

.book-corner,
.book-room-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--plan-muted-bg);
    padding: 8px;
}

.book-corner,
.book-day-label {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--plan-surface);
}

.book-corner {
    z-index: 3;
    font-size: 12px;
    font-weight: 700;
    color: var(--plan-muted);
    text-transform: uppercase;
    display: flex;
    align-items: center;
}

.book-room-head {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    min-width: 140px;
}

.book-room-head-title {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.book-room-head-name {
    font-weight: 700;
    font-size: 13px;
    color: var(--plan-ink);
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.book-room-head-meta {
    font-size: 10px;
    color: var(--plan-faint);
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.book-day-label {
    padding: 6px 8px;
    text-align: center;
    z-index: 1;
}

.book-day-label.is-today {
    background: var(--plan-today-bg);
    color: var(--plan-brand);
}

.book-cell {
    min-height: 44px;
    padding: 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 3px;
    justify-content: flex-start;
}

.book-cell:hover {
    background: var(--plan-soft);
}

.book-name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    width: 100%;
    border: 1px solid var(--room-border, #b6d5d1);
    border-left: 3px solid var(--room-color, #7a1f2b);
    border-radius: 8px;
    padding: 4px 6px;
    cursor: pointer;
    text-align: left;
    font: inherit;
}

.book-name-text {
    font-size: 12px;
    font-weight: 700;
    color: var(--plan-ink);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.book-name-meta {
    font-size: 10px;
    color: var(--plan-muted);
}

.book-empty {
    flex: 1;
    min-height: 32px;
    border: 1px dashed var(--plan-brand-soft);
    border-radius: 8px;
    display: grid;
    place-items: center;
    color: var(--plan-faint);
    opacity: 0;
    transition: opacity 0.15s ease;
}

.book-cell:hover .book-empty {
    opacity: 1;
}

.cell-add-btn {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    width: 100%;
    min-height: 22px;
    padding: 2px 6px;
    border-radius: 7px;
    border: 1px dashed color-mix(in srgb, var(--plan-brand) 45%, var(--plan-border));
    background: color-mix(in srgb, var(--plan-brand) 6%, var(--plan-surface));
    color: var(--plan-brand);
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    box-shadow: none;
}

.cell-add-btn:hover {
    background: color-mix(in srgb, var(--plan-brand) 14%, var(--plan-surface));
    border-style: solid;
    border-color: var(--plan-brand);
}

.cell-add-btn:focus-visible {
    outline: 2px solid var(--plan-brand);
    outline-offset: 1px;
}

:global(body.body--dark) .cell-add-btn,
:global(body.app-dark) .cell-add-btn {
    background: color-mix(in srgb, var(--plan-brand) 12%, transparent);
    border-color: color-mix(in srgb, var(--plan-brand) 40%, transparent);
    color: color-mix(in srgb, var(--plan-brand) 85%, #fff);
}

:global(body.body--dark) .cell-add-btn:hover,
:global(body.app-dark) .cell-add-btn:hover {
    background: color-mix(in srgb, var(--plan-brand) 24%, transparent);
    border-color: var(--plan-brand);
}

.planning-grid {
    display: grid;
    gap: 0;
    min-width: max-content;
}

.grid-corner,
.grid-day-head,
.grid-room,
.grid-cell {
    border: 1px solid var(--plan-border-soft);
    background: var(--plan-surface);
}

.grid-corner,
.grid-day-head {
    position: sticky;
    top: 0;
    z-index: 2;
    background: var(--plan-muted-bg);
    padding: 8px;
    text-align: center;
}

.grid-corner,
.grid-room {
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--plan-surface);
}

.grid-corner {
    z-index: 3;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: var(--plan-muted);
    text-transform: uppercase;
}

.grid-day-wd {
    font-size: 10px;
    color: var(--plan-faint);
    text-transform: uppercase;
}

.grid-day-num {
    font-weight: 700;
    font-size: 16px;
}

.grid-day-head.is-today {
    background: var(--plan-today-bg);
    color: var(--plan-brand);
}

.grid-room {
    padding: 10px;
    min-height: 88px;
}

.grid-room-name {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    color: var(--plan-ink);
}

.grid-room-meta {
    font-size: 11px;
    color: var(--plan-faint);
}

.grid-cell {
    min-height: 88px;
    padding: 6px;
    cursor: pointer;
}

.grid-cell:hover {
    background: var(--plan-soft);
}

.empty-slot {
    height: 100%;
    min-height: 70px;
    border: 1px dashed var(--plan-brand-soft);
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: var(--plan-faint);
}

.plan-card {
    border-radius: 14px;
    padding: 8px 10px;
    margin-bottom: 6px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
    border: 1px solid var(--room-border, #b6d5d1);
}

.plan-card-top,
.plan-card-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: var(--plan-muted);
}

.plan-card-title {
    font-weight: 700;
    color: var(--plan-ink);
    margin: 4px 0;
    font-size: 13px;
}

.plan-nights,
.plan-tag {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    background: color-mix(in srgb, var(--plan-surface) 70%, transparent);
    border-radius: 999px;
    padding: 1px 6px;
}

.plan-taxi {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    color: #7a1f2b;
    font-size: 10px;
    font-weight: 600;
}

.plan-taxi-warn,
.book-taxi-warn,
.day-taxi-warn {
    color: #c2410c;
    font-weight: 700;
}

.plan-taxi-warn {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 10px;
}

.detail-card,
.metrics-card {
    width: min(560px, 95vw);
    border-radius: 22px !important;
}

.reserva-dialog {
    width: min(1080px, 96vw);
    max-width: 1080px;
    border-radius: 22px !important;
}

.reserva-layout {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    gap: 20px;
    align-items: stretch;
}

.reserva-pane {
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 18px 18px 16px;
    border: 1px solid var(--plan-border);
    border-radius: 16px;
    background: var(--plan-muted-bg);
}

.reserva-pane-title {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--plan-brand);
    margin-bottom: 8px;
}

.reserva-block {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px 0;
    border-bottom: 1px solid var(--plan-border-soft, rgba(var(--theme-gold-rgb), 0.12));
}

.reserva-block--last {
    border-bottom: 0;
    padding-bottom: 0;
    margin-top: auto;
}

.reserva-block-label {
    font-size: 11px;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--plan-faint, var(--app-ink-muted));
}

.reserva-salida {
    min-height: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    padding: 6px 12px;
    border-radius: 10px;
    border: 1px dashed rgba(var(--theme-gold-rgb), 0.28);
    background: rgba(var(--theme-wine-rgb), 0.04);
}

.reserva-salida-label {
    font-size: 10px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--plan-faint, var(--app-ink-muted));
}

.reserva-salida-value {
    font-size: 0.95rem;
    font-weight: 650;
    color: var(--plan-ink, var(--app-ink));
    font-variant-numeric: tabular-nums;
}

.reserva-camas-meta {
    min-height: 40px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px 12px;
    border-radius: 10px;
    background: rgba(var(--theme-wine-rgb), 0.06);
    border: 1px solid rgba(var(--theme-wine-rgb), 0.1);
    color: var(--plan-muted, var(--app-ink-muted));
    font-size: 0.82rem;
}

.reserva-camas-meta strong {
    color: var(--plan-brand, var(--theme-wine));
    font-weight: 700;
}

.reserva-toggles {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 20px;
    min-height: 40px;
    padding: 4px 2px;
}

.reserva-notas {
    width: 100%;
}

.reserva-banner {
    margin: 0;
}

.reserva-banner-placeholder {
    min-height: 48px;
    display: flex;
    align-items: center;
    padding: 10px 12px;
    border-radius: 12px;
    background: var(--plan-border-soft);
    line-height: 1.35;
}

@media (max-width: 900px) {
    .reserva-layout {
        grid-template-columns: 1fr;
    }
}

/* ── Detalle de reserva ── */
.rv-card {
    width: min(520px, 95vw);
    border-radius: 20px !important;
    overflow: hidden;
    background: var(--plan-surface) !important;
    color: var(--plan-ink);
    border: 1px solid var(--plan-border);
}

.rv-hero {
    padding: 14px 18px 18px;
    background: linear-gradient(
        135deg,
        color-mix(in srgb, var(--room-color) 24%, var(--plan-surface)) 0%,
        color-mix(in srgb, var(--room-color) 6%, var(--plan-surface)) 100%
    );
    border-bottom: 1px solid var(--plan-border);
}

.rv-hero-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.rv-close {
    color: var(--plan-muted);
}

.rv-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    color: var(--plan-ink-2);
    background: var(--plan-surface);
    border: 1px solid var(--plan-border);
}

.rv-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--plan-faint);
}

.rv-status.is-confirmada .rv-status-dot {
    background: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.rv-status.is-pendiente .rv-status-dot {
    background: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.22);
}

.rv-guest {
    display: flex;
    align-items: center;
    gap: 14px;
}

.rv-avatar {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: grid;
    place-items: center;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #fff;
    background: var(--room-color);
    box-shadow: 0 8px 20px color-mix(in srgb, var(--room-color) 40%, transparent);
}

.rv-guest-text {
    min-width: 0;
}

.rv-name {
    font-size: 1.3rem;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.02em;
    color: var(--plan-ink);
    overflow-wrap: anywhere;
}

.rv-room {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
    font-size: 13px;
    font-weight: 600;
    color: var(--plan-ink-2);
}

.rv-room-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--room-color);
}

.rv-room-type {
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--plan-muted);
    background: var(--plan-surface);
    border: 1px solid var(--plan-border);
}

.rv-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 62vh;
    overflow: auto;
    padding: 16px 18px 4px;
}

.rv-label {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--plan-faint);
}

.rv-stay {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 10px;
    padding: 14px;
    border-radius: 14px;
    background: var(--plan-muted-bg);
    border: 1px solid var(--plan-border-soft);
}

.rv-stay-col.is-end {
    text-align: right;
}

.rv-date {
    margin-top: 2px;
    font-size: 16px;
    font-weight: 700;
    color: var(--plan-ink);
}

.rv-sub {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 2px;
    font-size: 12px;
    color: var(--plan-muted);
}

.rv-stay-mid {
    position: relative;
    display: flex;
    justify-content: center;
    min-width: 96px;
}

.rv-stay-mid::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    border-top: 2px dashed var(--plan-border);
}

.rv-nights {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
    color: var(--plan-brand);
    background: var(--plan-surface);
    border: 1px solid var(--plan-border);
}

.rv-grid,
.rv-transfers {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.rv-tile {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--plan-border-soft);
}

.rv-tile-icon {
    flex-shrink: 0;
    padding: 6px;
    border-radius: 9px;
    font-size: 18px;
    color: var(--plan-brand);
    background: var(--plan-soft);
}

svg.rv-tile-bed {
    width: 30px;
    height: 30px;
    padding: 7px;
    box-sizing: border-box;
}

.rv-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--plan-ink);
    overflow-wrap: anywhere;
}

.rv-tile-sub {
    font-size: 12px;
    color: var(--plan-muted);
}

.rv-section-title {
    margin-bottom: -4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--plan-faint);
}

.rv-transfer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--plan-border-soft);
}

.rv-transfer-icon {
    color: var(--plan-muted);
}

.rv-transfer-label {
    flex: 1;
    font-size: 13px;
    font-weight: 600;
    color: var(--plan-ink-2);
}

.rv-pill {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
}

.rv-pill.is-ok {
    color: var(--plan-ok-ink);
    background: var(--plan-ok-bg);
}

.rv-pill.is-warn {
    color: var(--plan-warn-ink);
    background: var(--plan-warn-bg);
}

.rv-pill.is-danger {
    color: var(--plan-danger-ink);
    background: var(--plan-danger-bg);
}

.rv-hint {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 12.5px;
    line-height: 1.45;
    color: var(--plan-warn-ink);
    background: var(--plan-warn-bg);
}

.rv-hint-action {
    flex-shrink: 0;
    align-self: center;
    padding: 4px 10px;
    border: 1px solid currentColor;
    border-radius: 999px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 700;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s ease;
}

.rv-hint-action:hover {
    background: color-mix(in srgb, currentColor 12%, transparent);
}

.rv-notes {
    padding: 10px 12px;
    border-radius: 12px;
    white-space: pre-wrap;
    font-size: 13px;
    color: var(--plan-ink-2);
    background: var(--plan-muted-bg);
}

.rv-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    padding: 12px 18px 16px;
    border-top: 1px solid var(--plan-border-soft);
}

.rv-actions .q-btn {
    border-radius: 10px;
    font-weight: 600;
}

.rv-confirm {
    padding: 26px 24px 10px;
    text-align: center;
}

.rv-confirm-icon {
    width: 56px;
    height: 56px;
    margin: 0 auto 12px;
    border-radius: 18px;
    display: grid;
    place-items: center;
    color: #dc2626;
    background: rgba(220, 38, 38, 0.12);
}

.rv-confirm-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--plan-ink);
}

.rv-confirm-text {
    margin-top: 8px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--plan-muted);
}

.rv-day-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px 18px 4px;
}

.rv-day-title {
    margin-top: 2px;
    font-size: 17px;
    font-weight: 700;
    color: var(--plan-ink);
    text-transform: capitalize;
}

.rv-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 22px 0 10px;
    font-size: 13px;
    color: var(--plan-faint);
}

.rv-day-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.rv-day-item {
    appearance: none;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px 10px 0;
    border-radius: 12px;
    border: 1px solid var(--plan-border-soft);
    overflow: hidden;
    font: inherit;
    text-align: left;
    cursor: pointer;
    color: var(--plan-ink);
    background: var(--plan-surface);
    transition: border-color 0.15s ease, background-color 0.15s ease;
}

.rv-day-item:hover {
    border-color: color-mix(in srgb, var(--room-color) 50%, transparent);
    background: color-mix(in srgb, var(--room-color) 8%, var(--plan-surface));
}

.rv-day-bar {
    align-self: stretch;
    width: 4px;
    margin: -10px 0;
    background: var(--room-color);
}

.rv-day-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.rv-day-name {
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.rv-day-meta {
    font-size: 12px;
    color: var(--plan-muted);
}

.rv-day-chevron {
    color: var(--plan-faint);
}

@media (max-width: 520px) {
    .rv-grid,
    .rv-transfers {
        grid-template-columns: 1fr;
    }
}

.metric-tile {
    border-radius: 16px;
    padding: 12px;
    min-height: 110px;
    border: 1px solid transparent;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.metric-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    margin-bottom: 8px;
}

.metric-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--plan-muted, #7b6a62);
}

.metric-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.1;
}

.metric-tile--wine {
    background: linear-gradient(160deg, var(--theme-ivory) 0%, var(--theme-ivory-2) 100%);
    border-color: rgba(var(--theme-wine-rgb), 0.14);
}
.metric-tile--wine .metric-icon {
    background: rgba(var(--theme-wine-rgb), 0.12);
    color: var(--theme-wine);
}
.metric-tile--wine .metric-value {
    color: var(--theme-wine);
}

.metric-tile--warn {
    background: linear-gradient(160deg, #fff7ed 0%, #ffedd5 100%);
    border-color: rgba(194, 65, 12, 0.16);
}
.metric-tile--warn .metric-icon {
    background: rgba(194, 65, 12, 0.12);
    color: #c2410c;
}
.metric-tile--warn .metric-value {
    color: #c2410c;
}

.metric-tile--blue {
    background: linear-gradient(160deg, #eff6ff 0%, #dbeafe 100%);
    border-color: rgba(47, 111, 191, 0.16);
}
.metric-tile--blue .metric-icon {
    background: rgba(47, 111, 191, 0.12);
    color: var(--theme-blue, #2f6fbf);
}
.metric-tile--blue .metric-value {
    color: var(--theme-blue, #2f6fbf);
}

.metric-tile--violet {
    background: linear-gradient(160deg, #f5f3ff 0%, #ede9fe 100%);
    border-color: rgba(107, 45, 139, 0.16);
}
.metric-tile--violet .metric-icon {
    background: rgba(107, 45, 139, 0.12);
    color: var(--theme-violet, #6b2d8b);
}
.metric-tile--violet .metric-value {
    color: var(--theme-violet, #6b2d8b);
}

.metrics-section-label {
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--plan-faint);
    margin-bottom: 8px;
}

:deep(.ep-month) {
    border: 0 !important;
    background: transparent !important;
    color: var(--plan-ink);
}

/*
 * QCalendar fija el ancho de cada día por estilo inline (ancho del root / 7),
 * así que bordes o márgenes reales desbordarían la fila. Las líneas de la
 * rejilla y los fondos se dibujan con un pseudo-elemento.
 */
:deep(.ep-month .q-calendar-month__day),
:deep(.ep-month .q-calendar-month__day.q-current-day),
:deep(.ep-month .q-calendar-month__day.q-outside) {
    background: transparent !important;
    color: var(--plan-ink);
    border: 0 !important;
    padding: 0;
    overflow: visible;
}

:deep(.ep-month .q-calendar-month__day::before) {
    content: '';
    position: absolute;
    inset: 0;
    border-right: 1px solid var(--plan-border-soft);
    border-bottom: 1px solid var(--plan-border-soft);
    background: transparent;
    transition: background-color 0.15s ease;
    pointer-events: none;
}

:deep(.ep-month .q-calendar-month__week--days > .q-calendar-month__day:last-child::before) {
    border-right: 0;
}

:deep(.ep-month .q-calendar-month__week--wrapper:last-child .q-calendar-month__day::before) {
    border-bottom: 0;
}

:deep(.ep-month .q-calendar-month__day > *) {
    position: relative;
    z-index: 1;
}

:deep(.ep-month .q-calendar-month__day.is-weekend::before) {
    background: var(--plan-weekend);
}

:deep(.ep-month .q-calendar-month__day:hover::before) {
    background: var(--plan-soft);
}

:deep(.ep-month .q-calendar-month__day.q-current-day::before) {
    background: var(--plan-today-bg);
}

:deep(.ep-month .q-calendar-month__day.q-outside::before) {
    background: var(--plan-muted-bg);
}

:deep(.ep-month .q-calendar-month__day.q-outside .q-calendar-month__day--content) {
    opacity: 0.55;
}

:deep(.ep-month .q-calendar-month__week--wrapper),
:deep(.ep-month .q-calendar-month__week--days),
:deep(.ep-month .q-calendar-month__body) {
    border: 0 !important;
    overflow: visible;
}

:deep(.ep-month .q-calendar-month__head--weekday) {
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
    color: var(--plan-faint) !important;
    border: 0 !important;
    background: transparent !important;
}

:deep(.ep-month .q-calendar-month__head) {
    border: 0 !important;
    border-bottom: 1px solid var(--plan-border) !important;
    margin: 0;
    padding: 10px 0 8px;
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--plan-surface) !important;
    color: var(--plan-faint);
}

:deep(.ep-month .q-calendar-month__day--label) {
    min-width: auto !important;
    min-height: auto !important;
    padding: 0 !important;
    margin: 6px 0 2px 6px !important;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    border-radius: 8px !important;
}

:deep(.ep-month .q-calendar-month__day--label__wrapper) {
    justify-content: flex-start !important;
}

@media (max-width: 1100px) {
    .planning-shell {
        grid-template-columns: 1fr;
    }

    .planning-sidebar {
        position: static;
        order: 2;
    }

    .search-input {
        min-width: 160px;
    }
}

@media (max-width: 700px) {
    .planning-page {
        padding: 6px 2px 16px;
    }

    .planning-main {
        padding: 10px;
    }

    .planning-toolbar {
        gap: 8px;
    }

    .toolbar-left {
        width: 100%;
    }

    .month-title {
        flex: 1;
        min-width: 0;
        font-size: 1.1rem;
    }

    .view-switch {
        width: 100%;
    }

    .view-switch .q-btn {
        flex: 1;
        min-width: 0;
    }

    .toolbar-right {
        width: 100%;
        flex-wrap: wrap;
    }

    .search-input {
        flex: 1 1 100%;
        min-width: 0;
    }

    .toolbar-right .q-btn {
        flex: 1;
    }

    .legend-row {
        gap: 8px;
        margin: 10px 0 8px;
    }

    .calendar-panel,
    .book-grid-wrap {
        max-height: calc(100vh - 160px);
    }
}
</style>

<style>
body.body--dark .planning-page .text-grey-6,
body.body--dark .planning-page .text-grey-7,
body.body--dark .planning-page .text-grey-8,
body.body--dark .detail-card .text-grey-6,
body.body--dark .detail-card .text-grey-7,
body.body--dark .detail-card .text-grey-8,
body.body--dark .metrics-card .text-grey-6,
body.body--dark .metrics-card .text-grey-7,
body.body--dark .reserva-dialog .text-grey-6,
body.body--dark .reserva-dialog .text-grey-7,
body.body--dark .reserva-dialog .text-grey-8 {
    color: var(--app-ink-muted, #b3a597) !important;
}

body.body--dark .reserva-dialog .reserva-pane,
body.app-dark .reserva-dialog .reserva-pane {
    background:
        radial-gradient(120% 80% at 0% 0%, rgba(var(--theme-wine-rgb), 0.18), transparent 55%),
        var(--theme-dark-page) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.18) !important;
}

body.body--dark .reserva-dialog .reserva-pane-title,
body.app-dark .reserva-dialog .reserva-pane-title {
    color: var(--theme-gold-light) !important;
}

body.body--dark .reserva-dialog .reserva-block,
body.app-dark .reserva-dialog .reserva-block {
    border-bottom-color: rgba(var(--theme-gold-light-rgb), 0.1) !important;
}

body.body--dark .reserva-dialog .reserva-block-label,
body.app-dark .reserva-dialog .reserva-block-label {
    color: rgba(var(--theme-gold-pale-rgb, 239, 224, 191), 0.72) !important;
}

body.body--dark .reserva-dialog .reserva-salida,
body.app-dark .reserva-dialog .reserva-salida {
    background: rgba(var(--theme-wine-rgb), 0.14) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.22) !important;
}

body.body--dark .reserva-dialog .reserva-salida-value,
body.app-dark .reserva-dialog .reserva-salida-value {
    color: var(--theme-gold-pale) !important;
}

body.body--dark .reserva-dialog .reserva-camas-meta,
body.app-dark .reserva-dialog .reserva-camas-meta {
    background: rgba(var(--theme-wine-rgb), 0.16) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.14) !important;
    color: var(--app-ink-muted, #b3a597) !important;
}

body.body--dark .reserva-dialog .reserva-camas-meta strong,
body.app-dark .reserva-dialog .reserva-camas-meta strong {
    color: var(--theme-gold-pale) !important;
}

body.body--dark .reserva-dialog .reserva-banner-placeholder,
body.app-dark .reserva-dialog .reserva-banner-placeholder {
    background: rgba(255, 255, 255, 0.04) !important;
    color: var(--app-ink-muted, #b3a597) !important;
}

body.body--dark .planning-page .view-switch .q-btn.text-grey-6 {
    color: var(--plan-ink-2, #e2d5c8) !important;
}

body.body--dark .planning-page .toolbar-left .nav-arrow-btn {
    color: var(--plan-ink) !important;
    background: rgba(255, 255, 255, 0.04);
    border-color: var(--plan-border);
}

body.body--dark .planning-page .plan-outline-btn {
    color: var(--theme-gold-light, #d4af6a) !important;
    border-color: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.42) !important;
    background: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.06) !important;
}

body.body--dark .planning-page .plan-outline-btn:hover {
    color: var(--theme-gold-pale, #efe0bf) !important;
    border-color: var(--theme-gold-light, #d4af6a) !important;
    background: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.14) !important;
}

body.body--dark .planning-page .hoy-btn {
    box-shadow: inset 0 0 0 1px rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.12);
}

body.body--dark .metrics-card .text-primary,
body.body--dark .text-primary {
    color: var(--theme-gold-light, #d4af6a) !important;
}

body.body--dark .planning-page .mini-date {
    background: var(--plan-muted-bg);
    border-color: var(--plan-border) !important;
    color: var(--plan-ink);
}

body.body--dark .planning-page .mini-date .q-date__content,
body.body--dark .planning-page .mini-date .q-date__view,
body.body--dark .planning-page .mini-date .q-date__calendar-days,
body.body--dark .planning-page .mini-date .q-date__calendar-weekdays {
    background: transparent;
    color: var(--plan-ink);
}

body.body--dark .planning-page .ep-month .q-calendar-month__day.q-current-day,
body.body--dark .planning-page .ep-month .q-calendar-month__day.q-outside {
    background: transparent !important;
    color: var(--plan-ink) !important;
}

body.body--dark .planning-page .ep-month .q-calendar-month__day.q-current-day .q-calendar__button,
body.body--dark .planning-page .ep-month .q-calendar-month__day.q-outside .q-calendar__button {
    border: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
    color: var(--plan-ink) !important;
}

body.body--dark .planning-page .workload-card .q-linear-progress__track,
body.body--dark .metrics-card .q-linear-progress__track {
    background: rgba(var(--theme-wine-rgb, 122, 31, 43), 0.35) !important;
}

body.body--dark .planning-page .q-linear-progress__model {
    color: var(--theme-gold-light, #d4af6a) !important;
}

body.body--dark .planning-sidebar,
body.body--dark .planning-main,
body.body--dark .calendar-panel,
body.body--dark .planning-grid-wrap,
body.body--dark .book-grid-wrap,
body.body--dark .detail-card,
body.body--dark .metrics-card,
body.body--dark .workload-card {
    background: var(--plan-surface) !important;
    border-color: var(--plan-border) !important;
    box-shadow: var(--plan-shadow);
}

body.body--dark .metrics-card .metric-tile,
body.app-dark .metrics-card .metric-tile {
    background:
        radial-gradient(120% 90% at 0% 0%, rgba(var(--theme-wine-rgb), 0.16), transparent 55%),
        color-mix(in srgb, var(--theme-dark) 88%, var(--theme-wine-deep)) !important;
    border-color: rgba(var(--theme-gold-light-rgb), 0.18) !important;
}

body.body--dark .metrics-card .metric-label,
body.app-dark .metrics-card .metric-label {
    color: var(--app-ink-muted, #b3a597) !important;
}

body.body--dark .metrics-card .metric-tile--wine .metric-icon,
body.app-dark .metrics-card .metric-tile--wine .metric-icon {
    background: rgba(var(--theme-wine-on-dark-rgb, 232, 165, 174), 0.16) !important;
    color: var(--theme-wine-on-dark, #e8a5ae) !important;
}
body.body--dark .metrics-card .metric-tile--wine .metric-value,
body.app-dark .metrics-card .metric-tile--wine .metric-value {
    color: var(--theme-gold-pale) !important;
}

body.body--dark .metrics-card .metric-tile--warn .metric-icon,
body.app-dark .metrics-card .metric-tile--warn .metric-icon {
    background: rgba(224, 165, 38, 0.16) !important;
    color: var(--theme-warning, #e0a526) !important;
}
body.body--dark .metrics-card .metric-tile--warn .metric-value,
body.app-dark .metrics-card .metric-tile--warn .metric-value {
    color: #f0c14d !important;
}

body.body--dark .metrics-card .metric-tile--blue .metric-icon,
body.app-dark .metrics-card .metric-tile--blue .metric-icon {
    background: rgba(47, 111, 191, 0.2) !important;
    color: #7eb6f0 !important;
}
body.body--dark .metrics-card .metric-tile--blue .metric-value,
body.app-dark .metrics-card .metric-tile--blue .metric-value {
    color: #9ec5f5 !important;
}

body.body--dark .metrics-card .metric-tile--violet .metric-icon,
body.app-dark .metrics-card .metric-tile--violet .metric-icon {
    background: rgba(107, 45, 139, 0.22) !important;
    color: #c4a0e0 !important;
}
body.body--dark .metrics-card .metric-tile--violet .metric-value,
body.app-dark .metrics-card .metric-tile--violet .metric-value {
    color: #d4b8ea !important;
}

body.body--dark .metrics-card .metrics-bar .q-linear-progress__track,
body.app-dark .metrics-card .metrics-bar .q-linear-progress__track {
    background: rgba(255, 255, 255, 0.08) !important;
}

body.body--dark .planning-page .q-table,
body.body--dark .planning-page .q-markup-table,
body.body--dark .book-grid {
    background: var(--plan-surface) !important;
    color: var(--plan-ink);
}

body.body--dark .planning-page .q-table thead tr th,
body.body--dark .book-grid thead th {
    background: color-mix(in srgb, var(--theme-dark) 78%, var(--theme-wine-deep)) !important;
    color: var(--theme-gold-pale) !important;
    border-color: var(--plan-border) !important;
}

body.body--dark .planning-page .q-table tbody td,
body.body--dark .book-grid tbody td {
    color: var(--plan-ink) !important;
    border-color: var(--plan-border-soft) !important;
}

body.body--dark .planning-page .q-table tbody tr:nth-child(even) td,
body.body--dark .book-grid tbody tr:nth-child(even) td {
    background: rgba(0, 0, 0, 0.22) !important;
}

body.body--dark .planning-page .q-table tbody tr:hover td,
body.body--dark .book-grid tbody tr:hover td {
    background: rgba(var(--theme-gold-light-rgb, 212, 175, 106), 0.1) !important;
}

/* ═════════ Acabado lux del calendario ═════════ */
.planning-page {
    --lux-gold: var(--theme-gold);
    --lux-gold-rgb: var(--theme-gold-rgb);
    --lux-hair: rgba(var(--theme-gold-rgb), 0.14);
    --lux-hair-strong: rgba(var(--theme-gold-rgb), 0.32);
    --lux-head-bg: linear-gradient(180deg, var(--theme-ivory) 0%, var(--theme-ivory-2) 100%);
    --lux-panel-glow: rgba(var(--theme-wine-rgb), 0.06);
}

body.body--dark .planning-page {
    --lux-gold: var(--theme-gold-light);
    --lux-gold-rgb: var(--theme-gold-light-rgb);
    --lux-hair: rgba(var(--theme-gold-light-rgb), 0.1);
    --lux-hair-strong: rgba(var(--theme-gold-light-rgb), 0.3);
    --lux-head-bg: linear-gradient(180deg,
        color-mix(in srgb, var(--theme-dark) 78%, var(--theme-wine-deep)) 0%,
        color-mix(in srgb, var(--theme-dark) 90%, var(--theme-wine-deep)) 100%);
    --lux-panel-glow: rgba(var(--theme-wine-rgb), 0.22);
}

/* Paneles con brillo vino y filo dorado */
.planning-page .planning-sidebar,
.planning-page .planning-main {
    border-radius: 22px;
    border-color: var(--lux-hair-strong) !important;
    background:
        radial-gradient(110% 55% at 0% 0%, var(--lux-panel-glow), transparent 60%),
        var(--plan-surface) !important;
}

.planning-page .planning-main {
    position: relative;
}

.planning-page .planning-sidebar::before,
.planning-page .planning-main::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 28px;
    right: 28px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--lux-gold), transparent);
    pointer-events: none;
}

/* Título del mes editorial */
.planning-page .month-title {
    font-family: var(--app-font-display), Georgia, serif;
    font-size: 1.75rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--theme-wine-deep);
    white-space: nowrap;
}

.planning-page .month-title em {
    font-style: italic;
    font-weight: 400;
    color: var(--lux-gold);
}

body.body--dark .planning-page .month-title {
    color: var(--theme-gold-pale);
}

.planning-page .planning-toolbar {
    padding-bottom: 12px;
    border-bottom: 1px solid var(--lux-hair);
}

/* Leyenda en chips */
.planning-page .legend-row {
    gap: 6px 8px;
}

.planning-page .legend-item {
    padding: 3px 10px 3px 8px;
    border-radius: 999px;
    border: 1px solid var(--lux-hair);
    background: rgba(var(--lux-gold-rgb), 0.04);
    font-size: 10.5px;
    letter-spacing: 0.06em;
}

.planning-page .legend-dot {
    box-shadow: 0 0 0 3px rgba(var(--lux-gold-rgb), 0.12);
}

/* Mini calendario */
.planning-page .mini-date {
    border-color: var(--lux-hair-strong) !important;
    background:
        radial-gradient(120% 70% at 100% 0%, rgba(var(--lux-gold-rgb), 0.08), transparent 60%),
        var(--plan-muted-bg) !important;
}

.planning-page .mini-date .q-date__navigation .q-btn__content,
.planning-page .mini-date .q-date__navigation .relative-position {
    font-family: var(--app-font-display), Georgia, serif;
    font-weight: 600;
}

.planning-page .mini-date .q-date__calendar-weekdays > div {
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--lux-gold);
    opacity: 0.85;
}

.planning-page .mini-date .q-date__calendar-item .q-btn {
    transition: transform 0.15s ease, background 0.2s ease;
}

.planning-page .mini-date .q-date__calendar-item .q-btn:hover {
    transform: scale(1.08);
}

.planning-page .mini-date .q-date__today {
    box-shadow: 0 0 0 1px var(--lux-gold) !important;
    color: var(--lux-gold) !important;
}

.planning-page .mini-date .q-date__calendar-item--in .q-btn.bg-primary,
.planning-page .mini-date .q-date__calendar-item .q-btn.bg-primary {
    background: linear-gradient(135deg, var(--theme-gold-pale), var(--theme-gold-light) 45%, var(--theme-gold)) !important;
    color: var(--theme-ink) !important;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(var(--theme-gold-rgb), 0.4) !important;
}

/* Sidebar: rótulos y estadísticas */
.planning-page .sidebar-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: var(--lux-gold);
}

.planning-page .sidebar-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, var(--lux-hair-strong), transparent);
}

.planning-page .workload-card,
.planning-page .stat-mini {
    position: relative;
    overflow: hidden;
    border-radius: 14px;
    border-color: var(--lux-hair) !important;
}

.planning-page .workload-card .q-linear-progress__model {
    background: linear-gradient(90deg, var(--theme-wine), var(--theme-gold-light)) !important;
}

.planning-page .stat-mini::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--stat-accent, var(--lux-gold)), transparent);
}

.planning-page .stat-mini--warn { --stat-accent: var(--plan-warn); }
.planning-page .stat-mini--ok { --stat-accent: var(--lux-gold); }

.planning-page .stat-mini-value {
    font-family: var(--app-font-display), Georgia, serif;
    font-size: 1.9rem;
    font-weight: 600;
}

.planning-page .stat-mini--ok .stat-mini-value {
    color: var(--lux-gold);
}

/* ── Rejillas (Mapa y Día) ── */
.planning-page .book-grid-wrap,
.planning-page .planning-grid-wrap {
    padding: 0;
    border-radius: 18px;
    border-color: var(--lux-hair-strong) !important;
}

.planning-page .book-corner,
.planning-page .book-room-head,
.planning-page .book-day-label,
.planning-page .book-cell,
.planning-page .grid-corner,
.planning-page .grid-day-head,
.planning-page .grid-room,
.planning-page .grid-cell {
    border-width: 0 1px 1px 0;
    border-color: var(--lux-hair);
}

.planning-page .book-corner,
.planning-page .book-room-head,
.planning-page .grid-corner,
.planning-page .grid-day-head {
    background: var(--lux-head-bg) !important;
    border-bottom: 1px solid var(--lux-hair-strong);
    backdrop-filter: blur(8px);
}

.planning-page .book-corner,
.planning-page .grid-corner {
    font-size: 10px;
    letter-spacing: 0.2em;
    color: var(--lux-gold);
}

/* Cabecera de habitación con el color de la habitación */
.planning-page .book-room-head {
    padding: 10px 12px 9px;
    box-shadow: inset 0 3px 0 var(--room-color, var(--lux-gold));
}

.planning-page .book-room-casa {
    font-size: 9.5px;
    letter-spacing: 0.18em;
    color: var(--lux-gold);
}

.planning-page .book-room-head-name,
.planning-page .grid-room-name {
    font-family: var(--app-font-display), Georgia, serif;
    font-size: 14.5px;
    font-weight: 600;
}

.planning-page .book-room-head .legend-dot,
.planning-page .grid-room .legend-dot {
    width: 9px;
    height: 9px;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--room-color, var(--lux-gold)) 22%, transparent),
        0 0 10px color-mix(in srgb, var(--room-color, var(--lux-gold)) 55%, transparent);
}

.planning-page .grid-room {
    box-shadow: inset 3px 0 0 var(--room-color, var(--lux-gold));
}

/* Columna de días */
.planning-page .book-day-label {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1px;
    padding: 6px 10px;
}

.planning-page .grid-day-wd {
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.16em;
    color: var(--plan-faint);
}

.planning-page .grid-day-num {
    font-family: var(--app-font-display), Georgia, serif;
    font-size: 1.2rem;
    font-weight: 600;
    line-height: 1.05;
    color: var(--plan-ink);
}

.planning-page .book-day-label.is-weekend .grid-day-wd,
.planning-page .grid-day-head.is-weekend .grid-day-wd {
    color: var(--lux-gold);
}

.planning-page .book-cell.is-weekend,
.planning-page .grid-cell.is-weekend,
.planning-page .book-day-label.is-weekend {
    background-color: color-mix(in srgb, var(--plan-surface) 96%, var(--lux-gold)) !important;
}

/* Hoy: banda dorada que cruza la fila / columna */
.planning-page .book-day-label.is-today,
.planning-page .grid-day-head.is-today {
    background:
        linear-gradient(90deg, rgba(var(--lux-gold-rgb), 0.28), rgba(var(--lux-gold-rgb), 0.08)) ,
        var(--plan-surface) !important;
    box-shadow: inset 3px 0 0 var(--lux-gold);
}

.planning-page .grid-day-head.is-today {
    box-shadow: inset 0 -3px 0 var(--lux-gold);
}

.planning-page .book-day-label.is-today .grid-day-num,
.planning-page .grid-day-head.is-today .grid-day-num,
.planning-page .book-day-label.is-today .grid-day-wd,
.planning-page .grid-day-head.is-today .grid-day-wd {
    color: var(--lux-gold);
}

.planning-page .book-cell.is-today,
.planning-page .grid-cell.is-today {
    background-color: color-mix(in srgb, var(--plan-surface) 90%, var(--lux-gold)) !important;
    border-top: 1px solid var(--lux-hair-strong);
}

/* Celdas */
.planning-page .book-cell,
.planning-page .grid-cell {
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.planning-page .book-cell:hover,
.planning-page .grid-cell:hover {
    background-color: color-mix(in srgb, var(--plan-surface) 88%, var(--theme-wine)) !important;
    box-shadow: inset 0 0 0 1px var(--lux-hair-strong);
}

.planning-page .book-empty,
.planning-page .empty-slot {
    border: 0;
    color: var(--lux-gold);
}

.planning-page .book-empty .q-icon,
.planning-page .empty-slot .q-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--lux-hair-strong);
    background: rgba(var(--lux-gold-rgb), 0.08);
    transform: scale(0.7);
    transition: transform 0.2s ease, background 0.2s ease;
}

.planning-page .book-cell:hover .book-empty .q-icon,
.planning-page .grid-cell:hover .empty-slot .q-icon {
    transform: scale(1);
    background: rgba(var(--lux-gold-rgb), 0.18);
}

.planning-page .empty-slot {
    opacity: 0;
    transition: opacity 0.15s ease;
}

.planning-page .grid-cell:hover .empty-slot {
    opacity: 1;
}

/* Reservas: pastillas con el color de la habitación */
.planning-page .book-name,
.planning-page .plan-card {
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    border: 1px solid color-mix(in srgb, var(--room-color) 40%, transparent) !important;
    border-left: 3px solid var(--room-color) !important;
    background:
        linear-gradient(135deg,
            color-mix(in srgb, var(--room-color) 26%, var(--plan-day)) 0%,
            color-mix(in srgb, var(--room-color) 9%, var(--plan-day)) 100%) !important;
    box-shadow: 0 4px 14px color-mix(in srgb, var(--room-color) 18%, transparent);
    transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.planning-page .book-name::after,
.planning-page .plan-card::after {
    content: '';
    position: absolute;
    inset: 0 0 55% 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
}

.planning-page .book-name:hover,
.planning-page .plan-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px color-mix(in srgb, var(--room-color) 30%, transparent);
}

.planning-page .book-name.is-pendiente,
.planning-page .plan-card.is-pendiente {
    border-style: dashed !important;
    border-left-style: solid !important;
}

.planning-page .book-name-text,
.planning-page .plan-card-title {
    font-weight: 650;
    letter-spacing: 0.005em;
}

/* Botón "Agregar" más discreto */
.planning-page .cell-add-btn {
    border-radius: 999px;
    border-color: var(--lux-hair-strong);
    background: transparent;
    color: var(--lux-gold);
    letter-spacing: 0.06em;
}

.planning-page .cell-add-btn:hover {
    background: rgba(var(--lux-gold-rgb), 0.12);
    border-color: var(--lux-gold);
}

/* Separador de casa en la vista Día */
.planning-page .grid-casa-head {
    font-family: var(--app-font-display), Georgia, serif;
    font-style: italic;
    letter-spacing: 0.02em;
    background: var(--lux-head-bg) !important;
    border-color: var(--lux-hair-strong) !important;
    color: var(--lux-gold) !important;
}

/* Scroll fino dorado en las rejillas */
.planning-page .book-grid-wrap,
.planning-page .planning-grid-wrap {
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--lux-gold-rgb), 0.5) transparent;
}

.planning-page .book-grid-wrap::-webkit-scrollbar,
.planning-page .planning-grid-wrap::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

.planning-page .book-grid-wrap::-webkit-scrollbar-thumb,
.planning-page .planning-grid-wrap::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: linear-gradient(180deg, var(--theme-gold-light), var(--theme-wine));
}

.planning-page .book-grid-wrap::-webkit-scrollbar-track,
.planning-page .planning-grid-wrap::-webkit-scrollbar-track {
    background: transparent;
}

@media (max-width: 1100px) {
    .planning-page .planning-sidebar {
        position: relative;
    }
}

@media (max-width: 700px) {
    .planning-page .month-title {
        font-size: 1.3rem;
    }
}
</style>
