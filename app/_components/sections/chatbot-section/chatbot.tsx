import ChatHeader from '@app/_components/sections/chatbot-section/chat-header.tsx'
import ChatSidebar from '@app/_components/sections/chatbot-section/chat-side-bar.tsx'
import { MotionValue } from 'framer-motion'
import ChatTextfield from '@app/_components/sections/chatbot-section/chat-textfield.tsx'
import ChatList from '@app/_components/sections/chatbot-section/chat-list.tsx'
import { motion } from 'framer-motion'

interface ChatbotProps {
    progress: MotionValue<number>
    inView: boolean
}

const Chatbot = ({ progress, inView }: ChatbotProps) => {
    return (
        <div
            className="size-full"
            style={{
                perspective: '800px',
            }}
        >
            <motion.div
                className="flex size-full rounded-xl bg-gray-900"
                animate={{
                    rotateY: inView ? 0 : 45,
                }}
                transition={{
                    type: 'tween',
                    duration: 0.5,
                    delay: 0.3,
                }}
                style={{
                    transformStyle: 'preserve-3d',
                }}
            >
                <motion.div
                    animate={{
                        translateZ: inView ? 0 : 50,
                    }}
                    transition={{
                        type: 'tween',
                        duration: 0.5,
                    }}
                >
                    <ChatSidebar progress={progress} />
                </motion.div>
                <div
                    className="flex h-full flex-1 flex-col"
                    style={{
                        transformStyle: 'preserve-3d',
                    }}
                >
                    <ChatHeader />
                    <motion.div
                        className="flex-1 overflow-hidden"
                        animate={{
                            translateZ: inView ? 0 : 100,
                        }}
                        transition={{
                            type: 'tween',
                            duration: 0.5,
                        }}
                    >
                        <ChatList progress={progress} />
                    </motion.div>
                    <ChatTextfield />
                </div>
            </motion.div>
        </div>
    )
}

export default Chatbot
