import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  MapPin,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  Snowflake,
  Loader2,
  Compass,
  Gauge,
  Eye,
  Sunrise,
  Sunset,
  Umbrella,
} from "lucide-react";

import {
  searchCities,
  getWeatherByCoordinates,
  getWeatherByCity,
} from "../api/weatherApi";


const getWeatherVideo = (code, temperature) => {
  // 🧊 Extremely cold + clear sky
  // Example: Antarctica -54°C, weather code 0
  if (code === 0 && temperature <= -10) {
    return "/videos/arctic.mp4";
  }

  // ☀️ Clear Sky
  if (code === 0) {
    return "/videos/sunny.mp4";
  }

  // ☁️ Cloudy
  if ([1, 2, 3].includes(code)) {
    return "/videos/cloudy.mp4";
  }

  // 🌫️ Fog
  if ([45, 48].includes(code)) {
    return "/videos/foggy.mp4";
  }

  // 🌧️ Rain / Drizzle / Freezing Rain
  if (
    [
      51, 53, 55,
      56, 57,
      61, 63, 65,
      66, 67,
      80, 81, 82,
    ].includes(code)
  ) {
    return "/videos/rainy.mp4";
  }

  // ❄️ Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "/videos/snowfall.mp4";
  }

  // ⛈️ Thunderstorm
  if ([95, 96, 99].includes(code)) {
    return "/videos/thunderstorm.mp4";
  }

  // Default
  return "/videos/cloudy.mp4";
};


const Weather = () => {
  const [city, setCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const backgroundVideo = weather
    ? getWeatherVideo(
      weather.weatherCode,
      weather.temperature
    )
    : "/videos/sunny.mp4";


  const selectedLocationRef = useRef(false);

  // =========================================================
  // CITY SUGGESTIONS
  // =========================================================

  useEffect(() => {
    if (selectedLocationRef.current) {
      selectedLocationRef.current = false;
      return;
    }

    if (city.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(city);
        setSuggestions(results);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);
  // =========================================================
  // GET WEATHER BY SELECTED LOCATION
  // =========================================================

  const fetchWeatherByLocation = async (location) => {
    try {
      setLoading(true);
      setError("");

      const data = await getWeatherByCoordinates(
        location.latitude,
        location.longitude,
        location
      );

      setWeather(data);
      console.log(data, 'weather');
      setSuggestions([]);
    } catch (error) {
      console.error(error);

      setWeather(null);
      setError("Unable to fetch weather");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECT CITY
  // =========================================================

  const handleSelectCity = (location) => {
    selectedLocationRef.current = true;

    setCity(location.name);
    setSuggestions([]);

    fetchWeatherByLocation(location);
  };

  // =========================================================
  // MANUAL SEARCH
  // =========================================================

  const handleSearch = async () => {
    if (!city.trim()) {
      setError("Please enter a city");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuggestions([]);

      const data = await getWeatherByCity(city);

      setWeather(data);
    } catch (error) {
      setWeather(null);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLocation = (weather) => {
    return [
      weather.city,
      weather.admin2,
      weather.admin1,
      weather.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const formatSuggestionLocation = (location) => {
    return [
      location.admin2,
      location.admin1,
      location.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const getWindDirection = (degrees) => {
    const directions = [
      "N",
      "NE",
      "E",
      "SE",
      "S",
      "SW",
      "W",
      "NW",
    ];

    const index = Math.round(degrees / 45) % 8;

    return directions[index];
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "--";

    return new Date(dateTime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatVisibility = (meters) => {
    if (meters == null) return "--";

    return `${(meters / 1000).toFixed(1)} km`;
  };

  // =========================================================
  // WEATHER CONDITION
  // =========================================================

  const getWeatherInfo = (code) => {
    const conditions = {
      0: {
        label: "Clear Sky",
        icon: Sun,
      },

      1: {
        label: "Mainly Clear",
        icon: CloudSun,
      },

      2: {
        label: "Partly Cloudy",
        icon: CloudSun,
      },

      3: {
        label: "Overcast",
        icon: Cloud,
      },

      45: {
        label: "Fog",
        icon: Cloud,
      },

      48: {
        label: "Rime Fog",
        icon: Cloud,
      },

      51: {
        label: "Light Drizzle",
        icon: CloudRain,
      },

      53: {
        label: "Moderate Drizzle",
        icon: CloudRain,
      },

      55: {
        label: "Dense Drizzle",
        icon: CloudRain,
      },

      61: {
        label: "Slight Rain",
        icon: CloudRain,
      },

      63: {
        label: "Moderate Rain",
        icon: CloudRain,
      },

      65: {
        label: "Heavy Rain",
        icon: CloudRain,
      },

      71: {
        label: "Slight Snow",
        icon: Snowflake,
      },

      73: {
        label: "Moderate Snow",
        icon: Snowflake,
      },

      75: {
        label: "Heavy Snow",
        icon: Snowflake,
      },

      80: {
        label: "Rain Showers",
        icon: CloudRain,
      },

      81: {
        label: "Moderate Rain Showers",
        icon: CloudRain,
      },

      82: {
        label: "Heavy Rain Showers",
        icon: CloudRain,
      },

      95: {
        label: "Thunderstorm",
        icon: CloudLightning,
      },

      96: {
        label: "Thunderstorm with Hail",
        icon: CloudLightning,
      },

      99: {
        label: "Thunderstorm with Heavy Hail",
        icon: CloudLightning,
      },
    };

    return (
      conditions[code] || {
        label: "Unknown",
        icon: Cloud,
      }
    );
  };

  const weatherInfo = weather
    ? getWeatherInfo(weather.weatherCode)
    : null;

  const WeatherIcon = weatherInfo?.icon;

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 text-white">
      {/* Weather Video Background */}
      <AnimatePresence mode="wait">
        <motion.video
          key={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-0 h-full w-full object-cover pointer-events-none"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </motion.video>
      </AnimatePresence>

      {/* Dark Overlay */}
      <div className="fixed inset-0 z-0 bg-black/45 pointer-events-none" />

      <div className="relative z-10">

        <div className="mx-auto max-w-2xl">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Weather
            </h1>

            <p className="mt-2 text-white/60">
              Check the current weather anywhere in the world
            </p>
          </motion.div>

          {/* ================================================= */}
          {/* SEARCH */}
          {/* ================================================= */}

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* Search Box */}
            <div className="group flex items-center rounded-2xl border border-white/15 bg-black/35 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-white/30 focus-within:bg-black/45">

              {/* Search Icon */}
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Search className="h-5 w-5 text-white/60 transition group-focus-within:text-white" />
              </div>

              {/* Input */}
              <input
                type="text"
                value={city}
                placeholder="Search for a city..."
                onChange={(e) => {
                  setCity(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }

                  if (e.key === "Escape") {
                    setSuggestions([]);
                  }
                }}
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base text-white outline-none placeholder:text-white/40"
              />

              {/* Clear Button */}
              {city && !loading && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setCity("");
                    setSuggestions([]);
                    setError("");
                    setWeather(null);
                  }}
                  className="mr-2 flex h-9 w-9 items-center justify-center rounded-full text-white/40 transition hover:bg-white/10 hover:text-white"
                  aria-label="Clear search"
                >
                  x
                </motion.button>
              )}

              {/* Search Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                onClick={handleSearch}
                disabled={loading || !city.trim()}
                className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900 shadow-lg transition-all duration-200 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="hidden sm:inline">Loading</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span className="hidden sm:inline">Search</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* ================================================= */}
            {/* CITY SUGGESTIONS */}
            {/* ================================================= */}

            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -8,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    y: -8,
                    scale: 0.98,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden rounded-2xl border border-white/15 bg-slate-950/85 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Locations
                    </p>
                  </div>

                  {suggestions.map((location, index) => (
                    <motion.button
                      key={`${location.id}-${location.latitude}`}
                      initial={{
                        opacity: 0,
                        x: -10,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      onClick={() => handleSelectCity(location)}
                      className="group flex w-full items-center gap-4 border-b border-white/5 px-4 py-4 text-left transition-all duration-200 last:border-b-0 hover:bg-white/10"
                    >
                      {/* Location Icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 transition group-hover:bg-white/15">
                        <MapPin className="h-5 w-5 text-white/60 group-hover:text-white" />
                      </div>

                      {/* Location Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">
                          {location.name}
                        </p>

                        <p className="mt-0.5 truncate text-sm text-white/45">
                          {formatSuggestionLocation(location)}
                        </p>
                      </div>

                      {/* Coordinates */}
                      <div className="hidden text-right sm:block">
                        <p className="text-xs text-white/25">
                          {location.latitude.toFixed(2)}°
                        </p>

                        <p className="text-xs text-white/25">
                          {location.longitude.toFixed(2)}°
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================================================= */}
          {/* WEATHER CARD */}
          {/* ================================================= */}

          {/* ================================================= */}
          {/* WEATHER CARD */}
          {/* ================================================= */}

          <AnimatePresence mode="wait">
            {weather && (
              <motion.div
                key={`${weather.latitude}-${weather.longitude}`}
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeOut",
                }}
                className="mt-8 overflow-hidden rounded-[2rem] border border-white/20 bg-black/30 shadow-2xl backdrop-blur-xl"
              >
                {/* ================================================= */}
                {/* MAIN WEATHER */}
                {/* ================================================= */}

                <div className="relative p-7 sm:p-9">

                  {/* subtle glow */}
                  <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                  {/* LOCATION */}
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="relative flex items-center gap-2 text-sm text-white/70"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>

                    <span className="font-medium">
                      {formatLocation(weather)}
                    </span>
                  </motion.div>

                  {/* TEMPERATURE + ICON */}
                  <div className="relative mt-8 flex items-center justify-between">

                    {/* Temperature */}
                    <div>
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: 15,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: 0.25,
                          duration: 0.5,
                        }}
                        className="text-7xl font-semibold tracking-[-0.05em] text-white sm:text-8xl"
                      >
                        {Math.round(weather.temperature)}
                        <span className="ml-1 text-4xl font-normal text-white/60 sm:text-5xl">
                          °
                        </span>
                      </motion.p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-base font-medium text-white/70 sm:text-lg"
                        >
                          {weatherInfo.label}
                        </motion.p>

                        <span className="text-sm text-white/40">
                          Feels like {Math.round(weather.feelsLike)}°
                        </span>
                      </div>
                    </div>

                    {/* Weather Icon */}
                    {WeatherIcon && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.5,
                          rotate: -15,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          rotate: 0,
                        }}
                        transition={{
                          delay: 0.25,
                          duration: 0.6,
                          type: "spring",
                        }}
                        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-xl backdrop-blur-md sm:h-32 sm:w-32"
                      >
                        <div className="absolute inset-3 rounded-full bg-white/5 blur-md" />

                        <WeatherIcon className="relative h-16 w-16 text-white sm:h-20 sm:w-20" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* ================================================= */}
                {/* STATS */}
                {/* ================================================= */}

                {/* ================================================= */}
                {/* WEATHER DETAILS */}
                {/* ================================================= */}

                <div className="grid grid-cols-2 gap-3 border-t border-white/10 bg-black/10 p-3 sm:grid-cols-3">

                  {/* HUMIDITY */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10">
                        <Droplets className="h-5 w-5 text-blue-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Humidity
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {weather.humidity}%
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* WIND */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10">
                        <Wind className="h-5 w-5 text-cyan-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Wind
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {weather.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* WIND DIRECTION */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Compass className="h-5 w-5 text-white/80" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Direction
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {getWindDirection(weather.windDirection)}
                        </p>

                        <p className="text-xs text-white/35">
                          {weather.windDirection}°
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* PRECIPITATION */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/10">
                        <Umbrella className="h-5 w-5 text-sky-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Precipitation
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {weather.precipitation} mm
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* CLOUD COVER */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Cloud className="h-5 w-5 text-white/70" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Cloud Cover
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {weather.cloudCover}%
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* PRESSURE */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-400/10">
                        <Gauge className="h-5 w-5 text-purple-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Pressure
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {weather.pressure} hPa
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* VISIBILITY */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-400/10">
                        <Eye className="h-5 w-5 text-green-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Visibility
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatVisibility(weather.visibility)}
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* SUNRISE */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10">
                        <Sunrise className="h-5 w-5 text-yellow-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Sunrise
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatTime(weather.sunrise)}
                        </p>
                      </div>
                    </div>
                  </motion.div>


                  {/* SUNSET */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.75 }}
                    className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md sm:col-span-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-400/10">
                        <Sunset className="h-5 w-5 text-orange-300" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/45">
                          Sunset
                        </p>

                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatTime(weather.sunset)}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* ================================================= */}
          {/* EMPTY STATE */}
          {/* ================================================= */}

          <AnimatePresence>
            {!weather && !loading && !error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.2,
                  ease: "easeOut",
                }}
                className="mt-14 flex flex-col items-center text-center sm:mt-20"
              >
                {/* ICON */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl"
                >
                  {/* Glow */}
                  <div className="absolute inset-0 rounded-[2rem] bg-white/5 blur-xl" />

                  <Thermometer className="relative h-10 w-10 text-white/80" />

                  {/* Small decorative dot */}
                  <motion.span
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-white"
                  />
                </motion.div>

                {/* TEXT */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="mt-7 text-2xl font-semibold tracking-tight text-white">
                    Find your weather
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">
                    Search for any city to see its current temperature,
                    weather conditions, humidity and wind.
                  </p>
                </motion.div>

                {/* HINT */}
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.55,
                  }}
                  className="mt-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-white/45 backdrop-blur-md"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Try searching for a city above</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Weather;