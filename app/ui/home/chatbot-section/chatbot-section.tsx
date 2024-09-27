'use client'

import ChatbotTitle from '@ui/home/chatbot-section/chatbot-title.tsx'
import Chatbot from '@ui/home/chatbot-section/chatbot.tsx'
import { useScroll } from 'framer-motion'
import { useRef } from 'react'

const ChatbotSection = () => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    })
    return (
        <section className="mx-auto max-w-[900px] px-4">
            <ChatbotTitle />
            <div ref={ref} className="h-[500vh]">
                <div className="sticky top-0 h-screen w-full pb-[20vh] pt-32">
                    <Chatbot progress={progress} />
                </div>
            </div>
        </section>
    )
}

export default ChatbotSection
