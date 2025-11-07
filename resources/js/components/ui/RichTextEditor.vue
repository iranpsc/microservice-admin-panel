<template>
  <div class="space-y-2" dir="rtl">
    <label
      v-if="label"
      :for="editorId"
      class="block text-sm font-medium text-[var(--theme-text-primary)]"
      :class="{ 'text-error': error }"
    >
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <div
      :id="editorId"
      ref="editorRef"
      class="metaverse-quill rounded-xl border border-[var(--theme-border)] bg-[var(--theme-bg-elevated)]/80"
      :class="editorClass"
    />

    <p v-if="helperText && !error" class="text-xs text-[var(--theme-text-secondary)]">
      {{ helperText }}
    </p>
    <p v-if="error" class="text-xs text-error">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helperText: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  minHeight: {
    type: String,
    default: '220px'
  },
  toolbar: {
    type: Array,
    default: () => [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link'],
      ['clean']
    ]
  },
  theme: {
    type: String,
    default: 'snow'
  },
  rtl: {
    type: Boolean,
    default: true
  },
  editorClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'ready'])

const editorRef = ref(null)
const quillInstance = ref(null)
const editorId = computed(() => `rich-text-${Math.random().toString(36).slice(2, 9)}`)

const initializeQuill = async () => {
  if (!editorRef.value) return

  if (!quillInstance.value) {
    const { default: Quill } = await import('quill')
    await import('quill/dist/quill.snow.css')

    const options = {
      theme: props.theme,
      placeholder: props.placeholder,
      modules: {
        toolbar: props.toolbar
      }
    }

    quillInstance.value = new Quill(editorRef.value, options)

    if (props.rtl) {
      quillInstance.value.root.setAttribute('dir', 'rtl')
      quillInstance.value.root.classList.add('quill-rtl')
    }

    quillInstance.value.root.style.minHeight = props.minHeight

    if (props.modelValue) {
      quillInstance.value.clipboard.dangerouslyPasteHTML(props.modelValue)
    }

    quillInstance.value.on('text-change', () => {
      const html = quillInstance.value.root.innerHTML
      if (html === '<p><br></p>') {
        emit('update:modelValue', '')
      } else {
        emit('update:modelValue', html)
      }
    })

    emit('ready', quillInstance.value)
  }
}

onMounted(() => {
  initializeQuill()
})

onBeforeUnmount(() => {
  if (quillInstance.value) {
    quillInstance.value.off('text-change')
    quillInstance.value = null
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (!quillInstance.value) return

    const currentHtml = quillInstance.value.root.innerHTML
    const normalizedCurrent = currentHtml === '<p><br></p>' ? '' : currentHtml
    const normalizedNew = newValue || ''

    if (normalizedCurrent !== normalizedNew) {
      const selection = quillInstance.value.getSelection()
      quillInstance.value.root.innerHTML = normalizedNew || ''
      if (selection) {
        const length = quillInstance.value.getLength()
        const index = Math.min(selection.index, length - 1)
        quillInstance.value.setSelection(index, selection.length)
      }
    }
  }
)
</script>

<style scoped>
.metaverse-quill :deep(.ql-toolbar.ql-snow) {
  background: var(--theme-bg-glass, rgba(255, 255, 255, 0.05));
  border-color: var(--theme-border, rgba(255, 255, 255, 0.1));
  color: var(--theme-text-primary, #f8fafc);
  border-radius: 12px 12px 0 0;
  direction: rtl;
}

.metaverse-quill :deep(.ql-toolbar .ql-picker) {
  color: var(--theme-text-primary, #f8fafc);
}

.metaverse-quill :deep(.ql-toolbar .ql-stroke) {
  stroke: var(--theme-text-primary, #f8fafc);
}

.metaverse-quill :deep(.ql-toolbar .ql-fill) {
  fill: var(--theme-text-primary, #f8fafc);
}

.metaverse-quill :deep(.ql-toolbar .ql-picker-options) {
  background: var(--theme-bg-elevated, #1e293b);
  border-color: var(--theme-border, rgba(255, 255, 255, 0.1));
}

.metaverse-quill :deep(.ql-container.ql-snow) {
  border-color: var(--theme-border, rgba(255, 255, 255, 0.1));
  border-radius: 0 0 12px 12px;
  background: var(--theme-bg-base, #0f172a);
}

.metaverse-quill :deep(.ql-editor) {
  color: var(--theme-text-primary, #f8fafc);
  font-size: 0.95rem;
  line-height: 1.8;
  direction: rtl;
}

.metaverse-quill :deep(.ql-editor a) {
  color: var(--theme-colors-secondary, #06b6d4);
}

.metaverse-quill :deep(.ql-editor.ql-blank::before) {
  color: var(--theme-text-muted, #64748b);
}

.text-error {
  color: var(--color-error, #ef4444);
}
</style>


