export type RouteMetadata = {
  title: string
  description: string
  robots: "index,follow" | "noindex,nofollow"
  canonicalPath?: string
}

export const PUBLIC_ROUTE_METADATA: Record<string, RouteMetadata> = {
  home: {
    title: "Ya Hala Market | باقات سفر مختارة",
    description: "اكتشف باقات السفر والعروض المختارة من ياهلا.",
    robots: "index,follow",
    canonicalPath: "/",
  },
  offers: {
    title: "عروض السفر | Ya Hala Market",
    description: "تصفح عروض السفر المنشورة حسب الوجهة والفندق والتاريخ.",
    robots: "index,follow",
    canonicalPath: "/offers",
  },
  offerDetail: {
    title: "تفاصيل العرض | Ya Hala Market",
    description: "اطلع على تفاصيل الباقة والأسعار والفنادق وأرسل استفسارك.",
    robots: "index,follow",
  },
  legal: {
    title: "الشروط والخصوصية | Ya Hala Market",
    description: "الشروط والأحكام وسياسة الخصوصية لمنصة ياهلا ماركت.",
    robots: "index,follow",
    canonicalPath: "/legal",
  },
  private: {
    title: "Ya Hala Market",
    description: "صفحة خاصة.",
    robots: "noindex,nofollow",
  },
}

export function canonicalUrl(path = "/"): string {
  const base = "https://market.yahala.co"
  return new URL(path.startsWith("/") ? path : `/${path}`, base).toString()
}
