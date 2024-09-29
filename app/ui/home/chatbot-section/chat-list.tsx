import {
    modalMessages,
    searchMessages,
    weatherMessages,
} from '@lib/data/ai-chatbot-data.ts'
import { MotionValue } from 'framer-motion'
import { useMemo, useState } from 'react'
import MessageItem from '@ui/home/chatbot-section/message-item/message-item.tsx'

interface ChatListProps {
    progress: MotionValue<number>
}

const useMessages = (progress: MotionValue<number>) => {
    const messagesTypes = useMemo(() => {
        return [modalMessages, searchMessages, weatherMessages]
    }, [])
    const [index, setIndex] = useState(0)
    progress.on('change', (latest) => {
        if (latest < 0.33) {
            setIndex(0)
        } else if (latest < 0.66) {
            setIndex(1)
        } else if (latest < 1) {
            setIndex(2)
        }
    })
    return messagesTypes[index]
}

const ChatList = ({ progress }: ChatListProps) => {
    const messages = useMessages(progress)
    return (
        <div className="flex max-w-[800px] flex-col gap-4 px-4">
            {messages.map((message) => (
                <MessageItem key={message.id} {...message} />
            ))}
        </div>
    )
}

export default ChatList
