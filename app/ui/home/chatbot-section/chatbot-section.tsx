'use client'

import ChatbotTitle from '@ui/home/chatbot-section/chatbot-title.tsx'
import Chatbot from '@ui/home/chatbot-section/chatbot.tsx'
import { useScroll } from 'framer-motion'
import { useRef, useState } from 'react'
import ChatIntroduction from '@ui/home/chatbot-section/chat-introduction.tsx'
import ExploreStickyButton from '@ui/ExploreStickeyButton.tsx'

const ChatbotSection = () => {
    const ref = useRef(null)
    const { scrollYProgress: progress } = useScroll({
        target: ref,
        offset: ['start start', 'end end'],
    })
    const [inView, setInView] = useState(false)
    progress.on('change', (latest) => {
        setInView(latest > 0 && latest < 1)
    })
    return (
        <section className="mx-auto mb-24 mt-20 max-w-[1200px]">
            <ChatbotTitle />
            <div ref={ref} className="mt-8 h-[500vh] md:mt-16">
                <div className="sticky top-0 h-screen w-full pb-24 pt-20">
                    <ExploreStickyButton
                        href={'https://github.com/SarriaXD/ai-chatbot'}
                    />
                    <div className="flex size-full flex-col-reverse items-center justify-center gap-8 px-4 md:flex-row md:px-16">
                        <div className="min-h-0 flex-1 md:h-full">
                            <Chatbot progress={progress} inView={inView} />
                        </div>
                        <ChatIntroduction progress={progress} inView={inView} />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ChatbotSection
