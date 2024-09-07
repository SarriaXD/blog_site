import * as process from 'node:process'
import { format } from 'date-fns'

export interface WeatherData {
    location: {
        name: string
        localtime: string
        tz_id: string
    }
    current: {
        temp_c: number
        condition: {
            text: string
            icon: string
        }
    }
    forecast: {
        forecastday: Array<{
            date: string
            day: {
                maxtemp_c: number
                mintemp_c: number
            }
        }>
    }
}

const API_KEY = process.env.WEATHER_API_KEY
const API_BASE_URL = 'https://api.weatherapi.com/v1'

async function getWeatherData(
    city: string,
    language: 'en' | 'zh'
): Promise<WeatherData> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=7`
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = (await response.json()) as WeatherData
        const localTime = new Date(data.location.localtime)

        return {
            location: {
                ...data.location,
                localtime: format(localTime, 'hh:mm a'),
            },
            current: data.current,
            forecast: {
                forecastday: data.forecast.forecastday.map((day) => ({
                    date: formatDate(new Date(day.date), language),
                    day: {
                        maxtemp_c: day.day.maxtemp_c,
                        mintemp_c: day.day.mintemp_c,
                    },
                })),
            },
        }
    } catch (error) {
        return {
            location: {
                name: 'notfound',
                localtime: '',
                tz_id: '',
            },
            current: {
                temp_c: 0,
                condition: {
                    text: '',
                    icon: '',
                },
            },
            forecast: {
                forecastday: [],
            },
        }
    }
}
const DayOfWeekEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DayOfWeekZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

const formatDate = (date: Date, language: 'en' | 'zh'): string => {
    if (isNaN(date.getTime())) {
        throw new Error('Invalid date string')
    }
    if (language === 'en') {
        return `${DayOfWeekEn[date.getUTCDay()]}`
    } else {
        return `${DayOfWeekZh[date.getUTCDay()]}`
    }
}

export default getWeatherData
