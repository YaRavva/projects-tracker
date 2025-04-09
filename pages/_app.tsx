import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { ProfileModalProvider } from '../contexts/ProfileModalContext';
import BackgroundDecorations from '../components/layout/BackgroundDecorations';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProfileModalProvider>
        <BackgroundDecorations />
        <Component {...pageProps} />
      </ProfileModalProvider>
    </AuthProvider>
  );
}

export default MyApp;