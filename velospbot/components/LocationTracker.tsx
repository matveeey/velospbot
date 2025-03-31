'use client'

import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import StatsCard from './StatsCard';
import TrackingControls from './TrackingControls';

// Динамический импорт карты (без SSR)
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      height: '60vh', 
      width: '100%', 
      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1rem'
    }}>
      Загрузка карты...
    </div>
  )
});

export default function LocationTracker() {
  const {
    error,
    currentLocation,
    startTracking,
    stopTracking,
    isTracking,
    stats,
    locationHistory,
    resetRoute
  } = useLocationTracking();

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const webApp = window.Telegram.WebApp;
      webApp.ready();
      webApp.MainButton.setText(isTracking ? 'Остановить' : 'Начать');
      webApp.MainButton.show();
      
      webApp.MainButton.onClick(() => {
        if (isTracking) {
          stopTracking();
        } else {
          startTracking();
        }
      });
    }
  }, [isTracking]);

  const defaultPosition: [number, number] = [55.7558, 37.6173];
  const currentPosition: [number, number] = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
    : defaultPosition;

  return (
    <div style={{ 
      padding: '1rem',
      color: 'var(--tg-theme-text-color)'
    }}>
      <Map 
        center={currentPosition} 
        isTracking={isTracking} 
        locationHistory={locationHistory}
      />
      
      <StatsCard stats={stats} />
      
      <TrackingControls 
        isTracking={isTracking}
        onStart={startTracking}
        onStop={stopTracking}
        onReset={resetRoute}
        hasHistory={locationHistory.length > 0}
      />

      {error && (
        <div style={{ 
          color: 'var(--tg-theme-destructive-text-color)',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
} 