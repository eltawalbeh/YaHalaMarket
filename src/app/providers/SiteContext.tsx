import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultSite,
  siteContentService,
  type SiteSettings,
} from "@/services/siteContent";
const SiteContext = createContext({
  site: defaultSite,
  reload: async () => {},
});
export function SiteProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteSettings>(defaultSite);
  async function reload() {
    setSite(await siteContentService.get());
  }
  useEffect(() => {
    void reload().catch(() => {});
  }, []);
  return (
    <SiteContext.Provider value={{ site, reload }}>
      {children}
    </SiteContext.Provider>
  );
}
export const useSite = () => useContext(SiteContext);
