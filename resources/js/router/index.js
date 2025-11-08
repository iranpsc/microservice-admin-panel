import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/auth/Login.vue'
import ForgotPassword from '../pages/auth/ForgotPassword.vue'
import ResetPassword from '../pages/auth/ResetPassword.vue'
import App from '../components/App.vue'
import Dashboard from '../pages/Dashboard.vue'
import RegistrationInfo from '../pages/citizens/RegistrationInfo.vue'
import KycList from '../pages/citizens/KycList.vue'
import BankAccountList from '../pages/citizens/BankAccountList.vue'
import Assets from '../pages/citizens/Assets.vue'
import Deposits from '../pages/citizens/Deposits.vue'
import ProfileDetails from '../pages/citizens/ProfileDetails.vue'
import Withdraws from '../pages/citizens/Withdraws.vue'
import LandsListing from '../pages/lands/Listing.vue'
import FeatureLimits from '../pages/lands/FeatureLimits.vue'
import FeaturePricingLimits from '../pages/lands/FeaturePricingLimits.vue'
import Prices from '../pages/lands/Prices.vue'
import Pricing from '../pages/lands/Pricing.vue'
import Sold from '../pages/lands/Sold.vue'
import Traded from '../pages/lands/Traded.vue'
import LevelsListing from '../pages/levels/Listing.vue'
import CalendarListing from '../pages/calendar/Listing.vue'
import Versions from '../pages/calendar/Versions.vue'
import LevelPrize from '../pages/levels/Prize.vue'
import LevelLicenses from '../pages/levels/Licenses.vue'
import LevelGift from '../pages/levels/Gift.vue'
import LevelGeneralInfo from '../pages/levels/GeneralInfo.vue'
import LevelGem from '../pages/levels/Gem.vue'
import Roles from '../pages/access-management/Roles.vue'
import Permissions from '../pages/access-management/Permissions.vue'
import EmployeeRolePermission from '../pages/access-management/EmployeeRolePermission.vue'
import Investment from '../pages/support/Investment.vue'
import CitizensSafety from '../pages/support/CitizensSafety.vue'
import Inspection from '../pages/support/Inspection.vue'
import Protection from '../pages/support/Protection.vue'
import TechnicalSupport from '../pages/support/TechnicalSupport.vue'
import ZTB from '../pages/support/ZTB.vue'
import ColorsPrice from '../pages/variables/ColorsPrice.vue'
import ColorOptions from '../pages/variables/ColorOptions.vue'
import SystemVariables from '../pages/variables/SystemVariables.vue'
import ChallengeQuestions from '../pages/challenge/Questions.vue'
import VideoCategories from '../pages/videos/Categories.vue'
import VideoSubCategories from '../pages/videos/SubCategories.vue'
import VideoListing from '../pages/videos/Listing.vue'
import DynastyMessages from '../pages/dynasty/DynastyMessages.vue'
import DynastyPermissions from '../pages/dynasty/DynastyPermissions.vue'
import DynastyPrizes from '../pages/dynasty/DynastyPrizes.vue'
import MapsListing from '../pages/maps/MapsListing.vue'
import ReportsListing from '../pages/reports/Listing.vue'
import TranslationsIndex from '../pages/translations/TranslationsIndex.vue'
import TranslationModals from '../pages/translations/TranslationModals.vue'
import ModalTabs from '../pages/translations/ModalTabs.vue'
import TabFields from '../pages/translations/TabFields.vue'
import NotFound from '../components/errors/NotFound.vue'
import { navigationProgress } from '../composables/useNavigationProgress'
import { useAuth } from '../composables/useAuth'
import IsicCodes from '../pages/isic-codes/Listing.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresGuest: true,
      layout: 'auth',
      title: 'ورود به سیستم'
    }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: {
      requiresGuest: true,
      layout: 'auth',
      title: 'بازیابی رمز عبور'
    }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: ResetPassword,
    meta: {
      requiresGuest: true,
      layout: 'auth',
      title: 'بازیابی رمز عبور'
    },
    props: true
  },
  {
    path: '/',
    component: App,
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: Dashboard,
        meta: {
          title: 'داشبورد'
        }
      },
      {
        path: 'videos/categories',
        name: 'video-categories',
        component: VideoCategories,
        meta: {
          title: 'دسته بندی ویدیوها'
        }
      },
      {
        path: 'videos/sub-categories',
        name: 'video-sub-categories',
        component: VideoSubCategories,
        meta: {
          title: 'زیر دسته های ویدیو'
        }
      },
      {
        path: 'videos/listing',
        name: 'videos-listing',
        component: VideoListing,
        meta: {
          title: 'مدیریت ویدیوها'
        }
      },
      {
        path: 'citizens/registration-info',
        name: 'registration-info',
        component: RegistrationInfo,
        meta: {
          title: 'اطلاعات ثبت نام'
        }
      },
      {
        path: 'citizens/kycs',
        name: 'kycs',
        component: KycList,
        meta: {
          title: 'احراز هویت'
        }
      },
      {
        path: 'citizens/bank-accounts',
        name: 'bank-accounts',
        component: BankAccountList,
        meta: {
          title: 'حساب های بانکی'
        }
      },
      {
        path: 'citizens/assets',
        name: 'assets',
        component: Assets,
        meta: {
          title: 'دارایی های شهروندان'
        }
      },
      {
        path: 'citizens/deposits',
        name: 'deposits',
        component: Deposits,
        meta: {
          title: 'واریزی ها'
        }
      },
      {
        path: 'citizens/profile-details',
        name: 'profile-details',
        component: ProfileDetails,
        meta: {
          title: 'جزئیات پروفایل'
        }
      },
      {
        path: 'citizens/withdraws',
        name: 'withdraws',
        component: Withdraws,
        meta: {
          title: 'برداشت ها'
        }
      },
      {
        path: 'features/all',
        name: 'lands-listing',
        component: LandsListing,
        meta: {
          title: 'لیست املاک'
        }
      },
      {
        path: 'features/limits',
        name: 'feature-limits',
        component: FeatureLimits,
        meta: {
          title: 'محدودیت املاک'
        }
      },
      {
        path: 'features/pricing-limits',
        name: 'feature-pricing-limits',
        component: FeaturePricingLimits,
        meta: {
          title: 'محدودیت‌های قیمت'
        }
      },
      {
        path: 'features/prices',
        name: 'lands-prices',
        component: Prices,
        meta: {
          title: 'قیمت زمین ها'
        }
      },
      {
        path: 'features/priced',
        name: 'lands-pricing',
        component: Pricing,
        meta: {
          title: 'لیست قیمت گذاری ها'
        }
      },
      {
        path: 'features/sold',
        name: 'lands-sold',
        component: Sold,
        meta: {
          title: 'لیست زمین های فروخته شده'
        }
      },
      {
        path: 'features/trades',
        name: 'lands-traded',
        component: Traded,
        meta: {
          title: 'لیست زمین های معامله شده'
        }
      },
      {
        path: 'levels',
        name: 'levels-listing',
        component: LevelsListing,
        meta: {
          title: 'مدیریت سطوح'
        }
      },
      {
        path: 'calendar',
        name: 'calendar-listing',
        component: CalendarListing,
        meta: {
          title: 'مدیریت وقایع'
        }
      },
      {
        path: 'versions',
        name: 'versions',
        component: Versions,
        meta: {
          title: 'ورژن‌ها'
        }
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsListing,
        meta: {
          title: 'گزارشات کاربران'
        }
      },
      {
        path: 'system-variables',
        name: 'system-variables',
        component: SystemVariables,
        meta: {
          title: 'متغیرهای سیستم'
        }
      },
      {
        path: 'challenge',
        name: 'challenge-questions',
        component: ChallengeQuestions,
        meta: {
          title: 'چالش پرسش و پاسخ'
        }
      },
      {
        path: 'levels/:levelId/prize',
        name: 'levels-prize',
        component: LevelPrize,
        meta: {
          title: 'پاداش سطح'
        }
      },
      {
        path: 'levels/:levelId/licenses',
        name: 'levels-licenses',
        component: LevelLicenses,
        meta: {
          title: 'مجوزهای سطح'
        }
      },
      {
        path: 'levels/:levelId/gift',
        name: 'levels-gift',
        component: LevelGift,
        meta: {
          title: 'هدیه سطح'
        }
      },
      {
        path: 'levels/:levelId/general-info',
        name: 'levels-general-info',
        component: LevelGeneralInfo,
        meta: {
          title: 'اطلاعات کلی سطح'
        }
      },
      {
        path: 'levels/:levelId/gem',
        name: 'levels-gem',
        component: LevelGem,
        meta: {
          title: 'نگین سطح'
        }
      },
      {
        path: 'access-management/roles',
        name: 'roles',
        component: Roles,
        meta: {
          title: 'مدیریت نقش ها'
        }
      },
      {
        path: 'access-management/permissions',
        name: 'permissions',
        component: Permissions,
        meta: {
          title: 'مدیریت دسترسی ها'
        }
      },
      {
        path: 'access-management/employees',
        name: 'employee-role-permission',
        component: EmployeeRolePermission,
        meta: {
          title: 'مدیریت دسترسی کارمندان'
        }
      },
      {
        path: 'support/investment',
        name: 'support-investment',
        component: Investment,
        meta: {
          title: 'پشتیبانی - سرمایه گذاری'
        }
      },
      {
        path: 'support/citizens-safety',
        name: 'support-citizens-safety',
        component: CitizensSafety,
        meta: {
          title: 'پشتیبانی - امنیت شهروندان'
        }
      },
      {
        path: 'support/inspection',
        name: 'support-inspection',
        component: Inspection,
        meta: {
          title: 'پشتیبانی - بازرسی'
        }
      },
      {
        path: 'support/protection',
        name: 'support-protection',
        component: Protection,
        meta: {
          title: 'پشتیبانی - حراست'
        }
      },
      {
        path: 'support/technical-support',
        name: 'support-technical-support',
        component: TechnicalSupport,
        meta: {
          title: 'پشتیبانی فنی'
        }
      },
      {
        path: 'support/ztb',
        name: 'support-ztb',
        component: ZTB,
        meta: {
          title: 'مدیریت کل ز.ت.ب'
        }
      },
      {
        path: 'store/currencies',
        name: 'store-currencies',
        component: ColorsPrice,
        meta: {
          title: 'ارزها'
        }
      },
      {
        path: 'store/packages',
        name: 'store-packages',
        component: ColorOptions,
        meta: {
          title: 'بسته ها'
        }
      },
      {
        path: 'dynasty/messages',
        name: 'dynasty-messages',
        component: DynastyMessages,
        meta: {
          title: 'پیام های سلسله'
        }
      },
      {
        path: 'dynasty/permissions',
        name: 'dynasty-permissions',
        component: DynastyPermissions,
        meta: {
          title: 'دسترسی ها'
        }
      },
      {
        path: 'dynasty/prizes',
        name: 'dynasty-prizes',
        component: DynastyPrizes,
        meta: {
          title: 'جوایز سلسله'
        }
      },
      {
        path: 'maps',
        name: 'maps',
        component: MapsListing,
        meta: {
          title: 'لیست نقشه ها'
        }
      },
      {
        path: 'translations',
        name: 'translations-index',
        component: TranslationsIndex,
        meta: {
          title: 'مدیریت ترجمه‌ها'
        }
      },
      {
        path: 'isic-codes',
        name: 'isic-codes',
        component: IsicCodes,
        meta: {
          title: 'کدهای ISIC'
        }
      },
      {
        path: 'translations/:translationId/modals',
        name: 'translations-modals',
        component: TranslationModals,
        props: true,
        meta: {
          title: 'مدیریت بخش‌های ترجمه'
        }
      },
      {
        path: 'translations/:translationId/modals/:modalId/tabs',
        name: 'translations-tabs',
        component: ModalTabs,
        props: true,
        meta: {
          title: 'مدیریت تب‌های ترجمه'
        }
      },
      {
        path: 'translations/:translationId/modals/:modalId/tabs/:tabId/fields',
        name: 'translations-fields',
        component: TabFields,
        props: true,
        meta: {
          title: 'عبارات ترجمه'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: {
      title: 'صفحه یافت نشد - 404'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Start navigation progress
  navigationProgress.start()

  // Helper function to check if token exists and is valid
  const hasValidToken = () => {
    const token = localStorage.getItem('admin_token')
    const expiresAt = localStorage.getItem('admin_token_expires_at')
    const authenticated = localStorage.getItem('admin_authenticated') === 'true'

    if (!token || !authenticated) return false

    // Check if token is expired
    if (expiresAt) {
      const expiryDate = new Date(expiresAt)
      if (expiryDate < new Date()) {
        return false
      }
    }

    return true
  }

  // If route requires auth, check authentication
  if (to.meta.requiresAuth) {
    // Check if we have a token in localStorage
    if (!hasValidToken()) {
      // Clear invalid auth state
      localStorage.removeItem('admin_authenticated')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_token_expires_at')
      localStorage.removeItem('admin_user_data')
      next({ name: 'login' })
      return
    }

    // Only verify with server immediately after login
    // On page refresh, trust localStorage; API calls will enforce auth
    const isPageRefresh = !from.name || from.name === null
    const isFromLogin = from.name === 'login'

    if (isFromLogin) {
      try {
        const { checkAuth } = useAuth()
        const result = await checkAuth()
        if (!result || !result.authenticated) {
          // Clear auth state before redirecting
          localStorage.removeItem('admin_authenticated')
          localStorage.removeItem('admin_token')
          localStorage.removeItem('admin_token_expires_at')
          localStorage.removeItem('admin_user_data')
          next({ name: 'login' })
          return
        }
      } catch (error) {
        // Unexpected error; proceed and let API calls handle auth
        console.warn('Auth check after login failed; proceeding:', error)
      }
    }

    next()
  } else if (to.meta.requiresGuest) {
    // Check if already authenticated
    if (hasValidToken()) {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    next()
  }
})

// Update page title on route change and finish progress
router.afterEach((to, from, failure) => {
  // If navigation failed, reset progress
  if (failure) {
    navigationProgress.reset()
    return
  }

  // Finish navigation progress
  navigationProgress.finish()

  const siteName = 'متارنگ'
  const title = to.meta?.title || ''
  document.title = title ? `${title} - ${siteName}` : siteName
})

export default router

