<template>
  <div class="chat-area" ref="chatContainer">
    <div class="messages">
      <div
        v-for="message in messages"
        :key="message.id"
        class="message"
        :class="message.role"
      >
        <div class="message-avatar">
          <span>{{ message.role === "user" ? "U" : "A" }}</span>
        </div>
        <div class="message-content">
          <div
            class="message-text"
            v-html="formatMessage(message.content)"
          ></div>
          <div v-if="message.streaming" class="streaming-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { marked } from "marked";
import type { Message } from "../types";

const props = defineProps<{
  messages: Message[];
  streaming: boolean;
}>();

const chatContainer = ref<HTMLElement>();

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

watch(
  () => props.messages,
  async () => {
    await nextTick();
    scrollToBottom();
  },
  { deep: true }
);

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
}

function formatMessage(content: string): string {
  if (!content) return "";

  try {
    // 使用 marked 渲染 Markdown
    return marked.parse(content) as string;
  } catch (error) {
    console.error("Markdown 渲染错误:", error);
    // 降级处理：简单的换行转换
    return content.replace(/\n/g, "<br>");
  }
}
</script>

<style scoped lang="scss">
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--bg-primary);
}

.messages {
  max-width: 900px;
  margin: 0 auto;
}

.message {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease-in;

  &.user {
    .message-avatar {
      background-color: var(--accent-color);
      color: var(--bg-primary);
    }
  }

  &.assistant {
    .message-avatar {
      background-color: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;

  // Markdown 样式
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin: 16px 0 8px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
  }

  :deep(h1) {
    font-size: 1.8em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
  }

  :deep(h2) {
    font-size: 1.5em;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 6px;
  }

  :deep(h3) {
    font-size: 1.3em;
  }

  :deep(h4) {
    font-size: 1.1em;
  }

  :deep(p) {
    margin: 8px 0;
  }

  :deep(ul),
  :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(blockquote) {
    border-left: 4px solid var(--border-color);
    padding: 8px 16px;
    margin: 12px 0;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    font-style: italic;
  }

  :deep(a) {
    color: var(--accent-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid var(--border-color);
    margin: 16px 0;
  }

  :deep(table) {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    overflow-x: auto;
    display: block;

    th,
    td {
      border: 1px solid var(--border-color);
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background-color: var(--bg-tertiary);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background-color: var(--bg-secondary);
    }
  }

  :deep(code) {
    background-color: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: "Courier New", monospace;
    color: #e06c75;
  }

  :deep(pre) {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 12px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: none;
      padding: 0;
      color: var(--text-primary);
    }
  }

  :deep(strong) {
    font-weight: 600;
    color: var(--text-primary);
  }

  :deep(em) {
    font-style: italic;
    color: var(--text-secondary);
  }

  :deep(img) {
    max-width: 100%;
    border-radius: 4px;
    margin: 8px 0;
  }
}

.streaming-indicator {
  display: flex;
  gap: 4px;
  margin-top: 8px;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--text-tertiary);
    animation: pulse 1.4s infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  40% {
    opacity: 1;
    transform: scale(1.2);
  }
}
</style>
