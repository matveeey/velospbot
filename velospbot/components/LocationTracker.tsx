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

  const defaultPosition: [number, number] = [55.7558, 37.6173];
  const currentPosition: [number, number] = currentLocation 
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
    : defaultPosition;

  return (
    <div style={{ 
      padding: '1rem',
      color: 'var(--tg-theme-text-color)'
    }}>
      <Map center={currentPosition} isTracking={isTracking} />
      
      <button 
        onClick={() => isTracking ? stopTracking() : startTracking()}
        style={{
          backgroundColor: isTracking ? 'var(--tg-theme-destructive-color)' : 'var(--tg-theme-button-color)',
          color: 'var(--tg-theme-button-text-color)',
          padding: '0.5rem 1rem',
          border: 'none',
          borderRadius: '0.5rem',
          width: '100%',
          marginBottom: '1rem',
          cursor: 'pointer',
          fontSize: '1rem'
        }}
      >
        {isTracking ? 'Остановить' : 'Начать отслеживание'}
      </button>

      <div style={{ marginTop: '1rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>
          Статус: {isTracking ? 'Отслеживание' : 'Остановлено'}
        </h2>
        {error && (
          <p style={{ color: 'var(--tg-theme-destructive-text-color)', marginBottom: '1rem' }}>
            {error}
          </p>
        )}
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
    </div>
  );
} 