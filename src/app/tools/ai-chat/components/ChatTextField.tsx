import { FormEvent } from 'react'
import { ArrowUp, Record } from '@public/icons'
import { motion } from 'framer-motion'

interface ChatTextFieldProps {
    value: string
    isLoading: boolean
    onMessageChange: (message: string) => void
    onSubmit: (e: FormEvent) => void
    onStop: (e: FormEvent) => void
}

const LoadingThreeDots = () => {
    return (
        <div className="mx-auto flex space-x-1">
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white" />
        </div>
    )
}

const ChatTextField = ({
    value,
    isLoading,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatTextFieldProps) => {
    return (
        <div>
            {isLoading && <LoadingThreeDots />}
            <LoadingThreeDots />
            <form
                className="flex items-center justify-between rounded-full border border-white bg-[#0D1116] p-2"
                onSubmit={onSubmit}
            >
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onMessageChange(e.target.value)}
                    className="w-full border-none bg-transparent p-2 text-white outline-none"
                    placeholder="Type a message"
                />
                {!isLoading && value && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        type="submit"
                        className="rounded-full bg-deep-orange-400 p-2 text-white"
                        disabled={isLoading}
                    >
                        <ArrowUp className="size-6" />
                    </motion.button>
                )}
                {isLoading && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={onStop}
                        className="animate-pulse bg-transparent text-white"
                    >
                        <Record className="size-8 text-white" />
                    </motion.button>
                )}
            </form>
        </div>
    )
}

export default ChatTextField
