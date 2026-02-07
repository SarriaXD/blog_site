import { StaticImageData } from 'next/image'

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

export interface Message {
    id: string
    role: 'user' | 'assistant' | 'tools'
    content: string
    images?: StaticImageData[]
    files?: {
        name: string
        extension: string
    }[]
    toolResults?: {
        toolName: string
        result:
            | WeatherData
            | {
                  length: number
              }
    }
}
