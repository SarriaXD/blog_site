import { FormEvent } from 'react'
import ChatTextfield from './ChatTextfield.tsx'

interface ChatPanelProps {
    value: string
    isLoading: boolean
    onMessageChange: (message: string) => void
    onSubmit: (e: FormEvent) => void
    onStop: (e: FormEvent) => void
}

const ChatPanel = ({
    value,
    isLoading,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatPanelProps) => {
    return (
        <div className="fixed inset-x-0 bottom-0 w-full">
            <div className="mx-auto max-w-[800px] px-4">
                <ChatTextfield
                    value={value}
                    isLoading={isLoading}
                    onMessageChange={onMessageChange}
                    onSubmit={onSubmit}
                    onStop={onStop}
                />
            </div>
        </div>
    )
}

export default ChatPanel
