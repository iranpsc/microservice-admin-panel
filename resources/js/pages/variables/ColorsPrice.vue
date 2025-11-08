<template>
  <div class="p-6 space-y-6">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-[var(--theme-text-primary)] mb-2">قیمت رنگ ها</h1>
      <p class="text-[var(--theme-text-secondary)]">مدیریت قیمت ارزها و رنگ‌ها</p>
    </div>

    <!-- Action Bar -->
    <div class="flex justify-between items-center mb-6">
      <Button
        variant="primary"
        @click="openCreateModal"
      >
        ایجاد ارز
      </Button>
    </div>

    <!-- Loading State -->
    <LoadingState v-if="loading" />

    <!-- Error State -->
    <ErrorState
      v-else-if="error"
      :message="error"
      variant="error"
    />

    <!-- Table -->
    <Table
      v-else
      :columns="tableColumns"
      :data="variables"
      empty-state-message="هیچ ارزی ثبت نشده است"
    >
      <template #cell-image_url="{ value }">
        <a
          v-if="value"
          :href="value"
          target="_blank"
          class="text-[var(--theme-primary)] hover:underline"
        >
          مشاهده تصویر
        </a>
        <span v-else class="text-red-500">بدون تصویر</span>
      </template>

      <template #cell-actions="{ row }">
        <div class="flex gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            @click="openEditModal(row)"
          >
            بروزرسانی
          </Button>
          <Button
            variant="danger"
            size="sm"
            @click="handleDelete(row)"
          >
            حذف
          </Button>
          <Button
            v-if="row.price_change_logs && row.price_change_logs.length > 0"
            variant="info"
            size="sm"
            @click="openHistoryModal(row)"
          >
            تاریخچه تغییرات
          </Button>
        </div>
      </template>
    </Table>

    <!-- Variable Form Modal (Create/Edit) -->
    <Modal
      :model-value="showFormModal"
      @update:model-value="closeFormModal"
      :title="isEditMode ? 'ویرایش ارز' : 'تعریف ارز'"
      size="lg"
    >
      <div class="space-y-4" dir="rtl">
        <!-- Asset Selection (Only for Create) -->
        <div v-if="!isEditMode">
          <Select
            v-model="formData.asset"
            label="نام ارز"
            :options="assetOptions"
            placeholder="نام ارز را به انگلیسی انتخاب کنید"
            :error="errors.asset"
          />
        </div>

        <!-- Price Input -->
        <Input
          v-model="formData.price"
          type="number"
          label="قیمت واحد"
          placeholder="قیمت واحد را به تومان وارد کنید"
          :error="errors.price"
        />

        <!-- Image Upload -->
        <div class="form-group">
          <label class="block text-sm font-medium text-[var(--theme-text-primary)] mb-2">تصویر ارز</label>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            @change="handleImageChange"
            class="block w-full text-sm text-[var(--theme-text-secondary)]
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[var(--theme-primary)] file:text-white
              hover:file:bg-[var(--theme-primary-dark)]
              cursor-pointer"
          />
          <p v-if="errors.image" class="mt-1 text-sm text-red-500">{{ errors.image }}</p>

          <!-- Image Preview -->
          <div v-if="imagePreview || (isEditMode && existingImageUrl)" class="mt-3">
            <img
              :src="imagePreview || existingImageUrl"
              alt="Preview"
              class="h-24 w-24 object-cover rounded-md border border-[var(--theme-border)]"
            />
          </div>
        </div>

        <!-- Note (Only for Edit) -->
        <div v-if="isEditMode">
          <Input
            v-model="formData.note"
            label="علت بروزرسانی"
            placeholder="علت بروزرسانی را وارد کنید"
            :error="errors.note"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex gap-3 justify-end" dir="rtl">
          <Button
            variant="primary"
            :loading="saving"
            @click="handleSubmit"
          >
            {{ isEditMode ? 'بروزرسانی' : 'ثبت' }}
          </Button>
          <Button
            variant="danger"
            @click="closeFormModal"
            :disabled="saving"
          >
            بستن
          </Button>
        </div>
      </template>
    </Modal>

    <!-- Verification Dialog -->
    <Modal
      :model-value="showVerificationDialog"
      @update:model-value="handleCloseVerificationDialog"
      title="تایید نهایی"
      size="md"
    >
      <div dir="rtl">
        <VerificationForm
          ref="verificationFormRef"
          :auto-start="true"
          @verified="handleAutoVerifyAndSubmit"
        />
      </div>
    </Modal>

    <!-- Change History Modal -->
    <Modal
      :model-value="showHistoryModal"
      @update:model-value="closeHistoryModal"
      :title="`تاریخچه تغییرات - ${selectedVariable?.asset_title || ''}`"
      size="xl"
    >
      <div v-if="selectedVariable?.price_change_logs && selectedVariable.price_change_logs.length > 0" class="overflow-x-auto" dir="rtl">
        <Table
          :columns="historyColumns"
          :data="selectedVariable.price_change_logs"
          :show-row-number="true"
          empty-state-message="تاریخچه تغییرات یافت نشد"
        />
      </div>
      <div v-else class="py-8 text-center">
        <p class="text-[var(--theme-text-secondary)]">تاریخچه تغییرات یافت نشد</p>
      </div>

      <template #footer>
        <div class="flex justify-end" dir="rtl">
          <Button
            variant="danger"
            @click="closeHistoryModal"
          >
            بستن
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import apiClient from '../../utils/api'
import { Button, LoadingState, ErrorState, Table, Modal, Input, Select } from '../../components/ui'
import VerificationForm from '../../components/VerificationForm.vue'
import { notifySuccess, notifyError } from '../../utils/notifications'

const loading = ref(true)
const error = ref(null)
const variables = ref([])
const showFormModal = ref(false)
const showHistoryModal = ref(false)
const showVerificationDialog = ref(false)
const isEditMode = ref(false)
const selectedVariable = ref(null)
const saving = ref(false)
const verificationFormRef = ref(null)
const imageInput = ref(null)
const imagePreview = ref(null)

const formData = ref({
  asset: '',
  price: '',
  image: null,
  note: ''
})

const errors = ref({})

const isProduction = computed(() => {
  const metaEnv = document.querySelector('meta[name="app-env"]')?.getAttribute('content')
  return metaEnv === 'production' || import.meta.env.MODE === 'production'
})

const existingImageUrl = computed(() => {
  return isEditMode.value && selectedVariable.value?.image_url ? selectedVariable.value.image_url : null
})

const assetOptions = [
  { value: 'red', label: 'قرمز' },
  { value: 'blue', label: 'آبی' },
  { value: 'yellow', label: 'زرد' },
  { value: 'irr', label: 'ریال' },
  { value: 'psc', label: 'psc' },
  { value: 'satisfaction', label: 'رضایت' },
  { value: 'effect', label: 'حد تاثیر' }
]

const tableColumns = [
  {
    key: 'asset_title',
    label: 'نام ارز'
  },
  {
    key: 'price',
    label: 'قیمت واحد'
  },
  {
    key: 'image_url',
    label: 'تصویر'
  },
  {
    key: 'updated_at',
    label: 'آخرین بروز رسانی',
    textSecondary: true,
    formatter: (value) => {
      if (!value) return '-'
      const date = new Date(value)
      return date.toLocaleDateString('fa-IR')
    }
  },
  {
    key: 'note',
    label: 'دلیل بروز رسانی',
    textSecondary: true,
    defaultValue: '-'
  },
  {
    key: 'actions',
    label: 'مدیریت'
  }
]

const historyColumns = [
  {
    key: 'changer_name',
    label: 'تغییر دهنده'
  },
  {
    key: 'previous_value',
    label: 'وضعیت گذشته'
  },
  {
    key: 'current_value',
    label: 'وضعیت حال'
  },
  {
    key: 'note',
    label: 'توضیحات',
    defaultValue: '-'
  },
  {
    key: 'created_at',
    label: 'تاریخ تغییر',
    formatter: (value) => {
      if (!value) return '-'
      const date = new Date(value)
      return date.toLocaleDateString('fa-IR')
    }
  },
  {
    key: 'created_at',
    label: 'ساعت تغییر',
    formatter: (value) => {
      if (!value) return '-'
      const date = new Date(value)
      return date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  }
]

const fetchVariables = async () => {
  try {
    loading.value = true
    error.value = null

    const response = await apiClient.get('/variables')

    if (response.data.success) {
      variables.value = response.data.data
    } else {
      error.value = 'خطا در دریافت اطلاعات'
    }
  } catch (err) {
    console.error('Variables fetch error:', err)

    // If 401/403, don't set error message - axios interceptor will handle redirect
    if (err.response && (err.response.status === 401 || err.response.status === 403)) {
      variables.value = []
      loading.value = false
      return
    }

    error.value = err.response?.data?.message || 'خطا در بارگذاری اطلاعات'
    variables.value = []
  } finally {
    loading.value = false
  }
}

const handleImageChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.image = file

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    // Clear error
    errors.value.image = null
  }
}

const validateForm = () => {
  errors.value = {}

  if (!isEditMode.value && !formData.value.asset) {
    errors.value.asset = 'نام ارز الزامی است'
  }

  if (!formData.value.price || formData.value.price < 1) {
    errors.value.price = 'قیمت واحد باید بیشتر از صفر باشد'
  }

  if (!isEditMode.value && !formData.value.image) {
    errors.value.image = 'تصویر ارز الزامی است'
  }

  return Object.keys(errors.value).length === 0
}

const sendVerificationCode = async () => {
  try {
    const response = await apiClient.post('/send-verification-sms')

    if (response.data.success) {
      showVerificationDialog.value = true
      return true
    } else {
      await notifyError('خطا در ارسال کد تایید')
      return false
    }
  } catch (err) {
    console.error('Verification SMS send error:', err)
    await notifyError(err.response?.data?.message || 'خطا در ارسال کد تایید')
    return false
  } finally {
    saving.value = false
  }
}

const submitForm = async (verificationData = {}) => {
  try {
    saving.value = true
    errors.value = {}

    const formDataToSend = new FormData()

    if (!isEditMode.value) {
      formDataToSend.append('asset', formData.value.asset)
    }

    formDataToSend.append('price', formData.value.price)

    if (formData.value.image) {
      formDataToSend.append('image', formData.value.image)
    }

    if (isEditMode.value && formData.value.note) {
      formDataToSend.append('note', formData.value.note)
    }

    // Add verification data in production
    if (verificationData.phone_verification) {
      formDataToSend.append('phone_verification', verificationData.phone_verification)
    }

    const url = isEditMode.value ? `/variables/${selectedVariable.value.id}` : '/variables'

    let response
    if (isEditMode.value) {
      formDataToSend.append('_method', 'PUT')
      response = await apiClient.post(url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    } else {
      response = await apiClient.post(url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    if (response.data.success) {
      await notifySuccess(response.data.message)
      showVerificationDialog.value = false

      // Reset verification form errors on success
      if (verificationFormRef.value && verificationFormRef.value.setErrors) {
        verificationFormRef.value.setErrors({})
      }

      closeFormModal()
      await fetchVariables()
    }
  } catch (err) {
    console.error('Form submit error:', err)

    // Handle validation errors
    if (err.response?.status === 422 && err.response?.data?.errors) {
      errors.value = err.response.data.errors

      // Map Laravel validation errors to form fields
      if (verificationFormRef.value && verificationFormRef.value.setErrors) {
        const validationErrors = {}

        if (err.response.data.errors.phone_verification) {
          validationErrors.phone_verification = Array.isArray(err.response.data.errors.phone_verification)
            ? err.response.data.errors.phone_verification[0]
            : err.response.data.errors.phone_verification
        }

        verificationFormRef.value.setErrors(validationErrors)
      }
    } else {
      await notifyError(err.response?.data?.message || 'خطا در ثبت اطلاعات')
    }
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  saving.value = true

  if (isProduction.value) {
    const codeSent = await sendVerificationCode()
    if (!codeSent) {
      return
    }
  } else {
    await submitForm()
  }
}

const handleAutoVerifyAndSubmit = async (verificationData) => {
  if (saving.value) {
    return
  }

  if (!verificationFormRef.value) {
    await notifyError('خطا در تایید')
    return
  }

  const data = verificationData || verificationFormRef.value.getData()
  await submitForm(data)
}

const handleCloseVerificationDialog = () => {
  if (verificationFormRef.value && verificationFormRef.value.setErrors) {
    verificationFormRef.value.setErrors({})
  }
  showVerificationDialog.value = false
}

const openCreateModal = () => {
  isEditMode.value = false
  selectedVariable.value = null
  formData.value = {
    asset: '',
    price: '',
    image: null,
    note: ''
  }
  errors.value = {}
  imagePreview.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  showFormModal.value = true
}

const openEditModal = (variable) => {
  isEditMode.value = true
  selectedVariable.value = variable
  formData.value = {
    asset: variable.asset,
    price: variable.price,
    image: null,
    note: ''
  }
  errors.value = {}
  imagePreview.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  isEditMode.value = false
  selectedVariable.value = null
  formData.value = {
    asset: '',
    price: '',
    image: null,
    note: ''
  }
  errors.value = {}
  imagePreview.value = null
  if (imageInput.value) {
    imageInput.value.value = ''
  }
  showVerificationDialog.value = false
}

const openHistoryModal = (variable) => {
  selectedVariable.value = variable
  showHistoryModal.value = true
}

const closeHistoryModal = () => {
  showHistoryModal.value = false
  selectedVariable.value = null
}

watch(() => showVerificationDialog.value, async (newVal) => {
  if (newVal) {
    await nextTick()

    setTimeout(() => {
      if (verificationFormRef.value && verificationFormRef.value.startTimer) {
        verificationFormRef.value.startTimer()
      }
    }, 100)

    setTimeout(() => {
      if (verificationFormRef.value && verificationFormRef.value.focusFirstInput) {
        verificationFormRef.value.focusFirstInput()
      }
    }, 400)
  } else {
    if (verificationFormRef.value && verificationFormRef.value.reset) {
      verificationFormRef.value.reset()
    }
  }
})

const handleDelete = async (variable) => {
  if (!confirm(`آیا این ارز (${variable.asset_title}) را حذف می کنید؟`)) {
    return
  }

  try {
    const response = await apiClient.delete(`/variables/${variable.id}`)

    if (response.data.success) {
      await notifySuccess(response.data.message)
      await fetchVariables()
    }
  } catch (err) {
    console.error('Delete error:', err)
    await notifyError(err.response?.data?.message || 'خطا در حذف ارز')
  }
}

onMounted(() => {
  fetchVariables()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>

