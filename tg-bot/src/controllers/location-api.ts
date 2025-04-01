import express from 'express';
import { Location } from '../models/location';

type NextFunction = (err?: any) => void;

export function setupLocationApi(app: express.Application) {
  // Basic authorization middleware
  const authorize = (req: express.Request, res: express.Response, next: NextFunction) => {
    // This would be replaced with proper JWT verification in production
    next();
  };

  // Get user's latest location
  app.get('/api/location/:userId', authorize, (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
    const location = Location.getLastLocation(userId);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  });

  // Get user's location history
  app.get('/api/location/:userId/history', authorize, (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    
    const history = Location.getLocationHistory(userId, limit);
    res.json(history);
  });

  // Get all users with location data
  app.get('/api/users', authorize, (req: express.Request, res: express.Response) => {
    const users = Location.getAllUsers();
    res.json(users);
  });

  // Clear user's location history
  app.delete('/api/location/:userId', authorize, (req: express.Request, res: express.Response) => {
    const userId = req.params.userId;
    Location.clearLocationHistory(userId);
    res.json({ success: true });
  });
} 