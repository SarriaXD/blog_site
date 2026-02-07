'use client'

import ChatbotTitle from '@app/_components/sections/chatbot-section/chatbot-title.tsx'
import Chatbot from '@app/_components/sections/chatbot-section/chatbot.tsx'
import { useScroll } from 'framer-motion'
import { useRef, useState } from 'react'
import ChatIntroduction from '@app/_components/sections/chatbot-section/chat-introduction.tsx'
import ExploreStickyButton from '@components/ui/ExploreStickeyButton.tsx'
import { Container, Section } from '@components/ui/ui-kit.tsx'

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
        <Section className="py-16 md:py-24">
            <Container className="max-w-[1200px]">
                <ChatbotTitle />
                <div ref={ref} className="mt-8 h-[500vh] md:mt-16">
                    <div className="app-sticky-offset sticky w-full pb-12 pt-8 md:pb-20 md:pt-12">
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
            </Container>
        </Section>
    )
}

export default ChatbotSection
