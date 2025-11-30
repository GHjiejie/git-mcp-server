<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <button class="new-chat-btn" @click="$emit('new-conversation')">
        <span class="icon">+</span>
        新建对话
      </button>
    </div>

    <div class="conversations-list">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-item"
        :class="{ active: conv.id === activeConversationId }"
        @click="$emit('select-conversation', conv.id)"
      >
        <div class="conversation-content">
          <div class="conversation-title">{{ conv.title }}</div>
          <div class="conversation-time">{{ formatTime(conv.updatedAt) }}</div>
        </div>
        <button
          class="delete-btn"
          @click.stop="$emit('delete-conversation', conv.id)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar">U</div>
        <span>用户</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from "../types";

defineProps<{
  conversations: Conversation[];
  activeConversationId: string;
}>();

defineEmits<{
  "new-conversation": [];
  "select-conversation": [id: string];
  "delete-conversation": [id: string];
}>();

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return date.toLocaleDateString("zh-CN");
}
</script>

<style scoped lang="scss">
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.new-chat-btn {
  width: 100%;
  padding: 12px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background-color: var(--hover-bg);
    border-color: var(--accent-color);
  }

  .icon {
    font-size: 20px;
    font-weight: 300;
  }
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--hover-bg);

    .delete-btn {
      opacity: 1;
    }
  }

  &.active {
    background-color: var(--bg-tertiary);
  }
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  color: var(--text-primary);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.conversation-time {
  color: var(--text-tertiary);
  font-size: 12px;
}

.delete-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 20px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: var(--error-color);
    color: white;
  }
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-secondary);
  font-size: 14px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent-color);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
