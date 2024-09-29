import {
    modalMessages,
    searchMessages,
    weatherMessages,
} from '@lib/data/ai-chatbot-data.ts'
import { AnimatePresence, MotionValue } from 'framer-motion'
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
    return { messages: messagesTypes[index], index }
}

const ChatList = ({ progress }: ChatListProps) => {
    const { messages, index } = useMessages(progress)
    return (
        <AnimatePresence initial={false} mode="wait">
            <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex max-w-[800px] flex-col gap-4 px-4"
            >
                {messages.map((message) => (
                    <MessageItem key={message.id} {...message} />
                ))}
            </motion.div>
        </AnimatePresence>
    )
}

export default ChatList
