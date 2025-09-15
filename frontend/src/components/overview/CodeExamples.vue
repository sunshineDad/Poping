<template>
  <div class="code-examples">
    <div class="examples-header">
      <h3 class="examples-title">代码示例</h3>
      <div class="language-tabs">
        <button
          v-for="lang in languages"
          :key="lang.key"
          class="tab-btn"
          :class="{ active: activeLanguage === lang.key }"
          @click="setActiveLanguage(lang.key)"
        >
          <component :is="lang.icon" class="tab-icon" />
          {{ lang.name }}
        </button>
      </div>
    </div>
    
    <div class="examples-content">
      <div
        v-for="example in currentExamples"
        :key="example.id"
        class="example-card"
      >
        <div class="example-header">
          <div class="example-info">
            <h4 class="example-title">{{ example.title }}</h4>
            <p class="example-description">{{ example.description }}</p>
          </div>
          
          <button
            class="copy-btn"
            @click="copyCode(example.code)"
            :class="{ copied: copiedId === example.id }"
          >
            <CheckIcon v-if="copiedId === example.id" class="copy-icon" />
            <CopyIcon v-else class="copy-icon" />
            {{ copiedId === example.id ? '已复制' : '复制' }}
          </button>
        </div>
        
        <div class="code-container">
          <pre class="code-block"><code :class="`language-${activeLanguage}`">{{ example.code }}</code></pre>
        </div>
        
        <div v-if="example.notes" class="example-notes">
          <div class="notes-header">
            <InfoIcon class="notes-icon" />
            <span class="notes-title">说明</span>
          </div>
          <ul class="notes-list">
            <li v-for="note in example.notes" :key="note" class="note-item">
              {{ note }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <div class="examples-footer">
      <div class="footer-links">
        <a href="#" class="footer-link">
          <BookIcon class="link-icon" />
          查看完整文档
        </a>
        <a href="#" class="footer-link">
          <ExternalLinkIcon class="link-icon" />
          更多示例
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CodeExample, Language } from '@/types/overview'
import {
  CopyIcon,
  CheckIcon,
  InfoIcon,
  BookIcon,
  ExternalLinkIcon
} from '@/components/icons'

// Language icons (you can replace with actual icons)
const JavaScriptIcon = () => 'JS'
const PythonIcon = () => 'PY'
const CurlIcon = () => 'cURL'

interface Props {
  examples: CodeExample[]
}

const props = defineProps<Props>()

// State
const activeLanguage = ref<string>('javascript')
const copiedId = ref<string | null>(null)

// Languages configuration
const languages: Language[] = [
  { key: 'javascript', name: 'JavaScript', icon: JavaScriptIcon },
  { key: 'python', name: 'Python', icon: PythonIcon },
  { key: 'curl', name: 'cURL', icon: CurlIcon }
]

// Computed
const currentExamples = computed(() => {
  return props.examples.filter(example => example.language === activeLanguage.value)
})

// Methods
const setActiveLanguage = (language: string) => {
  activeLanguage.value = language
}

const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    const exampleId = props.examples.find(ex => ex.code === code)?.id
    if (exampleId) {
      copiedId.value = exampleId
      setTimeout(() => {
        copiedId.value = null
      }, 2000)
    }
  } catch (error) {
    console.error('复制失败:', error)
  }
}
</script>

<style scoped>
.code-examples {
  width: 100%;
}

/* Examples Header */
.examples-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-gray-200);
}

.examples-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0;
}

.language-tabs {
  display: flex;
  gap: 4px;
  background: var(--color-gray-100);
  padding: 4px;
  border-radius: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  color: var(--color-gray-600);
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: var(--color-gray-800);
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  background: white;
  color: var(--color-brand-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-icon {
  width: 14px;
  height: 14px;
}

/* Examples Content */
.examples-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.example-card {
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  background: white;
  overflow: hidden;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 20px;
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
}

.example-info {
  flex: 1;
}

.example-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
  margin: 0 0 4px 0;
}

.example-description {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
  line-height: 1.4;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-300);
}

.copy-btn.copied {
  background: var(--color-semantic-success);
  color: white;
  border-color: var(--color-semantic-success);
}

.copy-icon {
  width: 14px;
  height: 14px;
}

/* Code Container */
.code-container {
  position: relative;
  background: var(--color-gray-900);
  overflow-x: auto;
}

.code-block {
  margin: 0;
  padding: 20px;
  font-family: var(--font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: #E5E7EB;
  background: transparent;
  overflow-x: auto;
  white-space: pre;
}

.code-block code {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  background: transparent;
}

/* Language-specific syntax highlighting */
.language-javascript {
  color: #E5E7EB;
}

.language-python {
  color: #E5E7EB;
}

.language-curl {
  color: #E5E7EB;
}

/* Example Notes */
.example-notes {
  padding: 16px 20px;
  background: var(--color-gray-50);
  border-top: 1px solid var(--color-gray-200);
}

.notes-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.notes-icon {
  width: 16px;
  height: 16px;
  color: var(--color-semantic-info);
}

.notes-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-gray-800);
}

.notes-list {
  margin: 0;
  padding-left: 16px;
}

.note-item {
  font-size: 13px;
  color: var(--color-gray-600);
  line-height: 1.5;
  margin-bottom: 4px;
}

.note-item:last-child {
  margin-bottom: 0;
}

/* Examples Footer */
.examples-footer {
  padding-top: 16px;
  border-top: 1px solid var(--color-gray-200);
}

.footer-links {
  display: flex;
  gap: 16px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-gray-900);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.2s;
}

.footer-link:hover {
  color: var(--color-gray-600);
}

.link-icon {
  width: 14px;
  height: 14px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .examples-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .language-tabs {
    justify-content: center;
  }
  
  .example-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .copy-btn {
    align-self: flex-start;
  }
  
  .code-block {
    font-size: 12px;
    padding: 16px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .language-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: center;
  }
}
</style>