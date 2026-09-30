import { LangProvider } from "@/app/providers/LangContext";
import { AuthProvider } from "@/app/providers/AuthContext";
import { AppRouter } from "@/app/Router";
import { SiteProvider } from "@/app/providers/SiteContext";

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <SiteProvider>
          <AppRouter />
        </SiteProvider>
      </AuthProvider>
    </LangProvider>
  );
}
