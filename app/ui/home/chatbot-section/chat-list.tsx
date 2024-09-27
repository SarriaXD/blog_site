import {
    modalMessages,
    searchMessages,
    weatherMessages,
} from '@lib/data/ai-chatbot-data.ts'
import { MotionValue, useTransform } from 'framer-motion'
import { useMemo, useState } from 'react'
import MessageItem from '@ui/home/chatbot-section/message-item/message-item.tsx'
import { motion } from 'framer-motion'

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
    const translateZ = useTransform(progress, [0, 0.1], [200, 0])
    const translateX = useTransform(progress, [0, 0.1], [-70, 0])
    const messages = useMessages(progress)
    return (
        <motion.div
            className="mx-auto flex size-full max-w-[800px] flex-col gap-4 overflow-hidden rounded-xl bg-gray-900 px-4 opacity-90"
            style={{
                translateZ,
                translateX,
            }}
        >
            {messages.map((message) => (
                <MessageItem key={message.id} {...message} />
            ))}
        </motion.div>
    )
}

export default ChatList
