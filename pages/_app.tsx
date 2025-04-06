import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileModalProvider } from '../contexts/ProfileModalContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProfileModalProvider>
        <Component {...pageProps} />
      </ProfileModalProvider>
    </AuthProvider>
  );
}

export default MyApp;