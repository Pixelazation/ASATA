export const WeatherApi = {
  getWeather: async (latitude: number, longitude: number) => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.append("latitude", latitude.toString());
      url.searchParams.append("longitude", longitude.toString());
      url.searchParams.append("current_weather", "true");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.current_weather;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      throw error;
    }
  },

  getHourlyConditions: async (latitude: number, longitude: number) => {
    try {
      const url = new URL("https://api.open-meteo.com/v1/forecast");
      url.searchParams.append("latitude", latitude.toString());
      url.searchParams.append("longitude", longitude.toString());
      url.searchParams.append("hourly", "weather_code");

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.current_weather;
    } catch (error) {
      console.error("Error fetching hourly weather data:", error);
      throw error;
    }
  },
};