import { motion } from 'framer-motion'

const ThreeDotsLoading = () => {
    return (
        <div className="flex items-center space-x-1">
            <motion.span
                animate={{
                    y: ['30%', '-30%'],
                }}
                className="size-3 rounded-full bg-white"
                transition={{
                    type: 'tween',
                    tween: 'linear',
                    repeat: Infinity,
                    duration: 0.6,
                    repeatType: 'reverse',
                }}
            />
            <motion.span
                animate={{
                    y: ['30%', '-30%'],
                }}
                className="size-3 rounded-full bg-white"
                transition={{
                    repeat: Infinity,
                    tween: 'linear',
                    delay: 0.2,
                    duration: 0.6,
                    repeatType: 'reverse',
                }}
            />
            <motion.span
                animate={{
                    y: ['30%', '-30%'],
                }}
                className="size-3 rounded-full bg-white"
                transition={{
                    repeat: Infinity,
                    tween: 'linear',
                    delay: 0.4,
                    duration: 0.6,
                    repeatType: 'reverse',
                }}
            />
        </div>
    )
}

export default ThreeDotsLoading
