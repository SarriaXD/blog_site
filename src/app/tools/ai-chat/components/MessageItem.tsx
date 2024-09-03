import MarkdownBlock from './MarkdownBlock.tsx'
import { Message } from 'ai'
import ThreeDotsLoading from './ThreeDotsLoading.tsx'
import { Dog } from '@public/icons'

interface MessageProps {
    message: Message
    isLoading: boolean
    isLast: boolean
}

const MessageItem = ({ message, isLoading, isLast }: MessageProps) => {
    const { role, content } = message
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="rounded-[20px] bg-[#2F2F2F] px-4 py-2">
                    <p className="text-base text-white">{content}</p>
                </div>
            </div>
        )
    } else if (role === 'assistant') {
        return (
            <div className="flex gap-4">
                <div className="self-start rounded-full bg-gray-300 p-2 text-black">
                    <Dog className="size-6" />
                </div>
                <div className="flex-1">
                    <MarkdownBlock markdown={content} />
                    {isLoading && isLast && ThreeDotsLoading()}
                </div>
            </div>
        )
    } else {
        return <></>
    }
}

export default MessageItem
