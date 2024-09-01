import MessageItem from './MessageItem.tsx'
import { Message } from 'ai'

interface MessageListProps {
    messages: Message[]
}

const MessageList = ({ messages }: MessageListProps) => {
    return (
        <div className="flex flex-col gap-4">
            {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
            ))}
        </div>
    )
}

export default MessageList
