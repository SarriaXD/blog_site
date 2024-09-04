'use client'

import MessageList from './MessageList.tsx'
import { useChat } from 'ai/react'
import { useChatScroll } from '../hooks/useChatScroll.ts'
import ChatPanel from './ChatPanel.tsx'
import { FormEvent } from 'react'
import { Message } from 'ai'
import EmptyMessagePlaceholder from './EmptyMessagePlaceholder.tsx'

const createPlaceholderMessages = (content: string): Message[] => {
    return [
        { id: 'temp_user', role: 'user', content: content },
        { id: 'temp_assistant', role: 'assistant', content: '' },
    ]
}

const ChatContent = () => {
    const {
        messages,
        setMessages,
        input,
        isLoading,
        handleSubmit,
        setInput,
        stop,
    } = useChat({
        maxToolRoundtrips: 5,
        streamProtocol: 'text',
    })
    const { scrollRef } = useChatScroll(messages, isLoading)
    const handleSubmitWrapper = (e: FormEvent) => {
        handleSubmit(e)
        const placeholderMessages = createPlaceholderMessages(input)
        setMessages((prev) => [...prev, ...placeholderMessages])
    }
    return (
        <div className="h-full w-full overflow-auto" ref={scrollRef}>
            <div className="px-8 pb-32 pt-24">
                {messages.length ? (
                    <MessageList messages={messages} isLoading={isLoading} />
                ) : (
                    <EmptyMessagePlaceholder />
                )}
            </div>
            <div className="h-px w-full" />
            <ChatPanel
                value={input}
                isLoading={isLoading}
                onSubmit={handleSubmitWrapper}
                onMessageChange={setInput}
                onStop={stop}
            />
        </div>
    )
}

export default ChatContent
