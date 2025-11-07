import { computed } from 'vue'
import { useRoute } from 'vue-router'

/**
 * Composable for managing page titles
 * Provides reactive title based on current route and allows manual override
 */
export function usePageTitle() {
  const route = useRoute()
  
  // Default site name/title suffix
  const siteName = 'متارنگ'
  
  // Computed title from route meta
  const routeTitle = computed(() => {
    return route.meta?.title || ''
  })
  
  // Full page title with site name
  const pageTitle = computed(() => {
    const title = routeTitle.value
    if (!title) return siteName
    return `${title} - ${siteName}`
  })
  
  /**
   * Set document title programmatically
   * @param {string} title - The title to set (without site name suffix)
   */
  const setTitle = (title) => {
    document.title = title ? `${title} - ${siteName}` : siteName
  }
  
  /**
   * Update document title when route or computed title changes
   */
  const updateDocumentTitle = () => {
    document.title = pageTitle.value
  }
  
  return {
    routeTitle,
    pageTitle,
    setTitle,
    setPageTitle: setTitle, // Alias for better naming consistency
    updateDocumentTitle,
    siteName
  }
}
