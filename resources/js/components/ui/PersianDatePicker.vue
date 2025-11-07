<template>
  <div class="w-full">
    <label
      v-if="label"
      :for="inputId"
      :class="[
        'block text-sm font-medium mb-2',
        'text-[var(--theme-text-primary)]',
        { 'text-error': error }
      ]"
    >
      {{ label }}
      <span v-if="required" class="text-error">*</span>
    </label>

    <input
      :id="inputId"
      ref="dateInputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder || 'روز / ماه / سال'"
      :disabled="disabled"
      :readonly="readonly || false"
      :required="required"
      :class="[
        'w-full transition-all duration-200',
        'bg-[var(--theme-bg-elevated)] border border-[var(--theme-border)] rounded-lg',
        'text-[var(--theme-text-primary)]',
        'px-4 py-2.5 text-sm',
        'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'readonly:bg-[var(--theme-bg-base)] readonly:cursor-default',
        'cursor-pointer',
        { 'border-error focus:ring-error focus:border-error': error }
      ]"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @click="handleClick"
    />

    <p
      v-if="error"
      class="mt-1.5 text-xs text-error flex items-center gap-1"
    >
      <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

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
    default: 'روز / ماه / سال'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const dateInputRef = ref(null)
let datePickerInstance = null
const stableId = ref(null)

const persianDigitMap = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9'
}

const toEnglishDigits = (value) => {
  if (!value) return ''
  return value.toString().replace(/[۰-۹]/g, (digit) => persianDigitMap[digit] ?? digit)
}

const normalizeDateValue = (value) => {
  if (!value) return ''
  const sanitized = toEnglishDigits(value)
  // Accept both dash and slash separators, normalize to slash to match backend expectation
  return sanitized.replace(/-/g, '/').trim()
}

const formatUnixToString = (unixDate) => {
  if (typeof unixDate !== 'number' || Number.isNaN(unixDate)) {
    return ''
  }

  try {
    if (typeof window !== 'undefined' && typeof window.persianDate === 'function') {
      const instance = new window.persianDate(unixDate)

      if (instance && typeof instance.toLocale === 'function') {
        return instance.toLocale('en').format('YYYY/MM/DD')
      }

      return toEnglishDigits(instance.format('YYYY/MM/DD'))
    }
  } catch (error) {
    console.warn('Failed to format persian date:', error)
  }

  // Fallback to unix timestamp conversion using native Date (approximate)
  const date = new Date(unixDate)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}

const inputId = computed(() => {
  if (props.id) {
    return props.id
  }
  if (!stableId.value) {
    stableId.value = `persian-date-${Math.random().toString(36).substr(2, 9)}`
  }
  return stableId.value
})

const initializeDatePicker = async () => {
  if (!dateInputRef.value) {
    return
  }

  // Wait for persian-datepicker to be available
  if (typeof window.jQuery === 'undefined' || !window.jQuery.fn.pDatepicker) {
    // Try loading the scripts if not available
    await loadPersianDatePicker()
  }

  if (dateInputRef.value && typeof window.jQuery !== 'undefined' && window.jQuery.fn.pDatepicker) {
    try {
      const $el = window.jQuery(dateInputRef.value)

      // Destroy existing instance if any
      if (datePickerInstance) {
        try {
          if (typeof datePickerInstance.destroy === 'function') {
            datePickerInstance.destroy()
          } else if ($el.data('pDatepicker')) {
            $el.pDatepicker('destroy')
          }
        } catch (e) {
          // Ignore
        }
        datePickerInstance = null
      }

      const datePickerOptions = {
        calendarType: 'persian',
        format: 'YYYY/MM/DD',
        initialValue: !!props.modelValue,
        autoClose: true,
        observer: true,
        inputDelay: 800,
        position: [0, -10], // [x, y] - negative y positions it above the input
        toolbox: {
          enabled: true,
          todayButton: {
            enabled: true
          },
          submitButton: {
            enabled: true
          },
          calendarSwitch: {
            enabled: false
          }
        },
        navigator: {
          enabled: true,
          scroll: {
            enabled: true
          }
        },
        formatter: (unixDate) => {
          const formatted = formatUnixToString(unixDate)
          if (dateInputRef.value) {
            dateInputRef.value.value = formatted
          }
          return formatted
        },
        onSelect: (unixDate) => {
          const formatted = formatUnixToString(unixDate)
          if (formatted) {
            if (dateInputRef.value) {
              dateInputRef.value.value = formatted
            }
            emit('update:modelValue', formatted)
          }
        },
        onShow: () => {
          // Ensure datepicker appears above the input
          if (dateInputRef.value && window.jQuery) {
            const $el = window.jQuery(dateInputRef.value)
            const pickerInstance = $el.data('pDatepicker')
            if (pickerInstance) {
              // Wait for calendar DOM to be ready
              setTimeout(() => {
                try {
                  // Find the calendar element - persian-datepicker appends to body or near input
                  // Try multiple selectors to find the calendar
                  let calendarEl = null

                  // Method 1: Check if picker instance has calendar reference
                  if (pickerInstance.$calendar && pickerInstance.$calendar.length) {
                    calendarEl = pickerInstance.$calendar
                  } else if (pickerInstance.$wrapper && pickerInstance.$wrapper.length) {
                    calendarEl = pickerInstance.$wrapper
                  } else {
                    // Method 2: Search in DOM for persian-datepicker elements
                    const $body = window.jQuery('body')
                    calendarEl = $body.find('.pdp-wrapper, .pdp-calendar, [class*="pdp"], [class*="persian-datepicker"]').last()

                    // If not found in body, check near input
                    if (!calendarEl.length) {
                      calendarEl = $el.closest('div').find('.pdp-wrapper, .pdp-calendar, [class*="pdp"]').last()
                    }
                  }

                  if (calendarEl && calendarEl.length) {
                    const rect = dateInputRef.value.getBoundingClientRect()
                    const calendarHeight = calendarEl.outerHeight() || 350

                    // Calculate position above input
                    let topPosition = rect.top - calendarHeight - 5 // 5px gap above

                    // Ensure it doesn't go off-screen at the top
                    if (topPosition < 5) {
                      topPosition = 5
                    }

                    // Apply position
                    calendarEl.css({
                      position: 'fixed',
                      top: `${topPosition}px`,
                      left: `${rect.left}px`,
                      zIndex: 9999,
                      marginTop: 0 // Remove any default margin
                    })
                  }
                } catch (e) {
                  console.warn('Could not reposition datepicker:', e)
                }
              }, 100) // Increased timeout to ensure calendar is rendered
            }
          }
        },
        onHide: () => {
          // Date picker hidden
        }
      }

      // Set initial value if provided
      if (props.modelValue) {
        const normalizedInitialValue = normalizeDateValue(props.modelValue)
        dateInputRef.value.value = normalizedInitialValue
      }

      // Initialize persian-datepicker
      $el.pDatepicker(datePickerOptions)

      // Get the instance from jQuery data
      datePickerInstance = $el.data('pDatepicker') || null

      // Listen for date changes
      if (dateInputRef.value) {
        dateInputRef.value.addEventListener('change', handleDateChange)
        dateInputRef.value.value = normalizeDateValue(dateInputRef.value.value)
      }
    } catch (error) {
      console.error('Error initializing date picker:', error)
    }
  }
}

const loadPersianDatePicker = () => {
  return new Promise((resolve, reject) => {
    // First, ensure jQuery is loaded (required by persian-datepicker)
    const loadJQuery = () => {
      return new Promise((jqResolve, jqReject) => {
        if (typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined') {
          jqResolve()
          return
        }

        // Check if jQuery script already exists
        const existingJQueryScript = document.querySelector('script[src*="jquery"]')
        if (existingJQueryScript) {
          existingJQueryScript.addEventListener('load', () => {
            setTimeout(() => {
              if (typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined') {
                jqResolve()
              } else {
                jqReject(new Error('jQuery failed to load'))
              }
            }, 100)
          })
          existingJQueryScript.addEventListener('error', jqReject)
          return
        }

        // Load jQuery from CDN
        const jqueryScript = document.createElement('script')
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js'
        jqueryScript.onload = () => {
          setTimeout(() => {
            if (typeof window.jQuery !== 'undefined' && typeof window.$ !== 'undefined') {
              jqResolve()
            } else {
              jqReject(new Error('jQuery failed to initialize'))
            }
          }, 50)
        }
        jqueryScript.onerror = jqReject
        document.body.appendChild(jqueryScript)
      })
    }

    // Load dependencies in order: jQuery -> persian-date -> persian-datepicker
    loadJQuery()
      .then(() => {
        // Check if persian-datepicker is already loaded
        if (window.jQuery && window.jQuery.fn.pDatepicker) {
          resolve()
          return
        }

        // Load persian-date.js first (dependency)
        return new Promise((persianDateResolve, persianDateReject) => {
          const existingPersianDate = document.querySelector('script[src*="persian-date"]')
          if (existingPersianDate) {
            existingPersianDate.addEventListener('load', persianDateResolve)
            existingPersianDate.addEventListener('error', persianDateReject)
            return
          }

          const persianDateScript = document.createElement('script')
          persianDateScript.src = 'https://cdn.jsdelivr.net/npm/persian-date@latest/dist/persian-date.min.js'
          persianDateScript.onload = persianDateResolve
          persianDateScript.onerror = persianDateReject
          document.body.appendChild(persianDateScript)
        })
      })
      .then(() => {
        // Check if persian-datepicker is already loaded
        if (window.jQuery && window.jQuery.fn.pDatepicker) {
          resolve()
          return
        }

        // Load CSS
        if (!document.querySelector('link[href*="persian.datepicker"]')) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = 'https://cdn.jsdelivr.net/npm/persian-datepicker@latest/dist/css/persian-datepicker.min.css'
          document.head.appendChild(link)
        }

        // Load persian-datepicker.js
        const existingScript = document.querySelector('script[src*="persian.datepicker"]')
        if (existingScript) {
          existingScript.addEventListener('load', resolve)
          existingScript.addEventListener('error', reject)
          return
        }

        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/persian-datepicker@latest/dist/js/persian-datepicker.min.js'
        script.onload = () => {
          // Wait a bit for the plugin to register
          setTimeout(() => {
            if (window.jQuery && window.jQuery.fn.pDatepicker) {
              resolve()
            } else {
              reject(new Error('Persian datepicker failed to load'))
            }
          }, 100)
        }
        script.onerror = reject
        document.body.appendChild(script)
      })
      .catch(reject)
  })
}

const handleDateChange = (event) => {
  const value = normalizeDateValue(event.target.value)
  if (event.target.value !== value) {
    event.target.value = value
  }
  emit('update:modelValue', value)
}

const handleInput = (event) => {
  const value = normalizeDateValue(event.target.value)
  if (event.target.value !== value) {
    event.target.value = value
  }
  emit('update:modelValue', value)
}

const handleBlur = (event) => {
  emit('blur', event)
}

const handleClick = (event) => {
  // Ensure picker opens on click (only if not disabled or readonly)
  if (dateInputRef.value && !props.disabled && !props.readonly) {
    event.preventDefault()
    event.stopPropagation()

    // Focus the input first
    dateInputRef.value.focus()

    // Then try to show the picker
    if (datePickerInstance && typeof datePickerInstance.show === 'function') {
      setTimeout(() => {
        datePickerInstance.show()
      }, 10)
    } else if (window.jQuery && window.jQuery.fn.pDatepicker && dateInputRef.value) {
      const $el = window.jQuery(dateInputRef.value)
      if ($el.data('pDatepicker')) {
        $el.pDatepicker('show')
      } else {
        // If instance not ready, try to initialize it
        setTimeout(() => {
          initializeDatePicker()
        }, 50)
      }
    }
  }
}

const handleFocus = (event) => {
  emit('focus', event)
  // Ensure picker opens on focus (only if not disabled or readonly)
  if (dateInputRef.value && !props.disabled && !props.readonly) {
    if (datePickerInstance && typeof datePickerInstance.show === 'function') {
      setTimeout(() => {
        datePickerInstance.show()
      }, 50)
    } else if (window.jQuery && window.jQuery.fn.pDatepicker && dateInputRef.value) {
      const $el = window.jQuery(dateInputRef.value)
      if ($el.data('pDatepicker')) {
        setTimeout(() => {
          $el.pDatepicker('show')
        }, 50)
      }
    }
  }
}

watch(() => props.modelValue, async (newVal) => {
  await nextTick()
  const normalizedValue = normalizeDateValue(newVal)

  if (dateInputRef.value && normalizedValue !== dateInputRef.value.value) {
    const oldValue = dateInputRef.value.value
    dateInputRef.value.value = normalizedValue || ''

    // Update date picker value if initialized
    // Since observer is enabled, it should watch for input changes
    // But we can also manually update if needed
    if (window.jQuery && window.jQuery.fn.pDatepicker && dateInputRef.value) {
      const $el = window.jQuery(dateInputRef.value)
      if ($el.data('pDatepicker') && normalizedValue) {
        try {
          // Try to set the date - format should be YYYY/MM/DD
          // The observer option will also watch for manual input changes
          $el.pDatepicker('setDate', normalizedValue)
        } catch (e) {
          // If setDate fails, the observer should handle the value change
          // or we can trigger change event
          if (normalizedValue && normalizedValue !== oldValue) {
            dateInputRef.value.dispatchEvent(new Event('input', { bubbles: true }))
          }
        }
      }
    }
  }
})

onMounted(async () => {
  await nextTick()

  // Check if we're inside a modal (common modal class or parent check)
  const isInModal = dateInputRef.value?.closest('[role="dialog"], .modal, [class*="modal"], [class*="Modal"]') !== null

  // Wait longer if in a modal to allow modal animation to complete
  const delay = isInModal ? 400 : 100

  setTimeout(async () => {
    // Retry initialization if it fails the first time
    let retries = 3
    let initialized = false

    while (retries > 0 && !initialized) {
      try {
        await initializeDatePicker()
        // Verify initialization was successful
        if (dateInputRef.value && window.jQuery && window.jQuery.fn.pDatepicker) {
          // Check if the input has been initialized by persian-datepicker
          const $el = window.jQuery(dateInputRef.value)
          if ($el && $el.data('pDatepicker')) {
            initialized = true
            datePickerInstance = $el.data('pDatepicker')
          } else if (datePickerInstance) {
            initialized = true
          }
        }

        if (initialized) break
      } catch (error) {
        console.warn('Date picker initialization attempt failed:', error)
      }

      retries--
      if (!initialized && retries > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    if (!initialized) {
      console.error('Failed to initialize date picker after retries')
    }
  }, delay)
})

onUnmounted(() => {
  if (dateInputRef.value) {
    dateInputRef.value.removeEventListener('change', handleDateChange)
  }

  // Clean up date picker instance
  if (datePickerInstance || (window.jQuery && dateInputRef.value)) {
    try {
      if (window.jQuery && dateInputRef.value) {
        const $el = window.jQuery(dateInputRef.value)
        if ($el.data('pDatepicker')) {
          $el.pDatepicker('destroy')
        }
      } else if (datePickerInstance && typeof datePickerInstance.destroy === 'function') {
        datePickerInstance.destroy()
      }
    } catch (e) {
      // Ignore destroy errors
      console.warn('Date picker cleanup warning:', e)
    }
    datePickerInstance = null
  }

  // Reset stable ID for next mount
  stableId.value = null
})
</script>

<style scoped>
.text-error {
  color: var(--color-error, #EF4444);
}
</style>

