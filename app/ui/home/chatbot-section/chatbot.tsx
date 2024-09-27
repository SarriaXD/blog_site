import ChatHeader from '@ui/home/chatbot-section/chat-header.tsx'
import ChatSidebar from '@ui/home/chatbot-section/chat-side-bar.tsx'
import { MotionValue, useTransform } from 'framer-motion'
import ChatTextfield from '@ui/home/chatbot-section/chat-textfield.tsx'
import ChatList from '@ui/home/chatbot-section/chat-list.tsx'
import { motion } from 'framer-motion'

const Chatbot = ({ progress }: { progress: MotionValue<number> }) => {
    const rotateY = useTransform(progress, [0, 0.1], [24, 0])
    return (
        <div
            className="size-full"
            style={{
                perspective: '1600px',
            }}
        >
            <motion.div
                className="flex size-full rounded-xl bg-gray-900"
                style={{
                    rotateY,
                    transformStyle: 'preserve-3d',
                }}
            >
                <ChatSidebar progress={progress} />
                <div
                    className="flex h-full flex-1 flex-col"
                    style={{
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <ChatHeader />
                    <div
                        className="min-h-0 flex-1"
                        style={{
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        <ChatList progress={progress} />
                    </div>
                    <ChatTextfield />
                </div>
            </motion.div>
        </div>
    )
}

export default Chatbot
