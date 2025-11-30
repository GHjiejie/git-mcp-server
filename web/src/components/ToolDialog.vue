<template>
  <div class="dialog-overlay" @click.self="$emit('cancel')">
    <div class="dialog">
      <div class="dialog-header">
        <h3>{{ tool.name }}</h3>
        <button class="close-btn" @click="$emit('cancel')">×</button>
      </div>

      <div class="dialog-body">
        <p class="tool-description">{{ tool.description }}</p>

        <div class="form-fields">
          <div
            v-for="(schema, key) in tool.inputSchema.properties"
            :key="key"
            class="form-field"
          >
            <label>
              {{ key }}
              <span
                v-if="tool.inputSchema.required?.includes(key)"
                class="required"
                >*</span
              >
            </label>
            <p class="field-desc">{{ schema.description }}</p>

            <input
              v-if="schema.type === 'string' && !schema.enum"
              v-model="formData[key]"
              type="text"
              :placeholder="schema.description"
            />

            <input
              v-else-if="schema.type === 'number'"
              v-model.number="formData[key]"
              type="number"
              :placeholder="schema.description"
            />

            <select v-else-if="schema.enum" v-model="formData[key]">
              <option value="">请选择...</option>
              <option
                v-for="option in schema.enum"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>

            <div v-else-if="schema.type === 'boolean'" class="checkbox-field">
              <input
                type="checkbox"
                :id="`field-${key}`"
                v-model="formData[key]"
              />
              <label :for="`field-${key}`">启用</label>
            </div>

            <textarea
              v-else-if="schema.type === 'array'"
              v-model="arrayInputs[key]"
              :placeholder="`输入${key}，每行一个`"
              rows="3"
            ></textarea>

            <input
              v-else
              v-model="formData[key]"
              type="text"
              :placeholder="schema.description"
            />
          </div>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
        <button class="btn btn-primary" @click="handleConfirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { Tool } from "../types";

const props = defineProps<{
  tool: Tool;
}>();

const emit = defineEmits<{
  confirm: [params: any];
  cancel: [];
}>();

const formData = reactive<Record<string, any>>({});
const arrayInputs = reactive<Record<string, string>>({});

// 初始化默认值
Object.entries(props.tool.inputSchema.properties).forEach(([key, schema]) => {
  if (schema.default !== undefined) {
    formData[key] = schema.default;
  } else if (schema.type === "boolean") {
    formData[key] = false;
  } else if (schema.type === "array") {
    arrayInputs[key] = "";
  }
});

function handleConfirm() {
  const params: Record<string, any> = { ...formData };

  // 处理数组类型
  Object.entries(arrayInputs).forEach(([key, value]) => {
    if (value.trim()) {
      params[key] = value
        .split("\n")
        .map((v) => v.trim())
        .filter((v) => v);
    }
  });

  emit("confirm", params);
}
</script>

<style scoped lang="scss">
.dialog-overlay {
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.dialog {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
    color: var(--text-primary);
  }
}

.close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-tertiary);
  font-size: 28px;
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

.dialog-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.tool-description {
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);

    .required {
      color: var(--error-color);
      margin-left: 2px;
    }
  }
}

.field-desc {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

input[type="text"],
input[type="number"],
select,
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

  &::placeholder {
    color: var(--text-tertiary);
  }
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.checkbox-field {
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="checkbox"] {
    width: auto;
    cursor: pointer;
  }

  label {
    margin: 0;
    cursor: pointer;
    color: var(--text-secondary);
  }
}

.dialog-footer {
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
