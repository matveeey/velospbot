'use client'

import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

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
    hasPermission,
    error,
    currentLocation,
    startTracking,
    stopTracking,
    isTracking
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

  if (!hasPermission) {
    return (
      <div style={{ color: 'var(--tg-theme-text-color)' }}>
        Для работы трекера необходим доступ к геолокации
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
        {error}
      </div>
    );
  }

  const defaultPosition: [number, number] = [55.7558, 37.6173]; // Москва
  const currentPosition: [number, number] = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
    : defaultPosition;

  return (
    <div style={{ 
      padding: '1rem',
      color: 'var(--tg-theme-text-color)'
    }}>
      <Map center={currentPosition} isTracking={isTracking} />
      
      <h2 style={{ marginBottom: '1rem' }}>
        Статус: {isTracking ? 'Отслеживание' : 'Остановлено'}
      </h2>
      {currentLocation && (
        <div>
          <p>Широта: {currentLocation.coords.latitude.toFixed(6)}</p>
          <p>Долгота: {currentLocation.coords.longitude.toFixed(6)}</p>
          <p>Точность: {currentLocation.coords.accuracy.toFixed(1)}м</p>
          {currentLocation.coords.speed && (
            <p>Скорость: {(currentLocation.coords.speed * 3.6).toFixed(1)} км/ч</p>
          )}
        </div>
      )}
    </div>
  );
} 