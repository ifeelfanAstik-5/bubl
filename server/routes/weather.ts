import { Hono } from 'hono';
import { getAtmosphericWind } from '../services/weatherService';

export const weatherRoutes = new Hono();

// GET /api/weather/current?lat=35.0116&lon=135.7681
weatherRoutes.get('/current', async (c) => {
  const lat = parseFloat(c.req.query('lat') || '35.0116'); // Default Kyoto coordinates
  const lon = parseFloat(c.req.query('lon') || '135.7681');

  if (isNaN(lat) || isNaN(lon)) {
    return c.json({ success: false, error: 'Invalid coordinates provided' }, 400);
  }

  const weather = await getAtmosphericWind(lat, lon);
  return c.json({ success: true, data: weather });
});
