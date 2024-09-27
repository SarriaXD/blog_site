import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const useTitleAnimation = () => {
    const ref = useRef(null)
    const enterViewport = useInView(ref, {
        once: false,
        margin: '100% 0% -20% 0%',
    })
    return {
        ref,
        enterViewport,
    }
}

const ChatbotTitle = () => {
    const { ref, enterViewport } = useTitleAnimation()
    return (
        <div
            ref={ref}
            className={'flex flex-col items-center justify-center gap-4'}
        >
            <motion.h3
                animate={{
                    opacity: enterViewport ? 1 : 0,
                    y: enterViewport ? 0 : 50,
                }}
                transition={{
                    type: 'spring',
                    duration: 1,
                }}
                className="text-3xl text-[#86868b] md:text-6xl lg:text-8xl"
            >
                <span
                    className="bg-clip-text text-transparent"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, #e8867c, #f5af19, #f12711)',
                    }}
                >
                    Ask
                </span>{' '}
                me anything.
            </motion.h3>
            <motion.h4
                animate={{
                    opacity: enterViewport ? 1 : 0,
                    y: enterViewport ? 0 : 100,
                }}
                transition={{
                    type: 'spring',
                    delay: enterViewport ? 0.3 : 0,
                    duration: 1,
                }}
                className="text-center text-3xl text-[#F5F5F7] md:text-6xl lg:text-8xl"
            >
                {'The '}
                <span
                    className="bg-clip-text text-transparent"
                    style={{
                        backgroundImage:
                            'linear-gradient(90deg, #e8867c, #f5af19, #f12711)',
                    }}
                >
                    Chatbot
                </span>
                {' I built is here to help you.'}
            </motion.h4>
        </div>
    )
}

export default ChatbotTitle
