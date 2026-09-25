import { LangProvider } from '@/app/providers/LangContext';
import { AuthProvider } from '@/app/providers/AuthContext';
import { AppRouter } from '@/app/Router';

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </LangProvider>
  );
}
