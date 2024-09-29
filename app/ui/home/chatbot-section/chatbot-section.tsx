'use client'

import ChatbotTitle from '@ui/home/chatbot-section/chatbot-title.tsx'
import Chatbot from '@ui/home/chatbot-section/chatbot.tsx'
import { useScroll } from 'framer-motion'
import { useRef } from 'react'
import ChatIntroduction from '@ui/home/chatbot-section/chat-introduction.tsx'
import ExploreStickyButton from '@ui/ExploreStickeyButton.tsx'
import { motion } from 'framer-motion'

const ChatbotSection = () => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    })
    return (
        <section className="mx-auto max-w-[1200px] py-4">
            <ChatbotTitle />
            <div ref={ref} className="h-[500vh]">
                <div className="sticky top-0 h-screen w-full pb-24 pt-[70px]">
                    <ExploreStickyButton
                        href={'https://github.com/SarriaXD/ai-chatbot'}
                    />
                    <motion.div
                        initial={{
                            opacity: 0,
                            translateY: '30%',
                        }}
                        whileInView={{
                            opacity: 1,
                            translateY: 0,
                        }}
                        transition={{
                            type: 'tween',
                            duration: 0.5,
                        }}
                        className="flex size-full flex-col-reverse items-center justify-center gap-4 px-4 md:flex-row md:gap-8 md:px-0"
                    >
                        <div className="min-h-0 flex-1 md:h-full">
                            <Chatbot progress={progress} />
                        </div>
                        <ChatIntroduction progress={progress} />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

export default ChatbotSection
