const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_API = "https://api.open-meteo.com/v1/forecast";

// Search city suggestions
export const searchCities = async (city) => {
    if (!city.trim()) return [];

    const response = await fetch(
        `${GEO_API}?name=${encodeURIComponent(
            city
        )}&count=5&language=en&format=json`
    );

    if (!response.ok) {
        throw new Error("Failed to search cities");
    }

    const data = await response.json();

    return data.results || [];
};

// Get weather using exact coordinates
export const getWeatherByCoordinates = async (
    latitude,
    longitude,
    location
) => {
    const response = await fetch(
        `${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,cloud_cover,pressure_msl,visibility,weather_code&daily=sunrise,sunset&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather");
    }

    const data = await response.json();

    return {
        city: location.name,
        country: location.country,
        admin1: location.admin1,
        admin2: location.admin2,

        latitude,
        longitude,

        // Temperature
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,

        // Humidity
        humidity: data.current.relative_humidity_2m,

        // Wind
        windSpeed: data.current.wind_speed_10m,
        windDirection: data.current.wind_direction_10m,

        // Weather details
        precipitation: data.current.precipitation,
        cloudCover: data.current.cloud_cover,
        pressure: data.current.pressure_msl,
        visibility: data.current.visibility,

        // Condition
        weatherCode: data.current.weather_code,

        // Sun
        sunrise: data.daily.sunrise[0],
        sunset: data.daily.sunset[0],
    };
};

// Optional: used when user presses Search manually
export const getWeatherByCity = async (city) => {
    const locations = await searchCities(city);

    if (!locations.length) {
        throw new Error("City not found");
    }

    const location = locations[0];

    return getWeatherByCoordinates(
        location.latitude,
        location.longitude,
        location
    );
};