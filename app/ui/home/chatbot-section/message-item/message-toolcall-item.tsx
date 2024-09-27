import { Message } from '@ui/home/chatbot-section/message-item/message-item.tsx'

const ToolcallItem = (message: Message) => {
    if (message.toolResults?.toolName == 'getWeatherInformation') {
        return <WeatherInformationItem {...message.toolResults.result} />
    } else if (message.toolResults?.toolName == 'search') {
        return <SearchItem {...message.toolResults.result} />
    }
}

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

const WeatherInformationItem = (weatherData: WeatherData) => {
    return (
        <div className="flex flex-col gap-4 rounded-lg bg-blue-700 p-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <WeatherIcon
                        localtime={new Date(weatherData.location.localtime)}
                        weatherCondition={weatherData.current.condition.text}
                    />
                    <div className="text-4xl font-medium text-blue-50">
                        {weatherData.current.temp_c}°C
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-lg font-bold">
                        {weatherData.forecast.forecastday[0].date}
                    </div>
                    <div className="text-base">
                        {weatherData.location.localtime}
                    </div>
                </div>
            </div>
            <div className="flex w-full flex-wrap content-start justify-between gap-y-2 text-blue-50">
                {weatherData.forecast.forecastday.map((forecast, index) => {
                    const todayBackground = index === 0 ? 'bg-blue-400' : ''
                    return (
                        <div
                            key={forecast.date}
                            className={`flex flex-col items-center rounded-lg px-4 py-2 ${todayBackground}`}
                        >
                            <div className="text-xs">{forecast.date}</div>
                            <div>
                                {forecast.day.maxtemp_c}° ~{' '}
                                {forecast.day.mintemp_c}°
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const WeatherIcon = ({
    localtime,
    weatherCondition,
}: {
    localtime: Date
    weatherCondition: string
}) => {
    let weatherIcon: string
    if (localtime.getUTCHours() < 6 || localtime.getUTCHours() > 18) {
        weatherIcon = '🌙'
    } else {
        weatherIcon = '☀️'
    }
    if (weatherCondition.includes('rain')) {
        weatherIcon = '🌧️'
    } else if (weatherCondition.includes('cloud')) {
        weatherIcon = '☁️'
    } else if (weatherCondition.includes('snow')) {
        weatherIcon = '❄️'
    }
    return <div className="text-4xl">{weatherIcon}</div>
}

const SearchItem = ({ length }: { length: number }) => {
    return (
        <p className="pl-12 text-base font-bold italic text-gray-600">
            {length} results were found.
        </p>
    )
}

export default ToolcallItem
