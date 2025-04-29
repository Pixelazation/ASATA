import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { WeatherApi } from "../services/api/weather";
import { getWeatherCondition } from "../utils/weather";
import * as Location from "expo-location";

export const WeatherTracker: React.FC = () => {
  const [weather, setWeather] = useState<{ temperature: number; windspeed: number; weathercode: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);

      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Fetch weather data
      const weatherData = await WeatherApi.getWeather(latitude, longitude);
      setWeather(weatherData);
      setErrorMsg(null);
    } catch (error) {
      console.error("Error fetching weather:", error);
      Alert.alert("Error", "Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  return (
    <View style={styles.container}>
        <Text>Weather Tracker:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : errorMsg ? (
        <Text style={styles.error}>{errorMsg}</Text>
      ) : weather ? (
        <View>
          <Text style={styles.text}>Temperature: {weather.temperature}°C</Text>
          <Text style={styles.text}>Wind Speed: {weather.windspeed} km/h</Text>
          <Text style={styles.text}>Condition: {getWeatherCondition(weather.weathercode)}</Text>
        </View>
      ) : (
        <Text style={styles.text}>No weather data available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});