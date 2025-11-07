import Swal from 'sweetalert2'

/**
 * Show a success notification
 * @param {string} message - The message to display
 */
export const notifySuccess = (message) => {
  return Swal.fire({
    icon: 'success',
    text: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    position: 'top-right'
  })
}

/**
 * Show an error notification
 * @param {string} message - The message to display
 */
export const notifyError = (message) => {
  return Swal.fire({
    icon: 'error',
    text: message,
    showConfirmButton: false,
    toast: true,
    position: 'top-right'
  })
}

/**
 * Show a warning notification
 * @param {string} message - The message to display
 */
export const notifyWarning = (message) => {
  return Swal.fire({
    icon: 'warning',
    text: message,
    showConfirmButton: false,
    toast: true,
    position: 'top-right'
  })
}

/**
 * Show an info notification
 * @param {string} message - The message to display
 * @param {string} title - Optional title
 */
export const notifyInfo = (message, title = 'اطلاعات') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    position: 'top-right'
  })
}

/**
 * Show a confirmation dialog
 * @param {string} message - The message to display
 * @param {string} title - Optional title
 * @param {Object} options - Additional Swal options
 * @returns {Promise} - Resolves to result if confirmed, rejects if cancelled
 */
export const confirm = (message, title = 'آیا مطمئن هستید؟', options = {}) => {
  const { confirmText, cancelText, ...restOptions } = options

  return Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText || 'بله، انجام شود',
    cancelButtonText: cancelText || 'لغو',
    ...restOptions
  })
}

/**
 * Export Swal for advanced usage
 */
export { Swal }

