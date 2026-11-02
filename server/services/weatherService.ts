import { WeatherCondition } from '../../shared/types';

interface CachedWeather {
  data: WeatherCondition;
  expiresAt: number;
}

const weatherCache = new Map<string, CachedWeather>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

// Map WMO weather codes to serene mindful descriptions
function mapWeatherCode(code: number): string {
  switch (code) {
    case 0:
      return 'Clear Calm Sky';
    case 1:
      return 'Mostly Sunny with Drifting Clouds';
    case 2:
      return 'Scattered Soft Clouds';
    case 3:
      return 'Overcast Autumn Canopy';
    case 45:
    case 48:
      return 'Morning Mist & Dew';
    case 51:
    case 53:
    case 55:
      return 'Gentle Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Steady Soothing Rain';
    case 71:
    case 73:
    case 75:
      return 'Quiet Falling Snow';
    default:
      return 'Quiet Atmospheric Current';
  }
}

export async function getAtmosphericWind(lat: number, lon: number): Promise<WeatherCondition> {
  const roundedKey = `${lat.toFixed(1)}_${lon.toFixed(1)}`;
  const now = Date.now();

  const cached = weatherCache.get(roundedKey);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current_weather=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const json = await res.json();
    const current = json.current_weather || {};

    const windSpeed = Number(current.windspeed) || 9.0;
    const windDir = Number(current.winddirection) || 180;
    const temp = Number(current.temperature) || 20;
    const wCode = Number(current.weathercode) || 0;

    let calmnessLevel: 'calm' | 'breeze' | 'gale' = 'breeze';
    if (windSpeed < 6) calmnessLevel = 'calm';
    else if (windSpeed > 22) calmnessLevel = 'gale';

    const result: WeatherCondition = {
      temperatureC: Math.round(temp),
      windSpeedKmH: Math.round(windSpeed),
      windDirectionDeg: Math.round(windDir),
      weatherCode: wCode,
      conditionDescription: mapWeatherCode(wCode),
      calmnessLevel
    };

    weatherCache.set(roundedKey, {
      data: result,
      expiresAt: now + CACHE_TTL_MS
    });

    return result;
  } catch (error) {
    // Graceful offline fallback with calm default atmosphere
    return {
      temperatureC: 19,
      windSpeedKmH: 8,
      windDirectionDeg: 120,
      weatherCode: 1,
      conditionDescription: 'Gentle Thermal Drift',
      calmnessLevel: 'breeze'
    };
  }
}

// Haversine formula to compute geodesic distance between coordinates on Earth in km
export function calculateGeodesicDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = Math.round(R * c);

  return Math.max(15, distance); // Minimum 15km for local city atmospheric buffer
}

// Calculate delivery duration in milliseconds influenced by physical distance, atmospheric wind, and breath effort
export function calculateWindPacedTransitMs(
  distanceKm: number,
  windSpeedKmH: number,
  breathEffort: 'gentle' | 'balanced' | 'deep' = 'balanced'
): number {
  // Base delivery: 10 minutes (600,000ms) for local drift, scaling up to 25 minutes for global transcontinental
  const baseMinutes = Math.min(25, 10 + (distanceKm / 1000) * 1.5);

  // Wind speed adjustment: Tailwinds accelerate by up to 20%, calm air requires deeper breath
  let windFactor = 1.0;
  if (windSpeedKmH > 18) {
    windFactor = 0.85; // Faster travel
  } else if (windSpeedKmH < 5) {
    windFactor = 1.15; // Still air slows transit
  }

  // Breath effort adjustment
  let breathFactor = 1.0;
  if (breathEffort === 'deep') breathFactor = 0.8;
  if (breathEffort === 'gentle') breathFactor = 1.2;

  const finalMinutes = baseMinutes * windFactor * breathFactor;
  return Math.round(finalMinutes * 60 * 1000);
}
