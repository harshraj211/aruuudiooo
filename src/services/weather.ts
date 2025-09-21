
/**
 * @fileOverview A service to fetch weather data from OpenWeatherMap.
 */

// A mapping of common weather conditions to a simpler set.
const conditionMap: { [key: string]: string } = {
    'clear sky': 'Sunny',
    'few clouds': 'Partly Cloudy',
    'scattered clouds': 'Cloudy',
    'broken clouds': 'Cloudy',
    'shower rain': 'Rainy',
    'rain': 'Rainy',
    'thunderstorm': 'Stormy',
    'snow': 'Snowy',
    'mist': 'Misty',
};

type LocationInput = string | { lat: number; lon: number };

export type CurrentWeatherData = {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    temp_max: number;
    temp_min: number;
}

export type DailyForecastData = {
    date: string; // "YYYY-MM-DD"
    dayOfWeek: string; // "Monday", "Tuesday", etc.
    temp_max: number;
    temp_min: number;
    condition: string;
    icon: string;
}

/**
 * Fetches the current weather forecast for a given location.
 * @param location The city/location string (e.g., "Punjab, India").
 * @param apiKey Your OpenWeatherMap API key.
 * @returns A promise that resolves to the current weather data.
 */
export async function getCurrentWeather(location: LocationInput, apiKey: string): Promise<CurrentWeatherData> {
    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    let url: string;

    if (typeof location === 'string') {
        url = `${baseUrl}?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    } else {
        url = `${baseUrl}?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
    }


    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Weather API request failed: ${errorData.message}`);
        }
        const data = await response.json();
        
        const mainCondition = data.weather[0]?.main || 'Clear';

        return {
            location: `${data.name}, ${data.sys.country}`,
            temperature: Math.round(data.main.temp),
            condition: mainCondition,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            icon: data.weather[0].icon,
            temp_max: Math.round(data.main.temp_max),
            temp_min: Math.round(data.main.temp_min),
        };
    } catch (error) {
        console.error("Error fetching current weather:", error);
        throw new Error("Failed to fetch current weather.");
    }
}


/**
 * Fetches a 5-day weather forecast.
 * @param location The city/location string.
 * @param apiKey Your OpenWeatherMap API key.
 * @returns A promise that resolves to an array of daily forecast data.
 */
export async function getDailyForecast(location: LocationInput, apiKey: string): Promise<DailyForecastData[]> {
    const baseUrl = "https://api.openweathermap.org/data/2.5/forecast";
    let url: string;

    if (typeof location === 'string') {
        url = `${baseUrl}?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;
    } else {
        url = `${baseUrl}?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric`;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Forecast API request failed: ${errorData.message}`);
        }
        const data = await response.json();

        const dailyData: { [key: string]: any } = {};

        data.list.forEach((item: any) => {
            const date = item.dt_txt.split(' ')[0]; // YYYY-MM-DD
            if (!dailyData[date]) {
                dailyData[date] = {
                    temps_min: [],
                    temps_max: [],
                    conditions: {},
                    icons: {},
                };
            }
            dailyData[date].temps_min.push(item.main.temp_min);
            dailyData[date].temps_max.push(item.main.temp_max);

            const condition = item.weather[0].main;
            const icon = item.weather[0].icon;
            dailyData[date].conditions[condition] = (dailyData[date].conditions[condition] || 0) + 1;
            dailyData[date].icons[icon] = (dailyData[date].icons[icon] || 0) + 1;
        });

        const forecast: DailyForecastData[] = Object.keys(dailyData).slice(0, 7).map(date => {
            const dayInfo = dailyData[date];
            const mostCommonCondition = Object.keys(dayInfo.conditions).reduce((a, b) => dayInfo.conditions[a] > dayInfo.conditions[b] ? a : b);
            const mostCommonIcon = Object.keys(dayInfo.icons).reduce((a, b) => dayInfo.icons[a] > dayInfo.icons[b] ? a : b);
            const dateObj = new Date(date);
            dateObj.setUTCHours(12); // Avoid timezone issues when getting day of week

            return {
                date: date,
                dayOfWeek: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                temp_min: Math.round(Math.min(...dayInfo.temps_min)),
                temp_max: Math.round(Math.max(...dayInfo.temps_max)),
                condition: mostCommonCondition,
                icon: mostCommonIcon,
            };
        });
        
        return forecast;

    } catch (error) {
        console.error("Error fetching daily forecast:", error);
        throw new Error("Failed to fetch daily forecast.");
    }
}


/**
 * Gets a city name from coordinates using reverse geocoding.
 * @param coords The latitude and longitude object.
 * @param apiKey Your OpenWeatherMap API key.
 * @returns A promise that resolves to the city name.
 */
export async function getCityNameFromCoords(coords: { lat: number; lon: number }, apiKey: string): Promise<string> {
    const baseUrl = "https://api.openweathermap.org/data/2.5/weather";
    const url = `${baseUrl}?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
    
    try {
        const response = await fetch(url);
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(`Reverse geocoding failed: ${errorData.message}`);
        }
        const data = await response.json();
        if (data.name && data.sys?.country) {
            return `${data.name}, ${data.sys.country}`;
        } else if (data.name) {
            return data.name;
        } else {
            throw new Error("Could not determine location name from coordinates.");
        }
    } catch (error) {
        console.error("Error reverse geocoding:", error);
        throw new Error("Failed to get city name from coordinates.");
    }
}
