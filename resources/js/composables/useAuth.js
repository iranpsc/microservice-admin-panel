import { ref, computed } from 'vue'
import { authApi } from '../utils/api'

// Helper function to restore user data from localStorage
const restoreUserFromStorage = () => {
  try {
    const userDataStr = localStorage.getItem('admin_user_data')
    if (userDataStr) {
      const userData = JSON.parse(userDataStr)
      return userData
    }
  } catch (error) {
    console.error('Error restoring user data from storage:', error)
  }
  return null
}

// Global auth state - restore from localStorage immediately
const user = ref(restoreUserFromStorage())
const isAuthenticated = ref(localStorage.getItem('admin_authenticated') === 'true')
const isLoading = ref(false)

// Request deduplication - track ongoing checkAuth requests
let checkAuthPromise = null

/**
 * Authentication composable for managing admin authentication state
 */
export function useAuth() {
  const setUserData = (userData) => {
    if (userData) {
      user.value = userData
      isAuthenticated.value = true
      localStorage.setItem('admin_authenticated', 'true')
      localStorage.setItem('admin_user_data', JSON.stringify(userData))
    } else {
      user.value = null
      isAuthenticated.value = false
      localStorage.removeItem('admin_authenticated')
      localStorage.removeItem('admin_user_data')
    }
  }

  /**
   * Login user
   */
  const login = async (credentials) => {
    isLoading.value = true
    try {
      const loginResponse = await authApi.login(credentials)
      
      if (loginResponse.success && loginResponse.data) {
        // Login only returns token and token_expires_at
        const { token, token_expires_at } = loginResponse.data
        
        // Store token first
        localStorage.setItem('admin_authenticated', 'true')
        localStorage.setItem('admin_token', token)
        localStorage.setItem('admin_token_expires_at', token_expires_at)
        
        // Now fetch user data using /me endpoint
        try {
          const userResponse = await authApi.getAuthUser()
          if (userResponse.success && userResponse.data) {
            setUserData(userResponse.data)
          }
        } catch (userError) {
          // Token is valid but /me failed, still consider login successful
          // User data will be fetched later or on next check
          console.warn('Failed to fetch user data after login:', userError)
        }
        
        isAuthenticated.value = true
        return { success: true }
      }
      
      throw new Error(loginResponse.message || 'خطا در ورود به سیستم')
    } catch (error) {
      setUserData(null)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
      
      // Format error for display
      if (error.errors) {
        // Laravel validation errors
        const firstError = Object.values(error.errors)[0]
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
        return { success: false, error: errorMessage }
      } else if (error.message) {
        return { success: false, error: error.message }
      } else {
        return { success: false, error: 'ایمیل یا رمز عبور نامعتبر است' }
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Logout user
   */
  const logout = async () => {
    isLoading.value = true
    try {
      await authApi.logout()
      setUserData(null)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
      return { success: true }
    } catch (error) {
      // Even if logout fails, clear local state
      setUserData(null)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
      return { success: false, error: error.message || 'خطا در خروج از سیستم' }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Check if token is expired
   */
  const isTokenExpired = () => {
    const expiresAt = localStorage.getItem('admin_token_expires_at')
    if (!expiresAt) return true
    
    const expiryDate = new Date(expiresAt)
    return expiryDate < new Date()
  }

  /**
   * Check authentication status by fetching user
   */
  const checkAuth = async () => {
    // If there's already a checkAuth request in progress, return the existing promise
    if (checkAuthPromise) {
      return checkAuthPromise
    }

    // Check if token exists and is not expired
    const token = localStorage.getItem('admin_token')
    if (!token || isTokenExpired()) {
      setUserData(null)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
      return { success: false, authenticated: false }
    }

    // Create the promise and store it for deduplication
    checkAuthPromise = (async () => {
      isLoading.value = true
      try {
        const response = await authApi.getAuthUser()
        
        // Check if response structure is correct
        // authApi.getAuthUser() returns response.data, which is { success: true, data: {...userData} }
        if (response && response.success && response.data) {
          // /me endpoint returns user data in response.data
          // Token remains the same from localStorage
          const userData = response.data
          
          setUserData(userData)
          return { success: true, authenticated: true }
        }
        
        // Invalid response structure - not authenticated
        setUserData(null)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_token_expires_at')
        return { success: false, authenticated: false }
      } catch (error) {
        // Check if it's a 401/403 error (unauthorized)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          setUserData(null)
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_token_expires_at')
          return { success: false, authenticated: false }
        }
        
        // Network or other error - don't clear auth state, just return failure
        // This allows the app to continue if it's a temporary network issue
        console.error('Auth check error:', error)
        return { success: false, authenticated: false, error: error.message }
      } finally {
        isLoading.value = false
        // Clear the promise after completion (with a small delay to prevent rapid re-calls)
        setTimeout(() => {
          checkAuthPromise = null
        }, 100)
      }
    })()

    return checkAuthPromise
  }

  /**
   * Initialize auth state from localStorage or API
   */
  const init = async () => {
    // User data is already restored synchronously when the module loads
    // Just verify token is still valid with API in the background
    // Don't block or clear state if API fails during initialization
    const stored = localStorage.getItem('admin_authenticated')
    const token = localStorage.getItem('admin_token')
    
    if (stored === 'true' && token && !isTokenExpired()) {
      // Verify with API in background without blocking
      // If verification fails, API calls later will handle it
      checkAuth().catch(() => {
        // Silently fail during init - user data is already restored
        // If token is actually invalid, subsequent API calls will clear state
      })
    } else if (!stored || !token || isTokenExpired()) {
      // Only clear if definitely invalid (no token or expired)
      setUserData(null)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
    }
  }

  /**
   * Refresh authenticated user data from API
   */
  const refreshUser = async () => {
    try {
      const response = await authApi.getAuthUser()
      if (response && response.success && response.data) {
        setUserData(response.data)
        return { success: true, data: response.data }
      }

      return {
        success: false,
        error: response?.message || 'امکان بروزرسانی اطلاعات کاربر وجود ندارد'
      }
    } catch (error) {
      const message = error?.message || error?.error || 'خطای غیرمنتظره‌ای رخ داده است'
      return { success: false, error: message }
    }
  }

  return {
    // State
    user: computed(() => user.value),
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    
    // Methods
    login,
    logout,
    checkAuth,
    init,
    refreshUser,
    setUser: setUserData
  }
}

