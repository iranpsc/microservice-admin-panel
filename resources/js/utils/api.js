import axios from 'axios'

// Create axios instance with default config for API routes
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true
})

const stateChangingMethods = ['post', 'put', 'patch', 'delete']
let csrfCookiePromise = null

const getCookie = (name) => {
  const value = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
  return value ? decodeURIComponent(value.split('=')[1]) : null
}

const ensureCsrfCookie = async (force = false) => {
  if (!csrfCookiePromise || force) {
    csrfCookiePromise = axios
      .get('/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      })
      .catch((error) => {
        csrfCookiePromise = null
        throw error
      })
  }
  await csrfCookiePromise
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const method = config.method?.toLowerCase()
    if (stateChangingMethods.includes(method)) {
      const hasXsrfToken = !!getCookie('XSRF-TOKEN')
      if (!hasXsrfToken) {
        await ensureCsrfCookie()
      }
      const token = getCookie('XSRF-TOKEN')
      if (token) {
        config.headers['X-XSRF-TOKEN'] = token
      }
    }

    // Add auth token if available
    const authToken = localStorage.getItem('admin_token')
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        // Prevent multiple redirects
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('admin_authenticated')
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_token_expires_at')
          localStorage.removeItem('admin_user_data')
          window.location.href = '/login'
          return Promise.reject(error)
        }
      }

      // Handle CSRF token mismatch
      if (error.response.status === 419 && !error.config._retry) {
        error.config._retry = true
        return ensureCsrfCookie(true)
          .then(() => {
            const token = getCookie('XSRF-TOKEN')
            if (token) {
              error.config.headers['X-XSRF-TOKEN'] = token
            }
            return apiClient.request(error.config)
          })
          .catch(() => Promise.reject(error))
      }

      // Handle 403 Forbidden
      if (error.response.status === 403) {
        console.error('Access forbidden')
        // Could redirect to access denied page if needed
      }
    }
    return Promise.reject(error)
  }
)

// Auth API methods
export const authApi = {
  // Login
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/logout')
      localStorage.removeItem('admin_authenticated')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Forgot Password
  forgotPassword: async (email) => {
    try {
      const response = await apiClient.post('/password/email', { email })
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Reset Password
  resetPassword: async (data) => {
    try {
      const response = await apiClient.post('/password/reset', data)
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  },

  // Get authenticated user
  getAuthUser: async () => {
    try {
      const response = await apiClient.get('/me')
      return response.data
    } catch (error) {
      throw error.response?.data || error.message
    }
  }
}

export default apiClient

