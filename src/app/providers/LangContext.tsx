import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { DEFAULT_LANGUAGE, type SupportedLanguage } from "@/lib/constants"
import { dir } from "@/lib/i18n"

interface LangContextValue {
  lang: SupportedLanguage
  setLang: (lang: SupportedLanguage) => void
  isRTL: boolean
}

const LangContext = createContext<LangContextValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE)

  const setLang = (next: SupportedLanguage) => {
    setLangState(next)
    document.documentElement.lang = next
    document.documentElement.dir = dir(next)
  }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir(lang)
  }, [])

  return (
    <LangContext.Provider value={{ lang, setLang, isRTL: lang === "ar" }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error("useLang must be used inside LangProvider")
  return ctx
}
