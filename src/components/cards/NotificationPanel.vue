<template>
  <!-- Banner de notificaciones lateral derecho mejorado -->
  <q-slide-transition>
    <div v-if="showBanner" class="notifications-sidebar">
      <!-- Enhanced header with gradient background and better typography -->
      <div class="notifications-header">
        <div class="flex items-center">
          <div class="notification-icon-wrapper">
            <q-icon name="notifications_active" class="notification-header-icon" />
          </div>
          <div class="header-text">
            <h3 class="header-title">Notificaciones</h3>
            <p class="header-subtitle" v-if="notifications.length">
              {{ notifications.length }} {{ notifications.length === 1 ? 'nueva' : 'nuevas' }}
            </p>
          </div>
        </div>
        <q-btn 
          flat 
          round 
          dense 
          icon="close" 
          @click="$emit('close')" 
          class="close-button"
        >
          <q-tooltip>Cerrar</q-tooltip>
        </q-btn>
      </div>

      <q-scroll-area class="notifications-content">
        <!-- Enhanced empty state with better visual design -->
        <div v-if="notifications.length === 0" class="no-notifications">
          <div class="empty-state-icon">
            <q-icon name="notifications_none" />
          </div>
          <h4 class="empty-state-title">Todo al día</h4>
          <p class="empty-state-subtitle">No tienes notificaciones pendientes</p>
        </div>

        <!-- Redesigned notification cards with modern styling -->
        <div v-else class="notifications-list">
          <div 
            v-for="notif in notifications" 
            :key="notif.id" 
            class="notification-card"
            :class="{ 'unread': !notif.read_at }"
          >
            <!-- Notification type icon -->
            <div class="notification-icon">
              <q-icon :name="getNotificationIcon(notif.type)" />
            </div>
            
            <!-- Notification content -->
            <div class="notification-content">
              <div class="notification-header-row">
                <h4 class="notification-title">{{ getNotificationTitle(notif.type) }}</h4>
                <span class="notification-time">{{ formatTime(notif.created_at) }}</span>
              </div>
              
              <p class="notification-message">{{ notif.message }}</p>
              
              <!-- Action buttons -->
              <div class="notification-actions">
                <q-btn 
                  v-if="!notif.read_at"
                  size="sm" 
                  flat
                  icon="visibility" 
                  @click="$emit('markAsRead', notif.id)"
                  class="action-button read-button"
                >
                  <q-tooltip>Marcar como leída</q-tooltip>
                </q-btn>
                <q-btn 
                  size="sm" 
                  flat
                  icon="delete_outline" 
                  @click="$emit('deleteNotification', notif.id)"
                  class="action-button delete-button"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </div>
            
            <!-- Unread indicator -->
            <div v-if="!notif.read_at" class="unread-indicator"></div>
          </div>
        </div>
      </q-scroll-area>

      <!-- Enhanced footer with gradient button -->
      <div class="notifications-footer" v-if="notifications.length > 0">
        <q-btn 
          flat
          icon="done_all" 
          label="Marcar todas como leídas"
          @click="$emit('markAllAsRead')"
          class="mark-all-button"
        />
      </div>
    </div>
  </q-slide-transition>
</template>

<script setup>
defineEmits(['close', 'markAsRead', 'deleteNotification', 'markAllAsRead'])

defineProps({
  showBanner: Boolean,
  notifications: Array
})

function getNotificationIcon(type) {
  const icons = {
    'info': 'info',
    'warning': 'warning',
    'error': 'error',
    'success': 'check_circle',
    'message': 'message',
    'system': 'settings',
    'user': 'person',
    'contract': 'description'
  }
  return icons[type] || 'notifications'
}

function getNotificationTitle(type) {
  const titles = {
    'info': 'Información',
    'warning': 'Advertencia', 
    'error': 'Error',
    'success': 'Éxito',
    'message': 'Mensaje',
    'system': 'Sistema',
    'user': 'Usuario',
    'contract': 'Contrato'
  }
  return titles[type] || 'Notificación'
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Ahora';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return date.toLocaleDateString();
}
</script>

<style scoped>
/* Modern notification sidebar with enhanced styling */
.notifications-sidebar {
  position: fixed;
  top: 60px;
  right: 0;
  bottom: 0;
  width: 420px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.12);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e2e8f0;
  backdrop-filter: blur(10px);
}

/* Enhanced header with gradient and better spacing */
.notifications-header {
  padding: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
  position: relative;
}

.notifications-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
}

.notification-icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.notification-header-icon {
  font-size: 24px;
  color: white;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 14px;
  opacity: 0.9;
  margin: 4px 0 0 0;
}

.close-button {
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

/* Enhanced content area with better scrolling */
.notifications-content {
  flex: 1;
  padding: 20px;
  background: #fafbfc;
}

/* Beautiful empty state design */
.no-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-state-icon .q-icon {
  font-size: 36px;
  color: #64748b;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

/* Modern notification cards with enhanced visual hierarchy */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  gap: 16px;
}

.notification-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
  border-color: #e2e8f0;
}

.notification-card.unread {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: #6366f1;
}

.notification-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.notification-icon .q-icon {
  font-size: 20px;
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 12px;
}

.notification-message {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
  margin: 0 0 16px 0;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  min-width: 36px;
  height: 36px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.read-button {
  color: #059669;
  background: rgba(5, 150, 105, 0.1);
}

.read-button:hover {
  background: rgba(5, 150, 105, 0.2);
}

.delete-button {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.delete-button:hover {
  background: rgba(220, 38, 38, 0.2);
}

.unread-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 8px;
  height: 8px;
  background: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 0 2px white;
}

/* Enhanced footer with gradient button */
.notifications-footer {
  padding: 20px;
  background: white;
  border-top: 1px solid #f1f5f9;
}

.mark-all-button {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.mark-all-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-sidebar {
    width: 100%;
    right: 0;
  }
}

@media (max-width: 480px) {
  .notifications-sidebar {
    top: 60px;
  }
  
  .notifications-header {
    padding: 16px;
    min-height: 64px;
  }
  
  .notifications-content {
    padding: 16px;
  }
  
  .notification-card {
    padding: 16px;
  }
}
</style>
