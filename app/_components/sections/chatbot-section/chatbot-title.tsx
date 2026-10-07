import { motion } from 'framer-motion'

const ChatbotTitle = () => {
    return (
        <div
            className={
                'mx-auto flex max-w-[700px] flex-col items-center justify-center gap-4 text-center text-4xl text-[var(--ui-text-primary)] md:text-6xl lg:text-8xl'
            }
        >
            <motion.h3
                initial={{
                    opacity: 0,
                    y: '100%',
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    margin: '100% 0% 0% 0%',
                }}
                transition={{
                    type: 'tween',
                    duration: 0.5,
                }}
            >
                {'The '}
                <span className="text-gradient-warm">Chatbot</span>
                {' I built is here to help you.'}
            </motion.h3>
        </div>
    )
}

export default ChatbotTitle
