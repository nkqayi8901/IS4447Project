export type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
  windspeed: number;
};
// The weather.ts file contains utility functions for fetching weather data based on a city name. 
// It uses the Open-Meteo API to first geocode the city name into latitude and longitude coordinates, and then 
// fetches the current weather conditions for those coordinates. The WMO_CODES constant maps weather codes from the API to human-readable descriptions and corresponding icons. The WEATHER_SUGGESTIONS constant provides activity suggestions based on the
//  current weather conditions, which can be used in the app to recommend activities to users based on the weather forecast for their trip destinations.
// The fetchWeather function takes a city name as input, performs the necessary API calls to retrieve the weather data, and returns a WeatherData object containing the temperature, weather description, icon name, city name, and wind speed. If any of the API calls fail or if the city cannot be geocoded, the function returns null. This utility function can be used throughout the app to
//  display weather information for trip destinations and provide relevant activity suggestions based on the current weather conditions.
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',        icon: 'sunny'        },
  1:  { label: 'Mainly clear',     icon: 'partly-sunny' },
  2:  { label: 'Partly cloudy',    icon: 'partly-sunny' },
  3:  { label: 'Overcast',         icon: 'cloud'        },
  45: { label: 'Foggy',            icon: 'cloudy'       },
  48: { label: 'Icy fog',          icon: 'cloudy'       },
  51: { label: 'Light drizzle',    icon: 'rainy'        },
  53: { label: 'Drizzle',          icon: 'rainy'        },
  55: { label: 'Heavy drizzle',    icon: 'rainy'        },
  61: { label: 'Light rain',       icon: 'rainy'        },
  63: { label: 'Rain',             icon: 'rainy'        },
  65: { label: 'Heavy rain',       icon: 'rainy'        },
  71: { label: 'Light snow',       icon: 'snow'         },
  73: { label: 'Snow',             icon: 'snow'         },
  75: { label: 'Heavy snow',       icon: 'snow'         },
  80: { label: 'Rain showers',     icon: 'rainy'        },
  85: { label: 'Snow showers',     icon: 'snow'         },
  95: { label: 'Thunderstorm',     icon: 'thunderstorm' },
  99: { label: 'Thunderstorm',     icon: 'thunderstorm' },
};

export const WEATHER_SUGGESTIONS: Record<string, string[]> = {
  sunny:        ['Outdoor sightseeing', 'Cycling tour', 'Beach or park', 'Walking tour'],
  'partly-sunny': ['City walk', 'Outdoor market', 'Boat trip', 'Sightseeing'],
  cloud:        ['Museum visit', 'Food tour', 'City walking tour'],
  cloudy:       ['Art gallery', 'Shopping district', 'Indoor market'],
  rainy:        ['Museum or gallery', 'Cooking class', 'Café hopping', 'Spa day'],
  snow:         ['Winter market', 'Skiing', 'Cosy café visit'],
  thunderstorm: ['Local restaurant', 'Art gallery', 'Indoor experience'],
};

export async function fetchWeather(city: string): Promise<WeatherData | null> {
  try {
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );
    if (!geoRes.ok) return null;
    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (!place) return null;

    const { latitude, longitude, name } = place;
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
    );
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();
    const current = weatherData.current;

    // support both old (weathercode) and new (weather_code) API field names
    const code: number = current.weather_code ?? current.weathercode ?? 0;
    const windspeed: number = current.wind_speed_10m ?? current.windspeed_10m ?? 0;
    const match = WMO_CODES[code] ?? { label: 'Unknown', icon: 'cloud' };

    return {
      temp: Math.round(current.temperature_2m),
      description: match.label,
      icon: match.icon,
      city: name,
      windspeed: Math.round(windspeed),
    };
  } catch {
    return null;
  }
}
