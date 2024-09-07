import MarkdownBlock from './MarkdownBlock.tsx'
import { Message, ToolInvocation } from 'ai'
import { Dog } from '@public/icons'
import { WeatherData } from '@utils/weather-utils.ts'

interface MessageProps {
    message: Message
    isLoading: boolean
    isLast: boolean
}

const MessageItem = (props: MessageProps) => {
    const { message } = props
    const { role } = message
    if (role === 'user') {
        return <UserItem {...props} />
    } else if (role === 'assistant') {
        if (message.toolInvocations && message.toolInvocations.length > 0) {
            return (
                <div>
                    {message.toolInvocations.map((toolInvocation) => (
                        <ToolcallItem
                            key={toolInvocation.toolCallId}
                            toolInvocation={toolInvocation}
                        />
                    ))}
                </div>
            )
        } else {
            return <AssistantItem {...props} />
        }
    }
}

const UserItem = ({ message }: MessageProps) => {
    const imageAttachments = message.experimental_attachments?.filter(
        (attachment) => attachment?.contentType?.startsWith('image/')
    )
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <div className="rounded-[20px] bg-[#2F2F2F] px-4 py-2 text-base text-white">
                    {message.content}
                </div>
            </div>
            {imageAttachments && (
                <div className="flex justify-end gap-4">
                    {imageAttachments.map((attachment, index) => (
                        <div
                            key={`${message.id}-${index}`}
                            className="relative h-80 overflow-hidden rounded-lg"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element*/}
                            <img
                                src={attachment.url}
                                alt={attachment.name || 'user image'}
                                className={'h-full w-auto'}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const AssistantItem = ({ message }: MessageProps) => {
    return (
        <div className="flex flex-col gap-4 md:flex-row">
            <div className="self-start rounded-full bg-gray-300 p-2 text-black">
                <Dog className="size-6" />
            </div>
            <div className="flex-1">
                <MarkdownBlock markdown={message.content} />
            </div>
        </div>
    )
}

interface ToolcallItemProps {
    toolInvocation: ToolInvocation
}

const ToolcallItem = ({ toolInvocation }: ToolcallItemProps) => {
    if (toolInvocation.toolName == 'getWeatherInformation') {
        return <WeatherInformationItem toolInvocation={toolInvocation} />
    } else if (toolInvocation.toolName == 'search') {
        return <SearchItem toolInvocation={toolInvocation} />
    }
}

const WeatherInformationItem = ({ toolInvocation }: ToolcallItemProps) => {
    if ('result' in toolInvocation) {
        const result = toolInvocation.result as WeatherData
        if (result.location.name === 'notfound') {
            return null
        }
        return (
            <div
                key={toolInvocation.toolCallId}
                className="flex flex-col gap-4 rounded-lg bg-blue-700 p-4"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-amber-400" />
                        <div className="text-4xl font-medium text-blue-50">
                            {result.current.temp_c}°C
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-lg font-bold">
                            {result.forecast.forecastday[0].date}
                        </div>
                        <div className="text-base">
                            {result.location.localtime}
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-wrap content-start justify-between gap-y-2 text-blue-50">
                    {result.forecast.forecastday.map((forecast, index) => {
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
    } else {
        return <WeatherSkeleton />
    }
}

const WeatherSkeleton = () => {
    return (
        <div className="w-full rounded-lg bg-blue-600 p-4">
            <div className="flex animate-pulse space-x-4">
                <div className="flex-1 space-y-3 py-1">
                    <div className="h-2 rounded bg-blue-300"></div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 h-2 rounded bg-blue-300" />
                            <div className="col-span-1 h-2 rounded bg-blue-200" />
                        </div>
                        <div className="h-2 rounded bg-blue-100"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SearchItem = ({ toolInvocation }: ToolcallItemProps) => {
    if ('result' in toolInvocation) {
        return null
    } else {
        return (
            <div
                key={toolInvocation.toolCallId}
                className="flex justify-start pl-10"
            >
                <div className="rounded-[20px] bg-[#2F2F2F] px-4 py-2">
                    <p className="animate-pulse text-lg font-bold italic text-white">
                        Searching {toolInvocation.args.query}
                    </p>
                </div>
            </div>
        )
    }
}

export default MessageItem
