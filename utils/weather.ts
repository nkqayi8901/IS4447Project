export type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
  windspeed: number;
};

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0:  { label: 'Clear sky',        icon: 'sunny'           },
  1:  { label: 'Mainly clear',     icon: 'partly-sunny'    },
  2:  { label: 'Partly cloudy',    icon: 'partly-sunny'    },
  3:  { label: 'Overcast',         icon: 'cloud'           },
  45: { label: 'Foggy',            icon: 'cloudy'          },
  48: { label: 'Icy fog',          icon: 'cloudy'          },
  51: { label: 'Light drizzle',    icon: 'rainy'           },
  53: { label: 'Drizzle',          icon: 'rainy'           },
  55: { label: 'Heavy drizzle',    icon: 'rainy'           },
  61: { label: 'Light rain',       icon: 'rainy'           },
  63: { label: 'Rain',             icon: 'rainy'           },
  65: { label: 'Heavy rain',       icon: 'rainy'           },
  71: { label: 'Light snow',       icon: 'snow'            },
  73: { label: 'Snow',             icon: 'snow'            },
  75: { label: 'Heavy snow',       icon: 'snow'            },
  80: { label: 'Rain showers',     icon: 'rainy'           },
  85: { label: 'Snow showers',     icon: 'snow'            },
  95: { label: 'Thunderstorm',     icon: 'thunderstorm'    },
  99: { label: 'Thunderstorm',     icon: 'thunderstorm'    },
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&timezone=auto`
    );
    if (!weatherRes.ok) return null;
    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    const code: number = current.weathercode;
    const match = WMO_CODES[code] ?? { label: 'Unknown', icon: 'cloud' };

    return {
      temp: Math.round(current.temperature_2m),
      description: match.label,
      icon: match.icon,
      city: name,
      windspeed: Math.round(current.windspeed_10m),
    };
  } catch {
    return null;
  }
}
