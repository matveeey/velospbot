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
  error: string | null;
  currentLocation: LocationData | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
}

export function useLocationTracking(): LocationTrackingResult {
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const watchId = useRef<number | null>(null);

  const startTracking = async () => {
    try {
      const permissionResult = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permissionResult.state === 'granted') {
        initializeTracking();
      } else {
        // Запрашиваем разрешение
        navigator.geolocation.getCurrentPosition(
          () => {
            initializeTracking();
          },
          (error) => {
            setError(`Геолокация недоступна: ${error.message}`);
            setIsTracking(false);
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsTracking(false);
    }
  };

  const initializeTracking = () => {
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
        setIsTracking(true);
      },
      (error) => {
        setError(`Ошибка отслеживания: ${error.message}`);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
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
    error,
    currentLocation,
    startTracking,
    stopTracking,
    isTracking
  };
} 