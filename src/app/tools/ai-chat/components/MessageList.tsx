import MessageItem from './MessageItem.tsx'
import { Message } from 'ai'
import ThreeDotsLoading from './ThreeDotsLoading.tsx'

interface MessageListProps {
    messages: Message[]
    isLoading: boolean
}

const MessageList = ({ messages, isLoading }: MessageListProps) => {
    return (
        <div className="mx-auto flex max-w-[800px] flex-col gap-4">
            {messages.map((message, index) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    isLoading={isLoading}
                    isLast={index === messages.length - 1}
                />
            ))}
            {isLoading && (
                <div className="ml-14 flex justify-start">
                    <ThreeDotsLoading />
                </div>
            )}
        </div>
    )
}

export default MessageList
