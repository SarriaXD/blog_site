'use client'

import ChatbotTitle from '@ui/home/chatbot-section/chatbot-title.tsx'
import Chatbot from '@ui/home/chatbot-section/chatbot.tsx'
import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import ChatIntroduction from '@ui/home/chatbot-section/chat-introduction.tsx'

const ChatbotSection = () => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    })
    return (
        <section className="mx-auto max-w-[1200px] px-4">
            <ChatbotTitle />
            <div ref={ref} className="h-[500vh]">
                <div className="sticky top-0 h-screen w-full py-24">
                    <div className="flex size-full flex-col-reverse items-center justify-center gap-2 md:flex-row md:gap-8">
                        <div className="min-h-0 flex-1 md:h-full">
                            <Chatbot progress={progress} />
                        </div>
                        <ChatIntroduction progress={progress} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ChatbotSection
