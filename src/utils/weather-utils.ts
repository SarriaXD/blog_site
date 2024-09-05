import * as process from 'node:process'

interface WeatherData {
    city: string
    value: number
    unit: string
    weeklyForecast: {
        day: string
        value: number
    }[]
}

const API_KEY = process.env.WEATHER_API_KEY
const API_BASE_URL = 'https://api.weatherapi.com/v1'

async function getWeatherData(city: string): Promise<WeatherData> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=7`
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        const weekDays = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ]

        return {
            city: data.location.name,
            value: Math.round(data.current.temp_c),
            unit: 'celsius',
            weeklyForecast: data.forecast.forecastday.map((day: any) => ({
                day: weekDays[new Date(day.date).getDay()],
                value: Math.round(day.day.avgtemp_c),
            })),
        }
    } catch (error) {
        return {
            city: 'notfound',
            value: 0,
            unit: 'celsius',
            weeklyForecast: [],
        }
    }
}

export default getWeatherData
