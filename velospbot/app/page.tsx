'use client'

import { useState, useEffect, Suspense } from "react";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

function UserDataContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This ensures the code only runs on the client
    const initTelegramApp = async () => {
      try {
        // Check if window is defined and if the Telegram WebApp object exists
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          // Use the global Telegram WebApp object
          const WebApp = window.Telegram.WebApp;
          
          if (WebApp.initDataUnsafe?.user) {
            setUserData(WebApp.initDataUnsafe.user as UserData);
          } else {
            setError("No user data available in Telegram WebApp");
          }
        } else {
          // Fallback to the SDK if needed
          try {
            const WebAppModule = await import("@twa-dev/sdk");
            const WebApp = WebAppModule.default;
            
            if (WebApp.initDataUnsafe?.user) {
              setUserData(WebApp.initDataUnsafe.user as UserData);
            } else {
              setError("No user data available in Telegram WebApp SDK");
            }
          } catch (sdkError) {
            setError("Failed to load Telegram WebApp SDK");
            console.error("SDK error:", sdkError);
          }
        }
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error);
        setError("Failed to initialize Telegram Web App");
      } finally {
        setIsLoading(false);
      }
    };

    // Delay initialization slightly to ensure the script has loaded
    const timer = setTimeout(() => {
      initTelegramApp();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <div style={{ color: 'var(--tg-theme-text-color)' }}>Loading Telegram data...</div>;
  }

  if (error) {
    return <div style={{ color: 'var(--tg-theme-destructive-text-color)' }}>{error}</div>;
  }

  if (!userData) {
    return <div style={{ color: 'var(--tg-theme-hint-color)' }}>No user data available</div>;
  }

  return (
    <>
      <h1 style={{ 
        color: 'var(--tg-theme-text-color)',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        marginBottom: '1rem'
      }}>
        User Data
      </h1>
      <ul style={{ 
        color: 'var(--tg-theme-text-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <li>ID: {userData.id}</li>
        <li>First Name: {userData.first_name}</li>
        {userData.last_name && <li>Last Name: {userData.last_name}</li>}
        {userData.username && <li>Username: {userData.username}</li>}
        <li>Language Code: {userData.language_code}</li>
        <li>Is Premium: {userData.is_premium ? 'Yes' : 'No'}</li>
      </ul>
    </>
  );
}

export default function Home() {
  return (
    <main style={{ 
      padding: '1rem',
      backgroundColor: 'var(--tg-theme-bg-color)',
      minHeight: '100vh'
    }}>
      <Suspense fallback={
        <div style={{ color: 'var(--tg-theme-text-color)' }}>Loading...</div>
      }>
        <UserDataContent />
      </Suspense>
    </main>
  );
}