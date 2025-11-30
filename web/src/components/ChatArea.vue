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
import type { Message } from "../types";

const props = defineProps<{
  messages: Message[];
  streaming: boolean;
}>();

const chatContainer = ref<HTMLElement>();

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

  // 简单的 markdown 格式化
  let formatted = content
    .replace(/\n/g, "<br>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 代码块
  formatted = formatted.replace(
    /```(\w+)?\n([\s\S]+?)```/g,
    (_, lang, code) => {
      return `<pre><code class="language-${lang || "text"}">${escapeHtml(
        code
      )}</code></pre>`;
    }
  );

  return formatted;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
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

  :deep(code) {
    background-color: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: "Courier New", monospace;
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
