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


/**
 * Fetches the weather forecast for a given location (either by string or coordinates).
 * @param location The city/location string (e.g., "Punjab, India") or a coordinate object.
 * @param apiKey Your OpenWeatherMap API key.
 * @returns A promise that resolves to the weather data.
 */
export async function getForecast(location: LocationInput, apiKey: string) {
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
            throw new Error(`Weather API request failed with status ${response.status}: ${errorData.message}`);
        }
        const data = await response.json();

        if (!data.main || !data.weather || !data.wind) {
            throw new Error("Invalid data format received from weather API.");
        }
        
        const mainCondition = data.weather[0]?.description?.toLowerCase() || 'Clear';
        const simplifiedCondition = Object.keys(conditionMap).find(key => mainCondition.includes(key));
        const condition = simplifiedCondition ? conditionMap[simplifiedCondition] : 'Clear';


        return {
            temperature: Math.round(data.main.temp),
            condition: condition,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6), // Convert from m/s to km/h
        };
    } catch (error) {
        console.error("Error fetching weather forecast:", error);
        throw new Error("Failed to fetch weather forecast from the API.");
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
