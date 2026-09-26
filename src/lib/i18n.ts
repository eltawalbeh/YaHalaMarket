import type { SupportedLanguage } from "./constants"

type TranslationKey = keyof typeof translations.ar

const translations = {
  ar: {
    // Navigation
    home: "الرئيسية",
    offers: "العروض",
    dashboard: "لوحة التحكم",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",

    // Public pages
    marketTitle: "يا هلا ماركت",
    marketSubtitle: "أفضل عروض السفر بين يديك",
    viewOffer: "عرض التفاصيل",
    requestQuote: "اطلب عرض سعر",
    nights: "ليلة",
    perPerson: "للفرد",
    includesFlights: "يشمل طيران",
    includesHotel: "يشمل فندق",
    includesTransfers: "يشمل نقل",

    // Dashboard nav
    dashboardHome: "الرئيسية",
    dashboardOffers: "العروض",
    dashboardHotels: "الفنادق",
    dashboardLeads: "العملاء المحتملون",
    dashboardQuotes: "عروض الأسعار",
    dashboardReports: "التقارير",
    dashboardTeam: "الفريق",
    dashboardAuditLog: "سجل المراجعة",
    dashboardSettings: "الإعدادات",

    // Common
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    delete: "حذف",
    search: "بحث",
    filter: "تصفية",
    loading: "جارٍ التحميل…",
    noResults: "لا توجد نتائج",
    addNew: "إضافة جديد",
    status: "الحالة",
    actions: "الإجراءات",
  },
  en: {
    home: "Home",
    offers: "Offers",
    dashboard: "Dashboard",
    login: "Login",
    logout: "Logout",

    marketTitle: "Ya Hala Market",
    marketSubtitle: "Your best travel deals, curated.",
    viewOffer: "View Offer",
    requestQuote: "Request Quote",
    nights: "nights",
    perPerson: "per person",
    includesFlights: "Flights included",
    includesHotel: "Hotel included",
    includesTransfers: "Transfers included",

    dashboardHome: "Home",
    dashboardOffers: "Offers",
    dashboardHotels: "Hotels",
    dashboardLeads: "Leads",
    dashboardQuotes: "Quotes",
    dashboardReports: "Reports",
    dashboardTeam: "Team",
    dashboardAuditLog: "Audit Log",
    dashboardSettings: "Settings",

    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    search: "Search",
    filter: "Filter",
    loading: "Loading…",
    noResults: "No results",
    addNew: "Add New",
    status: "Status",
    actions: "Actions",
  },
} as const

export function t(key: TranslationKey, lang: SupportedLanguage): string {
  return translations[lang][key] ?? translations.ar[key]
}

export function dir(lang: SupportedLanguage): "rtl" | "ltr" {
  return lang === "ar" ? "rtl" : "ltr"
}

export { translations }
export type { TranslationKey }
