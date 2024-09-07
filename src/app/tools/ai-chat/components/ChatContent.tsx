'use client'

import MessageList from './MessageList.tsx'
import { useChat } from 'ai/react'
import { useChatScroll } from '../hooks/useChatScroll.ts'
import ChatPanel from './ChatPanel.tsx'
import EmptyMessagePlaceholder from './EmptyMessagePlaceholder.tsx'

export type HandleSubmit = (
    event?: {
        preventDefault?: () => void
    },
    chatRequestOptions?: {
        experimental_attachments?: Array<{
            url: string
            name: string
            contentType: string
        }>
    }
) => void

const ChatContent = () => {
    const { messages, input, isLoading, handleSubmit, setInput, stop } =
        useChat({
            maxToolRoundtrips: 5,
        })
    const { scrollRef } = useChatScroll(messages, isLoading)
    return (
        <div className="size-full overflow-auto" ref={scrollRef}>
            {messages && messages.length > 0 && (
                <div className="px-8 pb-32 pt-24">
                    <div>
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                        />
                        <div className="h-px w-full" />
                    </div>
                </div>
            )}
            {(!messages || messages.length === 0) && (
                <EmptyMessagePlaceholder />
            )}
            <ChatPanel
                value={input}
                isLoading={isLoading}
                onSubmit={handleSubmit}
                onMessageChange={setInput}
                onStop={stop}
            />
        </div>
    )
}

export default ChatContent
