'use client'

import { useState, useEffect } from "react";

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegramApp = async () => {
      try {
        const WebAppModule = await import("@twa-dev/sdk");
        const WebApp = WebAppModule.default;
        
        if (WebApp.initDataUnsafe.user) {
          setUserData(WebApp.initDataUnsafe.user as UserData);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Telegram Web App:", error);
        setIsLoading(false);
      }
    };

    initTelegramApp();
  }, [])

  return (
    <main className="p-4">
      {isLoading ? (
        <>Loading...</>
      ) : userData ? (
        <>
          <h1 className="test-2x1 font-bold mb4">User Data</h1>
          <ul>
            <li>ID: {userData.id}</li>
            <li>First Name: {userData.first_name}</li>
            <li>Last Name: {userData.last_name}</li>
            <li>Username: {userData.username}</li>
            <li>Language Code: {userData.language_code}</li>
            <li>Is Premium: {userData.is_premium ? 'Yes' : 'No'}</li>
          </ul>
        </>
      ) : (
        <>No user data available</>
      )}
    </main>
  );
}