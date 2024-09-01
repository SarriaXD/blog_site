import { Message } from './ChatContent.tsx'
import MessageItem from './MessageItem.tsx'

interface MessageListProps {
    messages: Message[]
}

const MessageList = ({ messages }: MessageListProps) => {
    return (
        <div className="flex flex-col gap-4">
            {messages.map((message, index) => (
                <MessageItem key={index} {...message} />
            ))}
        </div>
    )
}

export default MessageList
