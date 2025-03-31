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

interface Stats {
  currentSpeed: number;
  medianSpeed: number;
  distance: number;
  duration: number;
}

interface LocationTrackingResult {
  error: string | null;
  currentLocation: LocationData | null;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  isTracking: boolean;
  stats: Stats;
  locationHistory: LocationData[];
  resetRoute: () => void;
  isLoading: boolean;
}

export function useLocationTracking(): LocationTrackingResult {
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [stats, setStats] = useState<Stats>({
    currentSpeed: 0,
    medianSpeed: 0,
    distance: 0,
    duration: 0
  });
  const watchId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Вычисление расстояния между двумя точками
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // радиус Земли в км
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Обновление статистики
  const updateStats = (location: LocationData) => {
    const speeds = locationHistory
      .map(loc => loc.coords.speed || 0)
      .filter(speed => speed > 0);
    
    const currentSpeed = location.coords.speed ? location.coords.speed * 3.6 : 0; // м/с в км/ч
    const medianSpeed = speeds.length > 0 
      ? speeds.sort((a, b) => a - b)[Math.floor(speeds.length / 2)] * 3.6 
      : 0;

    let distance = 0;
    if (locationHistory.length > 0) {
      const prevLocation = locationHistory[locationHistory.length - 1];
      distance = calculateDistance(
        prevLocation.coords.latitude,
        prevLocation.coords.longitude,
        location.coords.latitude,
        location.coords.longitude
      );
    }

    const duration = startTime.current 
      ? (Date.now() - startTime.current) / 1000 
      : 0;

    setStats(prev => ({
      currentSpeed,
      medianSpeed,
      distance: prev.distance + distance,
      duration
    }));
  };

  const startTracking = async () => {
    try {
      setIsLoading(true);
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
            setIsLoading(false);
          },
          { enableHighAccuracy: true }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setIsTracking(false);
      setIsLoading(false);
    }
  };

  const initializeTracking = () => {
    startTime.current = Date.now();
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        setIsLoading(false);
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
        setLocationHistory(prev => [...prev, locationData]);
        updateStats(locationData);
        setError(null);
        setIsTracking(true);
      },
      (error) => {
        setError(`Ошибка отслеживания: ${error.message}`);
        setIsTracking(false);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    );
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    startTime.current = null;
    setIsTracking(false);
  };

  const resetRoute = () => {
    setLocationHistory([]);
    setStats({
      currentSpeed: 0,
      medianSpeed: 0,
      distance: 0,
      duration: 0
    });
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
    isTracking,
    stats,
    locationHistory,
    resetRoute,
    isLoading
  };
} 