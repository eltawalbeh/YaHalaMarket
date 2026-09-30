import { db, request } from "@/lib/request";
export type SiteSettings = {
  id: string;
  brand_name: string;
  brand_name_ar: string;
  logo_url: string | null;
  logo_mobile_url: string | null;
  footer_text: string;
  footer_text_ar: string;
  contact_email: string;
  whatsapp_number: string;
  office_address: string;
  office_address_ar: string;
  updated_by?: string | null;
  updated_at: string;
  content: Record<string, string>;
};
export const defaultContent: Record<string, string> = {
  hero_title: "Journeys designed for the curious.",
  hero_title_ar: "رحلات مُصمّمة للفضوليين.",
  hero_text:
    "Find your destination and explore travel packages with hotels, transfers and activities.",
  hero_text_ar:
    "ابحث عن وجهة، اختر موعدك، وتصفح برامج السفر المتكاملة مع الفنادق والنقل والأنشطة.",
  plan_title: "Tell us where you want to go",
  plan_title_ar: "أخبرنا إلى أين تريد الذهاب",
  plan_text:
    "Share your ideas, dates and budget. Our travel team will follow up with you.",
  plan_text_ar:
    "شارك معنا فكرتك، مواعيدك، وميزانيتك — وسيتواصل معك أحد متخصصي الرحلات.",
  seo_title: "Ya Hala Market | Travel & Holidays",
  seo_title_ar: "يا هلا ماركت | رحلات وعطلات",
  seo_description:
    "Explore travel packages and request a personalised quote from Ya Hala.",
  seo_description_ar: "اكتشف باقات السفر واطلب عرض سعر خاص لرحلتك مع يا هلا.",
  privacy:
    "We use your name, contact details and trip preferences to respond to your request and prepare travel quotations. Authorised employees can access requests. Continuing to WhatsApp shares the message you choose to send with our travel team. Contact us using the details below to ask about your data.",
  privacy_ar:
    "نستخدم اسمك وبيانات الاتصال وتفضيلات رحلتك للرد على طلبك وتجهيز عروض السفر. يمكن للموظفين المخولين الاطلاع على الطلبات. عند الانتقال إلى واتساب، تختار إرسال الرسالة الظاهرة إلى فريق الرحلات. للاستفسار عن بياناتك تواصل معنا عبر معلومات الاتصال أدناه.",
  terms:
    "Submitting a request or accepting a quotation does not collect payment or issue tickets. Availability, final travel arrangements and booking confirmation are agreed with our team. Each quotation shows its validity and included services.",
  terms_ar:
    "إرسال الطلب أو الموافقة على عرض السعر لا يترتب عليه دفع إلكتروني أو إصدار تذاكر. يتم تأكيد التوفر والترتيبات النهائية والحجز مع فريقنا. يوضح كل عرض سعر مدة صلاحيته والخدمات المشمولة.",
};
export const defaultSite: SiteSettings = {
  id: "default",
  brand_name: "Ya Hala",
  brand_name_ar: "يا هلا",
  logo_url: null,
  logo_mobile_url: null,
  footer_text: "Travel & Tourism",
  footer_text_ar: "للسفر والسياحة",
  contact_email: "",
  whatsapp_number: "966559934866",
  office_address: "",
  office_address_ar: "",
  updated_at: "",
  content: defaultContent,
};
export const siteContentService = {
  async get(): Promise<SiteSettings> {
    const row = await request(db().rpc("get_site_content"));
    return {
      ...defaultSite,
      ...row,
      content: { ...defaultContent, ...row?.content },
    };
  },
  async update(
    data: Partial<Omit<SiteSettings, "id" | "updated_at">>,
    userId: string,
  ): Promise<SiteSettings> {
    return request(
      db()
        .from("site_settings")
        .upsert({ id: "default", ...data, updated_by: userId })
        .select()
        .single(),
    );
  },
};
