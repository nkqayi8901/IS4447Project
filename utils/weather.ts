const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY ?? '';

export type WeatherData = {
  temp: number;
  description: string;
  icon: string;
  city: string;
};

export async function fetchWeather(city: string): Promise<WeatherData | null> {
  if (!API_KEY || API_KEY === 'your_api_key_here') return null;
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].main,
      city: data.name,
    };
  } catch {
    return null;
  }
}
