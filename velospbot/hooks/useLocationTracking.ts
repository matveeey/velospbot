import { useEffect, useState, useRef } from 'react';

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

interface LocationTrackingResult {
  hasPermission: boolean;
  error: string | null;
  currentLocation: LocationData | null;
  startTracking: () => void;
  stopTracking: () => void;
  isTracking: boolean;
}

export function useLocationTracking(): LocationTrackingResult {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    // Запрашиваем разрешение на использование геолокации
    navigator.geolocation.getCurrentPosition(
      () => setHasPermission(true),
      (error) => {
        setError(`Геолокация недоступна: ${error.message}`);
        setHasPermission(false);
      }
    );
  }, []);

  const startTracking = () => {
    if (!hasPermission) return;

    try {
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const locationData: LocationData = {
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed,
            },
            timestamp: position.timestamp,
          };
          setCurrentLocation(locationData);
          setError(null);
        },
        (error) => {
          setError(`Ошибка отслеживания: ${error.message}`);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000
        }
      );
      setIsTracking(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsTracking(false);
  };

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return {
    hasPermission,
    error,
    currentLocation,
    startTracking,
    stopTracking,
    isTracking
  };
} 