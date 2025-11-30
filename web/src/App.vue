<template>
  <div class="app">
    <Sidebar
      :conversations="conversations"
      :activeConversationId="activeConversationId"
      @new-conversation="createNewConversation"
      @select-conversation="selectConversation"
      @delete-conversation="deleteConversation"
    />
    <div class="main-content">
      <Header
        :server="currentServer"
        :showSettings="showSettings"
        @toggle-settings="showSettings = !showSettings"
      />
      <ChatArea :messages="currentMessages" :streaming="isStreaming" />
      <InputArea
        :disabled="isStreaming"
        :tools="currentServer?.tools || []"
        @send-message="handleSendMessage"
      />
    </div>
    <SettingsPanel
      v-if="showSettings"
      :server="currentServer"
      @close="showSettings = false"
      @update-server="updateServer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, nextTick } from "vue";
import Sidebar from "./components/Sidebar.vue";
import Header from "./components/Header.vue";
import ChatArea from "./components/ChatArea.vue";
import InputArea from "./components/InputArea.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import type { Conversation, Message, MCPServer, Tool } from "./types";

const conversations = ref<Conversation[]>([
  {
    id: "1",
    title: "默认对话",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
]);

const activeConversationId = ref("1");
const showSettings = ref(false);
const isStreaming = ref(false);

const currentServer = ref<MCPServer>({
  name: "Git MCP Server",
  description: "Git 操作的 MCP 服务器",
  connected: true,
  tools: [],
});

const currentConversation = computed(() =>
  conversations.value.find((c) => c.id === activeConversationId.value)
);

const currentMessages = computed(
  () => currentConversation.value?.messages || []
);

function createNewConversation() {
  const newConv: Conversation = {
    id: Date.now().toString(),
    title: "新对话",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  conversations.value.unshift(newConv);
  activeConversationId.value = newConv.id;
}

function selectConversation(id: string) {
  activeConversationId.value = id;
}

function deleteConversation(id: string) {
  const index = conversations.value.findIndex((c) => c.id === id);
  if (index > -1) {
    conversations.value.splice(index, 1);
    if (activeConversationId.value === id && conversations.value.length > 0) {
      activeConversationId.value = conversations.value[0].id;
    }
  }
}

async function handleSendMessage(content: string, tool?: Tool, params?: any) {
  if (!currentConversation.value) return;

  const userMessage: Message = reactive({
    id: Date.now().toString(),
    role: "user",
    content: tool
      ? `使用工具: ${tool.name}\n${JSON.stringify(params, null, 2)}`
      : content,
    timestamp: Date.now(),
  });

  currentConversation.value.messages.push(userMessage);
  currentConversation.value.updatedAt = Date.now();

  if (
    !currentConversation.value.messages.length ||
    currentConversation.value.title === "新对话"
  ) {
    currentConversation.value.title =
      content.substring(0, 30) + (content.length > 30 ? "..." : "");
  }

  const assistantMessage: Message = reactive({
    id: (Date.now() + 1).toString(),
    role: "assistant",
    content: "",
    timestamp: Date.now(),
    streaming: true,
  });

  currentConversation.value.messages.push(assistantMessage);
  isStreaming.value = true;

  try {
    if (tool) {
      await streamToolResponse(tool, params, assistantMessage);
    } else {
      await streamChatResponse(content, assistantMessage);
    }
  } catch (error) {
    assistantMessage.content = `错误: ${
      error instanceof Error ? error.message : "未知错误"
    }`;
  } finally {
    assistantMessage.streaming = false;
    isStreaming.value = false;
  }
}

async function streamToolResponse(tool: Tool, params: any, message: Message) {
  const response = await fetch("/api/tool/call", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool: tool.name, params }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No response body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    message.content += chunk;
  }
}

async function streamChatResponse(content: string, message: Message) {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error("No response body");

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");

    // 保留最后一个可能不完整的行
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.slice(6).trim();

        // 检查是否是结束标记
        if (dataStr === "[DONE]") {
          return;
        }

        try {
          const data = JSON.parse(dataStr);
          if (data.content) {
            message.content += data.content;
            await nextTick();
          }
          if (data.error) {
            message.content += `\n\n错误: ${data.error}`;
          }
        } catch (e) {
          // Skip invalid JSON
          console.warn("Invalid JSON in SSE:", dataStr);
        }
      }
    }
  }

  // 处理剩余的 buffer
  if (buffer.trim() && buffer.startsWith("data: ")) {
    const dataStr = buffer.slice(6).trim();
    if (dataStr !== "[DONE]") {
      try {
        const data = JSON.parse(dataStr);
        if (data.content) {
          message.content += data.content;
          await nextTick();
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}

function updateServer(server: MCPServer) {
  currentServer.value = server;
}

// 初始化：加载工具列表
async function loadTools() {
  try {
    const response = await fetch("/api/tools");
    if (response.ok) {
      const tools = await response.json();
      currentServer.value.tools = tools;
    }
  } catch (error) {
    console.error("Failed to load tools:", error);
  }
}

loadTools();
</script>

<style scoped lang="scss">
.app {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
</style>
