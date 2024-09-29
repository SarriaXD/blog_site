import ChatHeader from '@ui/home/chatbot-section/chat-header.tsx'
import ChatSidebar from '@ui/home/chatbot-section/chat-side-bar.tsx'
import { MotionValue } from 'framer-motion'
import ChatTextfield from '@ui/home/chatbot-section/chat-textfield.tsx'
import ChatList from '@ui/home/chatbot-section/chat-list.tsx'
import { motion } from 'framer-motion'
import { useState } from 'react'

const Chatbot = ({ progress }: { progress: MotionValue<number> }) => {
    const [inView, setInView] = useState(false)
    progress.on('change', (latest) => {
        setInView(latest > 0 && latest < 1)
    })
    return (
        <motion.div
            className="size-full"
            initial={{
                opacity: 0,
                translateY: '50%',
            }}
            whileInView={{
                opacity: 1,
                translateY: 0,
            }}
            transition={{
                type: 'tween',
                duration: 0.5,
            }}
            style={{
                perspective: '800px',
            }}
        >
            <motion.div
                className="flex size-full rounded-xl bg-gray-900"
                animate={{
                    rotateY: inView ? 0 : 30,
                }}
                transition={{
                    type: 'tween',
                    duration: 0.5,
                    delay: 0.3,
                }}
                style={{
                    transformOrigin: '25% 50%',
                    transformStyle: 'preserve-3d',
                }}
            >
                <motion.div
                    animate={{
                        translateZ: inView ? 0 : 100,
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
                        className="min-h-0 flex-1"
                        animate={{
                            translateZ: inView ? 0 : 120,
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
        </motion.div>
    )
}

export default Chatbot
