<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-panel">
      <div class="settings-header">
        <h2>MCP 服务器设置</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="settings-body">
        <div class="setting-section">
          <h3>服务器信息</h3>

          <div class="setting-field">
            <label>服务器名称</label>
            <input v-model="serverData.name" type="text" />
          </div>

          <div class="setting-field">
            <label>描述</label>
            <textarea v-model="serverData.description" rows="2"></textarea>
          </div>

          <div class="setting-field">
            <label>状态</label>
            <div class="status-indicator">
              <div
                class="status-dot"
                :class="{ connected: serverData.connected }"
              ></div>
              <span>{{ serverData.connected ? "已连接" : "未连接" }}</span>
            </div>
          </div>
        </div>

        <div class="setting-section">
          <h3>可用工具 ({{ serverData.tools.length }})</h3>

          <div class="tools-list">
            <div
              v-for="tool in serverData.tools"
              :key="tool.name"
              class="tool-card"
            >
              <div class="tool-card-header">
                <span class="tool-icon">🔧</span>
                <span class="tool-name">{{ tool.name }}</span>
              </div>
              <div class="tool-card-desc">{{ tool.description }}</div>
            </div>
          </div>
        </div>

        <div class="setting-section">
          <h3>连接设置</h3>

          <div class="setting-field">
            <label>API 地址</label>
            <input
              v-model="apiUrl"
              type="text"
              placeholder="http://localhost:3001"
            />
          </div>

          <button class="btn-reconnect" @click="reconnect">重新连接</button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="saveSettings">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { MCPServer } from "../types";

const props = defineProps<{
  server: MCPServer | undefined;
}>();

const emit = defineEmits<{
  close: [];
  "update-server": [server: MCPServer];
}>();

const serverData = reactive<MCPServer>({
  name: props.server?.name || "",
  description: props.server?.description || "",
  connected: props.server?.connected || false,
  tools: props.server?.tools || [],
});

const apiUrl = ref("http://localhost:3001");

function saveSettings() {
  emit("update-server", serverData);
  emit("close");
}

async function reconnect() {
  try {
    const response = await fetch(`${apiUrl.value}/api/tools`);
    if (response.ok) {
      const tools = await response.json();
      serverData.tools = tools;
      serverData.connected = true;
    } else {
      serverData.connected = false;
      alert("连接失败");
    }
  } catch (error) {
    serverData.connected = false;
    alert("连接失败: " + (error instanceof Error ? error.message : "未知错误"));
  }
}
</script>

<style scoped lang="scss">
.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

.settings-panel {
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.settings-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background-color: var(--hover-bg);
    color: var(--text-primary);
  }
}

.settings-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.setting-section {
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.setting-field {
  margin-bottom: 16px;

  label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  input,
  textarea {
    width: 100%;
    padding: 10px 12px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;

    &:focus {
      border-color: var(--accent-color);
    }
  }

  textarea {
    resize: vertical;
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--text-tertiary);

  &.connected {
    background-color: var(--success-color);
  }
}

.tools-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.tool-card {
  padding: 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    border-color: var(--accent-color);
  }
}

.tool-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;

  .tool-icon {
    font-size: 16px;
  }

  .tool-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.tool-card-desc {
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.btn-reconnect {
  width: 100%;
  padding: 12px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    border-color: var(--accent-color);
  }
}

.settings-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &.btn-secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);

    &:hover {
      background-color: var(--hover-bg);
    }
  }

  &.btn-primary {
    background-color: var(--accent-color);
    color: var(--bg-primary);

    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
