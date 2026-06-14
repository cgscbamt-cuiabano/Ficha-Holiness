import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn } from './lib/firebase';
import VisitorForm from './components/VisitorForm';
import { Church } from 'lucide-react';

export default function App() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
        setIsInitializing(false);
      },
      () => {
        setNeedsAuth(true);
        setIsInitializing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin text-emerald-600">
          <Church size={32} />
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Church size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel de Recepção</h1>
          <p className="text-gray-600 mb-8">
            Faça login com a conta da igreja para salvar as visitas em uma planilha.
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-emerald-100 font-medium rounded-xl px-6 py-3 disabled:opacity-50"
          >
            {isLoggingIn ? 'Conectando...' : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
                Entrar com Google
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-emerald-50 min-h-screen">
      <VisitorForm userName={user?.displayName || ''} />
    </div>
  );
}
