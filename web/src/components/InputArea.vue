<template>
  <div class="input-area">
    <div v-if="selectedTool" class="tool-selected">
      <span class="tool-icon">🔧</span>
      <span class="tool-name">{{ selectedTool.name }}</span>
      <button class="clear-tool" @click="clearTool">×</button>
    </div>

    <div class="input-container">
      <button
        class="tool-btn"
        @click="showToolPicker = !showToolPicker"
        :disabled="disabled"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
          />
        </svg>
      </button>

      <textarea
        v-model="inputText"
        placeholder="输入消息或选择工具..."
        @keydown="handleKeyDown"
        :disabled="disabled"
        ref="textarea"
      ></textarea>

      <button
        class="send-btn"
        @click="handleSend"
        :disabled="disabled || (!inputText.trim() && !selectedTool)"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>

    <div v-if="showToolPicker" class="tool-picker">
      <div class="tool-picker-header">
        <h3>选择工具</h3>
        <button @click="showToolPicker = false">×</button>
      </div>
      <div class="tool-list">
        <div
          v-for="tool in tools"
          :key="tool.name"
          class="tool-item"
          @click="selectTool(tool)"
        >
          <div class="tool-item-name">{{ tool.name }}</div>
          <div class="tool-item-desc">{{ tool.description }}</div>
        </div>
      </div>
    </div>

    <ToolDialog
      v-if="showToolDialog"
      :tool="selectedTool!"
      @confirm="handleToolConfirm"
      @cancel="showToolDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Tool } from "../types";
import ToolDialog from "./ToolDialog.vue";

const props = defineProps<{
  disabled: boolean;
  tools: Tool[];
}>();

const emit = defineEmits<{
  "send-message": [content: string, tool?: Tool, params?: any];
}>();

const inputText = ref("");
const textarea = ref<HTMLTextAreaElement>();
const showToolPicker = ref(false);
const showToolDialog = ref(false);
const selectedTool = ref<Tool>();

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
}

function handleSend() {
  if (props.disabled) return;

  if (selectedTool.value) {
    showToolDialog.value = true;
  } else if (inputText.value.trim()) {
    emit("send-message", inputText.value);
    inputText.value = "";
    nextTick(() => {
      if (textarea.value) {
        textarea.value.style.height = "auto";
      }
    });
  }
}

function selectTool(tool: Tool) {
  selectedTool.value = tool;
  showToolPicker.value = false;
  showToolDialog.value = true;
}

function clearTool() {
  selectedTool.value = undefined;
}

function handleToolConfirm(params: any) {
  if (selectedTool.value) {
    emit("send-message", "", selectedTool.value, params);
    selectedTool.value = undefined;
    showToolDialog.value = false;
  }
}
</script>

<style scoped lang="scss">
.input-area {
  padding: 20px;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  position: relative;
}

.tool-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
  color: var(--text-secondary);

  .tool-icon {
    font-size: 16px;
  }

  .tool-name {
    flex: 1;
    color: var(--text-primary);
  }

  .clear-tool {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: var(--hover-bg);
      color: var(--text-primary);
    }
  }
}

.input-container {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.tool-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background-color: var(--hover-bg);
    color: var(--text-primary);
    border-color: var(--accent-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

textarea {
  flex: 1;
  min-height: 40px;
  max-height: 200px;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: var(--accent-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::placeholder {
    color: var(--text-tertiary);
  }
}

.send-btn {
  width: 40px;
  height: 40px;
  border: none;
  background-color: var(--accent-color);
  color: var(--bg-primary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }
}

.tool-picker {
  position: absolute;
  bottom: 100%;
  left: 20px;
  right: 20px;
  max-width: 900px;
  margin: 0 auto 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
  max-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tool-picker-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
    color: var(--text-primary);
  }

  button {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;

    &:hover {
      background-color: var(--hover-bg);
      color: var(--text-primary);
    }
  }
}

.tool-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tool-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;

  &:hover {
    background-color: var(--hover-bg);
  }
}

.tool-item-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.tool-item-desc {
  font-size: 12px;
  color: var(--text-tertiary);
}
</style>
