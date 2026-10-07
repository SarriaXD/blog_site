import { Message, WeatherData } from '@lib/types/chat.ts'

const ToolcallItem = (message: Message) => {
    if (message.toolResults?.toolName == 'getWeatherInformation') {
        return (
            <WeatherInformationItem
                {...(message.toolResults.result as WeatherData)}
            />
        )
    } else if (message.toolResults?.toolName == 'search') {
        return (
            <SearchItem
                {...(message.toolResults.result as {
                    length: number
                })}
            />
        )
    }
}

const WeatherInformationItem = (weatherData: WeatherData) => {
    return (
        <div className="flex flex-col gap-4 rounded-[22px] border border-white/20 bg-[linear-gradient(145deg,rgba(80,170,255,0.65)_0%,rgba(60,90,255,0.6)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_16px_36px_-20px_rgba(40,110,255,0.9)]">
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
                    const todayBackground =
                        index === 0
                            ? 'bg-white/22 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]'
                            : ''
                    return (
                        <div
                            key={forecast.date}
                            className={`flex flex-col items-center rounded-xl px-4 py-2 ${todayBackground}`}
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
        <p className="pl-12 text-base font-semibold text-white/45 italic">
            {length} results were found.
        </p>
    )
}

export default ToolcallItem
