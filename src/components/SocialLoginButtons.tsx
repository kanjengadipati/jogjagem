import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: any;
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '';

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

export default function SocialLoginButtons({ onError }: { onError?: (msg: string) => void }) {
  const { socialLogin } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [fbReady, setFbReady] = useState(false);
  const [loading, setLoading] = useState<'google' | 'facebook' | null>(null);

  const handleGoogleCredential = useCallback(async (response: any) => {
    if (!response?.credential) return;
    setLoading('google');
    const result = await socialLogin('google', response.credential);
    setLoading(null);
    if (!result.success) onError?.(result.error || 'Google login failed');
  }, [socialLogin, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadScript('https://accounts.google.com/gsi/client', 'google-identity-script')
      .then(() => {
        window.google?.accounts?.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredential,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        // Render the button directly instead of using prompt() to avoid FedCM AbortError
        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: googleBtnRef.current.offsetWidth || 200,
          });
        }
        setGoogleReady(true);
      })
      .catch(() => {});
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!FACEBOOK_APP_ID) return;
    loadScript('https://connect.facebook.net/en_US/sdk.js', 'facebook-sdk')
      .then(() => {
        window.FB?.init({ appId: FACEBOOK_APP_ID, cookie: true, xfbml: false, version: 'v19.0' });
        setFbReady(true);
      })
      .catch(() => {});
  }, []);

  const handleFacebookClick = () => {
    if (!window.FB) return;
    setLoading('facebook');
    window.FB.login(async (response: any) => {
      if (response.authResponse?.accessToken) {
        const result = await socialLogin('facebook', response.authResponse.accessToken);
        setLoading(null);
        if (!result.success) onError?.(result.error || 'Facebook login failed');
      } else {
        setLoading(null);
      }
    }, { scope: 'email,public_profile' });
  };

  const hasGoogle = GOOGLE_CLIENT_ID && googleReady;
  const hasFacebook = FACEBOOK_APP_ID && fbReady;

  if (!hasGoogle && !hasFacebook) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-stone-400">or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google rendered button (avoids FedCM AbortError) */}
        {hasGoogle && (
          <div ref={googleBtnRef} className="flex justify-center [&>div]:!w-full [&>div]:!m-0" />
        )}

        {hasFacebook && (
          <button
            type="button"
            onClick={handleFacebookClick}
            disabled={loading !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 active:scale-[0.98] disabled:opacity-50 transition-all"
          >
            <svg className="h-4 w-4" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            {loading === 'facebook' ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-stone-600" />
            ) : (
              'Facebook'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
