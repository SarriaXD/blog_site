import { FormEvent } from 'react'

interface ChatTextFieldProps {
    value: string
    isLoading: boolean
    onMessageChange: (message: string) => void
    onSubmit: (e: FormEvent) => void
}

const ChatTextField = ({
    value,
    isLoading,
    onMessageChange,
    onSubmit,
}: ChatTextFieldProps) => {
    return (
        <form
            className="flex items-center justify-between rounded-full border border-white bg-[#0D1116] p-4"
            onSubmit={onSubmit}
        >
            <input
                type="text"
                value={value}
                onChange={(e) => onMessageChange(e.target.value)}
                className="w-full border-none bg-transparent p-2 text-white outline-none"
                placeholder="Type a message"
            />
            <button
                type="submit"
                className="rounded-md bg-[#1E242B] p-2 text-white"
                disabled={isLoading}
            >
                Send
            </button>
        </form>
    )
}

export default ChatTextField
