<template>
  <div class="header">
    <div class="header-left">
      <div class="server-info">
        <div
          class="server-status"
          :class="{ connected: server?.connected }"
        ></div>
        <div class="server-details">
          <div class="server-name">{{ server?.name || "MCP 服务器" }}</div>
          <div class="server-desc">{{ server?.description || "未连接" }}</div>
        </div>
      </div>
    </div>

    <div class="header-right">
      <button class="settings-btn" @click="$emit('toggle-settings')">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="3" />
          <path
            d="M12 1v6m0 6v6m-5.2-13.2l4.3 4.3m4.3 4.3l4.2 4.2m-16.5-4.2l4.3-4.3m4.2-4.3L7.8 22.8"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MCPServer } from "../types";

defineProps<{
  server: MCPServer | undefined;
  showSettings: boolean;
}>();

defineEmits<{
  "toggle-settings": [];
}>();
</script>

<style scoped lang="scss">
.header {
  height: 60px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.server-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.server-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--text-tertiary);

  &.connected {
    background-color: var(--success-color);
  }
}

.server-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.server-name {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.server-desc {
  color: var(--text-tertiary);
  font-size: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    color: var(--text-primary);
  }
}
</style>
