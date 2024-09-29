import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const useTitleAnimation = () => {
    const ref = useRef(null)
    const enterViewport = useInView(ref, {
        once: false,
        margin: '100% 0% -30% 0%',
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
            className={
                'mx-auto flex max-w-[700px] flex-col items-center justify-center gap-4 text-center text-4xl text-[#F5F5F7] md:text-6xl lg:text-8xl'
            }
        >
            <motion.h3
                animate={{
                    opacity: enterViewport ? 1 : 0,
                    y: enterViewport ? 0 : 200,
                }}
                transition={{
                    type: 'tween',
                    duration: 0.5,
                }}
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
            </motion.h3>
            <motion.h4
                animate={{
                    opacity: enterViewport ? 1 : 0,
                    y: enterViewport ? 0 : 200,
                }}
                transition={{
                    type: 'tween',
                    delay: enterViewport ? 0.1 : 0,
                    duration: 0.5,
                }}
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
            </motion.h4>
        </div>
    )
}

export default ChatbotTitle
