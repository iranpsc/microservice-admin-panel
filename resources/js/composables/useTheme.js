import { ref } from 'vue'

const isBrowser = typeof window !== 'undefined'
const isDocument = typeof document !== 'undefined'

const storedTheme = isBrowser ? window.localStorage.getItem('theme') : null
const currentTheme = ref(storedTheme || 'dark')

let initialized = false

const applyTheme = (theme) => {
  if (!isDocument) return
  document.documentElement.setAttribute('data-theme', theme)
  if (isBrowser) {
    window.localStorage.setItem('theme', theme)
  }
}

const setTheme = (theme) => {
  currentTheme.value = theme
  applyTheme(theme)
}

const toggleTheme = () => {
  const nextTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
  setTheme(nextTheme)
}

const initializeTheme = () => {
  if (initialized) return
  const themeToApply = currentTheme.value || 'dark'
  applyTheme(themeToApply)
  initialized = true
}

export const useTheme = () => {
  initializeTheme()

  return {
    currentTheme,
    toggleTheme,
    setTheme,
    initializeTheme
  }
}

