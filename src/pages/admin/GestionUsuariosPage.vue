<template>
    <div class="admin-page q-pa-md q-pa-lg-xl">
        <div class="admin-hero q-mb-lg">
            <div>
                <p class="admin-eyebrow">Seguridad</p>
                <h1 class="admin-title">Gestionar usuarios y roles</h1>
                <p class="admin-text">
                    Registra usuarios, asígnales roles y empresas, y define qué permisos tiene cada rol.
                </p>
            </div>
            <q-btn flat round dense icon="refresh" color="white" :loading="loadingAny" @click="loadAdminData">
                <q-tooltip>Recargar datos</q-tooltip>
            </q-btn>
        </div>

        <div class="row q-col-gutter-lg">
            <div class="col-12 col-xl-5">
                <q-card v-if="authStore.hasPermission('crear_usuarios')" flat class="admin-card q-mb-lg">
                    <q-card-section>
                        <div class="text-h6 text-primary text-weight-bold">Crear usuario</div>
                        <div class="admin-card-caption">Registra un usuario, asígnale roles y las empresas donde trabajará.</div>
                    </q-card-section>

                    <q-card-section>
                        <q-form ref="createFormRef" class="column q-gutter-md" @submit="submitUser">
                            <div class="row q-col-gutter-md">
                                <div class="col-12 col-sm-6">
                                    <q-input v-model="userForm.name" outlined label="Nombre completo" :rules="[required]" />
                                </div>
                                <div class="col-12 col-sm-6">
                                    <q-input v-model="userForm.username" outlined label="Usuario" :rules="[required, usernameRule]" />
                                </div>
                            </div>
                            <q-input v-model="userForm.email" outlined type="email" label="Correo" :rules="[required, emailRule]" />
                            <q-input
                                v-model="userForm.password"
                                outlined
                                :type="showPassword ? 'text' : 'password'"
                                label="Contraseña"
                                hint="Mínimo 8 caracteres"
                                :rules="[required, passwordRule]"
                            >
                                <template #append>
                                    <q-icon
                                        :name="showPassword ? 'visibility_off' : 'visibility'"
                                        class="cursor-pointer"
                                        @click="showPassword = !showPassword"
                                    />
                                </template>
                            </q-input>
                            <q-select
                                v-model="userForm.roles"
                                outlined
                                multiple
                                emit-value
                                map-options
                                use-chips
                                label="Roles"
                                :options="roleOptions"
                                :loading="loadingRoles"
                            />
                            <q-select
                                v-model="userForm.empresa_ids"
                                outlined
                                multiple
                                emit-value
                                map-options
                                use-chips
                                label="Empresas"
                                hint="Sin empresas asignadas el usuario no podrá entrar (salvo admin)"
                                :options="empresaOptions"
                            />
                            <q-toggle v-model="userForm.is_active" label="Usuario activo" color="primary" />
                            <q-btn unelevated color="primary" type="submit" icon="person_add" label="Crear usuario" :loading="submittingUser" />
                        </q-form>
                    </q-card-section>
                </q-card>

                <q-card v-if="authStore.hasPermission('crear_roles')" flat class="admin-card">
                    <q-card-section>
                        <div class="text-h6 text-primary text-weight-bold">Crear rol</div>
                        <div class="admin-card-caption">Define un rol y selecciona sus permisos.</div>
                    </q-card-section>

                    <q-card-section>
                        <q-form ref="roleFormRef" class="column q-gutter-md" @submit="submitRole">
                            <q-input v-model="roleForm.name" outlined label="Nombre del rol" :rules="[required]" />
                            <q-select
                                v-model="roleForm.permissions"
                                outlined
                                multiple
                                emit-value
                                map-options
                                use-chips
                                label="Permisos"
                                :options="permissionOptions"
                                :loading="loadingPermissions"
                            />
                            <q-btn unelevated color="secondary" type="submit" icon="add_moderator" label="Crear rol" :loading="submittingRole" />
                        </q-form>
                    </q-card-section>
                </q-card>
            </div>

            <div class="col-12 col-xl-7">
                <q-card flat class="admin-card q-mb-lg">
                    <q-card-section class="row items-center justify-between q-col-gutter-sm">
                        <div class="col-12 col-sm">
                            <div class="text-h6 text-primary text-weight-bold">Usuarios del sistema</div>
                            <div class="admin-card-caption">{{ users.length }} usuario(s) registrados.</div>
                        </div>
                        <div class="col-12 col-sm-auto">
                            <q-input v-model="search" dense outlined clearable placeholder="Buscar usuario" class="search-input">
                                <template #prepend><q-icon name="search" /></template>
                            </q-input>
                        </div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section>
                        <div v-if="loadingUsers" class="row justify-center q-pa-lg">
                            <q-spinner color="primary" size="42px" />
                        </div>

                        <div v-else-if="filteredUsers.length === 0" class="empty-state">
                            <q-icon name="person_search" size="40px" />
                            <div>No se encontraron usuarios.</div>
                        </div>

                        <div v-else class="column q-gutter-md">
                            <q-card v-for="user in filteredUsers" :key="user.id" flat bordered class="user-card" :class="{ 'user-card--inactive': !user.is_active }">
                                <q-card-section class="row items-start q-col-gutter-md">
                                    <div class="col-12 col-md-4 row no-wrap items-start q-gutter-sm">
                                        <q-avatar size="40px" class="user-avatar">{{ initials(user.name) }}</q-avatar>
                                        <div class="user-meta">
                                            <div class="text-subtitle1 text-weight-bold ellipsis">{{ user.name }}</div>
                                            <div class="user-caption ellipsis">@{{ user.username }}</div>
                                            <div class="user-caption ellipsis">{{ user.email }}</div>
                                            <q-badge
                                                class="q-mt-xs"
                                                :color="user.is_active ? 'positive' : 'grey-6'"
                                                :label="user.is_active ? 'Activo' : 'Inactivo'"
                                            />
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-5 column q-gutter-sm">
                                        <q-select
                                            :model-value="user.roles.map((role) => role.name)"
                                            outlined
                                            dense
                                            multiple
                                            emit-value
                                            map-options
                                            use-chips
                                            label="Roles asignados"
                                            :options="roleOptions"
                                            :disable="!canEditUsers"
                                            @update:model-value="(roles) => updateUserRoles(user, roles)"
                                        />
                                        <div class="row q-gutter-xs items-center">
                                            <q-icon name="apartment" size="16px" class="user-caption" />
                                            <template v-if="user.empresas.length">
                                                <q-chip v-for="empresa in user.empresas" :key="empresa.id" dense class="empresa-chip">
                                                    {{ empresa.nombre_corto || empresa.nombre }}
                                                </q-chip>
                                            </template>
                                            <span v-else class="user-caption">
                                                {{ isAdminUser(user) ? 'Todas (admin)' : 'Sin empresas asignadas' }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-3 column items-end q-gutter-sm">
                                        <q-chip class="user-id-chip" icon="person">ID {{ user.id }}</q-chip>
                                        <div class="row q-gutter-sm">
                                            <q-btn v-if="canEditUsers" flat dense round icon="edit" color="primary" size="sm" @click="openEditUserDialog(user)">
                                                <q-tooltip>Editar usuario</q-tooltip>
                                            </q-btn>
                                            <q-btn
                                                v-if="authStore.hasPermission('eliminar_usuarios') && user.id !== authStore.user?.id"
                                                flat
                                                dense
                                                round
                                                icon="delete"
                                                color="negative"
                                                size="sm"
                                                @click="confirmDeleteUser(user)"
                                            >
                                                <q-tooltip>Eliminar usuario</q-tooltip>
                                            </q-btn>
                                        </div>
                                    </div>
                                </q-card-section>
                            </q-card>
                        </div>
                    </q-card-section>
                </q-card>

                <q-card flat class="admin-card">
                    <q-card-section>
                        <div class="text-h6 text-primary text-weight-bold">Roles registrados</div>
                        <div class="admin-card-caption">Vista rápida de permisos asociados por rol.</div>
                    </q-card-section>

                    <q-separator />

                    <q-card-section>
                        <div v-if="loadingRoles" class="row justify-center q-pa-lg">
                            <q-spinner color="secondary" size="42px" />
                        </div>

                        <div v-else class="row q-col-gutter-md">
                            <div v-for="role in roles" :key="role.id" class="col-12 col-md-6">
                                <q-card flat bordered class="role-card full-height">
                                    <q-card-section>
                                        <div class="row items-center no-wrap">
                                            <div class="col">
                                                <div class="text-subtitle1 text-weight-bold text-primary">{{ role.name }}</div>
                                                <div class="user-caption">{{ role.users_count ?? 0 }} usuario(s)</div>
                                            </div>
                                            <template v-if="role.name !== 'admin'">
                                                <q-btn v-if="authStore.hasPermission('editar_roles')" flat dense round icon="edit" color="primary" size="sm" @click="openEditRoleDialog(role)">
                                                    <q-tooltip>Editar rol</q-tooltip>
                                                </q-btn>
                                                <q-btn v-if="authStore.hasPermission('eliminar_roles')" flat dense round icon="delete" color="negative" size="sm" @click="confirmDeleteRole(role)">
                                                    <q-tooltip>Eliminar rol</q-tooltip>
                                                </q-btn>
                                            </template>
                                        </div>
                                        <div class="q-mt-sm row q-gutter-xs">
                                            <q-chip v-if="role.name === 'admin'" dense class="role-permission-chip" icon="verified_user">
                                                Acceso total
                                            </q-chip>
                                            <template v-else>
                                                <q-chip v-for="permission in visibleRolePermissions(role)" :key="permission.id" dense class="role-permission-chip">
                                                    {{ permissionLabel(permission.name) }}
                                                </q-chip>
                                                <span v-if="visibleRolePermissions(role).length === 0" class="user-caption">Sin permisos</span>
                                            </template>
                                        </div>
                                    </q-card-section>
                                </q-card>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>

        <q-dialog v-model="showEditDialog" persistent>
            <q-card class="dialog-card">
                <q-card-section>
                    <div class="text-h6 text-primary">Editar usuario</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-form ref="editFormRef" class="column q-gutter-md" @submit="submitEditUser">
                        <div class="row q-col-gutter-md">
                            <div class="col-12 col-sm-6">
                                <q-input v-model="editForm.name" outlined label="Nombre completo" :rules="[required]" />
                            </div>
                            <div class="col-12 col-sm-6">
                                <q-input v-model="editForm.username" outlined label="Usuario" :rules="[required, usernameRule]" />
                            </div>
                        </div>
                        <q-input v-model="editForm.email" outlined type="email" label="Correo" :rules="[required, emailRule]" />
                        <q-input
                            v-model="editForm.password"
                            outlined
                            type="password"
                            label="Nueva contraseña (opcional)"
                            hint="Dejar vacío para mantener la actual"
                            :rules="[optionalPasswordRule]"
                        />
                        <q-select
                            v-model="editForm.roles"
                            outlined
                            multiple
                            emit-value
                            map-options
                            use-chips
                            label="Roles"
                            :options="roleOptions"
                        />
                        <q-select
                            v-model="editForm.empresa_ids"
                            outlined
                            multiple
                            emit-value
                            map-options
                            use-chips
                            label="Empresas"
                            :options="empresaOptions"
                        />
                        <q-toggle
                            v-model="editForm.is_active"
                            label="Usuario activo"
                            color="primary"
                            :disable="editForm.id === authStore.user?.id"
                        />
                        <div class="row justify-end q-gutter-sm">
                            <q-btn flat label="Cancelar" color="grey-7" @click="showEditDialog = false" />
                            <q-btn unelevated label="Guardar cambios" color="primary" type="submit" :loading="submittingEdit" />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>

        <q-dialog v-model="showEditRoleDialog" persistent>
            <q-card class="dialog-card">
                <q-card-section>
                    <div class="text-h6 text-primary">Editar rol</div>
                </q-card-section>

                <q-card-section class="q-pt-none">
                    <q-form class="column q-gutter-md" @submit="submitEditRole">
                        <q-input v-model="editRoleForm.name" outlined label="Nombre del rol" :rules="[required]" />
                        <q-select
                            v-model="editRoleForm.permissions"
                            outlined
                            multiple
                            emit-value
                            map-options
                            use-chips
                            label="Permisos"
                            :options="permissionOptions"
                        />
                        <div class="row justify-end q-gutter-sm">
                            <q-btn flat label="Cancelar" color="grey-7" @click="showEditRoleDialog = false" />
                            <q-btn unelevated label="Guardar cambios" color="primary" type="submit" :loading="submittingRoleEdit" />
                        </div>
                    </q-form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Dialog, Notify } from 'quasar'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/auth-store'

defineOptions({
    name: 'GestionUsuariosPage'
})

const ADMIN_ONLY_PERMISSIONS = [
    'ver_usuarios',
    'crear_usuarios',
    'editar_usuarios',
    'eliminar_usuarios',
    'ver_roles',
    'crear_roles',
    'editar_roles',
    'eliminar_roles',
    'ver_permisos',
    'asignar_permisos',
]

const authStore = useAuthStore()
const loadingUsers = ref(false)
const loadingRoles = ref(false)
const loadingPermissions = ref(false)
const submittingUser = ref(false)
const submittingRole = ref(false)
const submittingEdit = ref(false)
const submittingRoleEdit = ref(false)
const showEditDialog = ref(false)
const showEditRoleDialog = ref(false)
const showPassword = ref(false)
const search = ref('')
const createFormRef = ref(null)
const roleFormRef = ref(null)
const users = ref([])
const roles = ref([])
const permissions = ref([])
const empresas = ref([])

const emptyUserForm = () => ({
    name: '',
    username: '',
    email: '',
    password: '',
    roles: [],
    empresa_ids: [],
    is_active: true,
})

const userForm = reactive(emptyUserForm())
const roleForm = reactive({ name: '', permissions: [] })
const editForm = reactive({ id: null, ...emptyUserForm() })
const editRoleForm = reactive({ id: null, name: '', permissions: [] })

const required = (value) => Boolean(String(value ?? '').trim()) || 'Campo obligatorio'
const usernameRule = (value) => /^[A-Za-z0-9_-]+$/.test(String(value || '')) || 'Solo letras, números, guiones y guion bajo'
const emailRule = (value) => /.+@.+\..+/.test(String(value || '')) || 'Correo no válido'
const passwordRule = (value) => String(value || '').length >= 8 || 'Mínimo 8 caracteres'
const optionalPasswordRule = (value) => !value || String(value).length >= 8 || 'Mínimo 8 caracteres'

const loadingAny = computed(() => loadingUsers.value || loadingRoles.value || loadingPermissions.value)
const canEditUsers = computed(() => authStore.hasPermission('editar_usuarios'))

const roleOptions = computed(() => roles.value.map((role) => ({ label: role.name, value: role.name })))

const permissionOptions = computed(() => permissions.value
    .filter((permission) => !ADMIN_ONLY_PERMISSIONS.includes(permission.name))
    .map((permission) => ({ label: permissionLabel(permission.name), value: permission.name })))

const empresaOptions = computed(() => empresas.value.map((empresa) => ({
    label: empresa.nombre_corto || empresa.nombre,
    value: empresa.id,
})))

const filteredUsers = computed(() => {
    const term = String(search.value || '').trim().toLowerCase()

    if (!term) {
        return users.value
    }

    return users.value.filter((user) => [user.name, user.username, user.email]
        .some((field) => String(field || '').toLowerCase().includes(term)))
})

function permissionLabel(name) {
    const text = String(name || '').replace(/_/g, ' ')
    return text.charAt(0).toUpperCase() + text.slice(1)
}

function initials(name) {
    return String(name || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('')
}

function isAdminUser(user) {
    return user.roles.some((role) => role.name === 'admin')
}

function visibleRolePermissions(role) {
    return (role.permissions ?? []).filter((permission) => !ADMIN_ONLY_PERMISSIONS.includes(permission.name))
}

function errorMessage(error, fallback) {
    const errors = error.response?.data?.errors

    if (errors) {
        return Object.values(errors).flat()[0] || fallback
    }

    return error.response?.data?.message || fallback
}

function notifySuccess(message) {
    Notify.create({ type: 'positive', message, position: 'top-right' })
}

function notifyError(error, fallback) {
    Notify.create({ type: 'negative', message: errorMessage(error, fallback) })
}

async function loadUsers() {
    if (!authStore.hasPermission('ver_usuarios')) {
        users.value = []
        return
    }

    loadingUsers.value = true

    try {
        const { data } = await api.get('/users', { skipScopeParams: true })
        users.value = data.data
    } finally {
        loadingUsers.value = false
    }
}

async function loadRoles() {
    if (!authStore.hasPermission('ver_roles')) {
        roles.value = []
        return
    }

    loadingRoles.value = true

    try {
        const { data } = await api.get('/roles', { skipScopeParams: true })
        roles.value = data.data
    } finally {
        loadingRoles.value = false
    }
}

async function loadPermissions() {
    if (!authStore.hasPermission('ver_permisos')) {
        permissions.value = []
        return
    }

    loadingPermissions.value = true

    try {
        const { data } = await api.get('/permissions', { skipScopeParams: true })
        permissions.value = data.data
    } finally {
        loadingPermissions.value = false
    }
}

async function loadEmpresas() {
    const { data } = await api.get('/empresas', { skipEmpresaHeader: true, skipScopeParams: true })
    empresas.value = data.data || []
}

async function loadAdminData() {
    try {
        await Promise.all([loadUsers(), loadRoles(), loadPermissions(), loadEmpresas()])
    } catch (error) {
        notifyError(error, 'No se pudieron cargar los datos de seguridad')
    }
}

function resetUserForm() {
    Object.assign(userForm, emptyUserForm())
    createFormRef.value?.resetValidation()
}

async function submitUser() {
    submittingUser.value = true

    try {
        await api.post('/users', { ...userForm })
        notifySuccess('Usuario creado correctamente')
        resetUserForm()
        await Promise.all([loadUsers(), loadRoles()])
    } catch (error) {
        notifyError(error, 'No se pudo crear el usuario')
    } finally {
        submittingUser.value = false
    }
}

async function submitRole() {
    submittingRole.value = true

    try {
        await api.post('/roles', { ...roleForm })
        notifySuccess('Rol creado correctamente')
        roleForm.name = ''
        roleForm.permissions = []
        roleFormRef.value?.resetValidation()
        await loadRoles()
    } catch (error) {
        notifyError(error, 'No se pudo crear el rol')
    } finally {
        submittingRole.value = false
    }
}

async function updateUserRoles(user, rolesList) {
    try {
        const { data } = await api.post(`/users/${user.id}/assign-roles`, { roles: rolesList })
        Object.assign(user, data.data)
        await loadRoles()
    } catch (error) {
        notifyError(error, 'No se pudieron actualizar los roles')
    }
}

function openEditUserDialog(user) {
    Object.assign(editForm, {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        password: '',
        roles: user.roles.map((role) => role.name),
        empresa_ids: user.empresas.map((empresa) => empresa.id),
        is_active: user.is_active,
    })
    showEditDialog.value = true
}

async function submitEditUser() {
    submittingEdit.value = true

    try {
        const { id, password, ...payload } = editForm

        if (password) {
            payload.password = password
        }

        await api.put(`/users/${id}`, payload)
        notifySuccess('Usuario actualizado correctamente')
        showEditDialog.value = false
        await Promise.all([loadUsers(), loadRoles()])
    } catch (error) {
        notifyError(error, 'No se pudo actualizar el usuario')
    } finally {
        submittingEdit.value = false
    }
}

function confirmDeleteUser(user) {
    Dialog.create({
        title: 'Eliminar usuario',
        message: `¿Seguro que deseas eliminar al usuario "${user.name}"? Esta acción no se puede deshacer.`,
        cancel: { flat: true, label: 'Cancelar', color: 'grey-7' },
        ok: { unelevated: true, label: 'Eliminar', color: 'negative' },
        persistent: true,
    }).onOk(async () => {
        try {
            await api.delete(`/users/${user.id}`)
            notifySuccess('Usuario eliminado correctamente')
            await Promise.all([loadUsers(), loadRoles()])
        } catch (error) {
            notifyError(error, 'No se pudo eliminar el usuario')
        }
    })
}

function openEditRoleDialog(role) {
    Object.assign(editRoleForm, {
        id: role.id,
        name: role.name,
        permissions: visibleRolePermissions(role).map((permission) => permission.name),
    })
    showEditRoleDialog.value = true
}

async function submitEditRole() {
    submittingRoleEdit.value = true

    try {
        await api.put(`/roles/${editRoleForm.id}`, {
            name: editRoleForm.name,
            permissions: editRoleForm.permissions,
        })
        notifySuccess('Rol actualizado correctamente')
        showEditRoleDialog.value = false
        await Promise.all([loadRoles(), loadUsers()])
    } catch (error) {
        notifyError(error, 'No se pudo actualizar el rol')
    } finally {
        submittingRoleEdit.value = false
    }
}

function confirmDeleteRole(role) {
    Dialog.create({
        title: 'Eliminar rol',
        message: `¿Seguro que deseas eliminar el rol "${role.name}"?`,
        cancel: { flat: true, label: 'Cancelar', color: 'grey-7' },
        ok: { unelevated: true, label: 'Eliminar', color: 'negative' },
        persistent: true,
    }).onOk(async () => {
        try {
            await api.delete(`/roles/${role.id}`)
            notifySuccess('Rol eliminado correctamente')
            await loadRoles()
        } catch (error) {
            notifyError(error, 'No se pudo eliminar el rol')
        }
    })
}

onMounted(loadAdminData)
</script>

<style scoped>
.admin-page {
    background: transparent;
    min-height: calc(100vh - 60px);
    animation: pageEnter 0.45s ease both;
}

.admin-hero {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem 1.75rem;
    border-radius: 22px;
    background:
        radial-gradient(circle at 90% 10%, rgba(217, 119, 6, 0.28), transparent 40%),
        linear-gradient(135deg, #0f172a 0%, #0f766e 55%, #0d9488 100%);
    color: white;
    box-shadow: 0 24px 50px rgba(15, 118, 110, 0.22);
}

.admin-eyebrow {
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    font-size: 0.75rem;
    font-weight: 700;
    color: rgba(94, 234, 212, 0.9);
}

.admin-title {
    margin: 0;
    font-family: var(--app-font-display);
    font-weight: 600;
    letter-spacing: -0.02em;
    font-size: clamp(1.6rem, 2.8vw, 2.4rem);
    line-height: 1.15;
}

.admin-text {
    margin: 1rem 0 0;
    max-width: 42rem;
    color: rgba(236, 253, 245, 0.85);
    line-height: 1.55;
}

.admin-card {
    border-radius: 20px;
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    box-shadow: var(--app-shadow-md);
}

.admin-card-caption,
.user-caption {
    color: var(--app-ink-muted);
    font-size: 0.85rem;
}

.search-input {
    min-width: 240px;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    color: var(--app-ink-faint);
}

.user-card,
.role-card {
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.user-card:hover {
    border-color: rgba(15, 118, 110, 0.3);
    box-shadow: var(--app-shadow-sm);
}

.user-card--inactive {
    opacity: 0.72;
}

.user-avatar {
    flex-shrink: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
}

.user-meta {
    min-width: 0;
}

.user-id-chip {
    background: var(--app-primary-soft) !important;
    color: var(--app-primary) !important;
}

.user-id-chip :deep(.q-chip__icon),
.user-id-chip :deep(.q-chip__content) {
    color: inherit !important;
}

.empresa-chip {
    background: var(--app-accent-soft) !important;
    color: var(--app-accent) !important;
    font-weight: 600;
}

.role-permission-chip {
    background: var(--app-surface-elevated) !important;
    color: var(--app-ink) !important;
    border: 1px solid var(--app-border);
}

.role-permission-chip :deep(.q-chip__content),
.role-permission-chip :deep(.q-chip__icon) {
    color: inherit !important;
}

.dialog-card {
    width: min(560px, 94vw);
    border-radius: 20px;
}

:deep(.q-field .q-chip) {
    background: var(--app-primary-soft) !important;
    color: var(--app-primary) !important;
}

:deep(.q-field .q-chip .q-chip__content),
:deep(.q-field .q-chip .q-icon) {
    color: inherit !important;
}
</style>
