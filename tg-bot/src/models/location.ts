// User location data model

export interface LocationData {
  userId: string;      // Telegram user ID
  latitude: number;    // Latitude
  longitude: number;   // Longitude
  accuracy?: number;   // Accuracy in meters
  altitude?: number;   // Altitude
  speed?: number;      // Speed in m/s
  timestamp: number;   // Timestamp when location was recorded
}

// In-memory location storage
// Note: In production, this would be replaced with a database
class LocationStore {
  private locations: Map<string, LocationData[]> = new Map();

  // Add a new location point
  addLocation(location: LocationData): void {
    const userId = location.userId;
    if (!this.locations.has(userId)) {
      this.locations.set(userId, []);
    }
    this.locations.get(userId)!.push(location);
    
    // Limit history to 1000 points per user
    const userLocations = this.locations.get(userId)!;
    if (userLocations.length > 1000) {
      this.locations.set(userId, userLocations.slice(-1000));
    }
  }

  // Get user's most recent location
  getLastLocation(userId: string): LocationData | null {
    const userLocations = this.locations.get(userId);
    if (!userLocations || userLocations.length === 0) {
      return null;
    }
    return userLocations[userLocations.length - 1];
  }

  // Get user's location history
  getLocationHistory(userId: string, limit: number = 100): LocationData[] {
    const userLocations = this.locations.get(userId);
    if (!userLocations || userLocations.length === 0) {
      return [];
    }
    return userLocations.slice(Math.max(0, userLocations.length - limit));
  }

  // Clear user's location history
  clearLocationHistory(userId: string): void {
    this.locations.delete(userId);
  }

  // Get all users with location data
  getAllUsers(): string[] {
    return Array.from(this.locations.keys());
  }
}

// Export singleton instance
export const Location = new LocationStore(); 