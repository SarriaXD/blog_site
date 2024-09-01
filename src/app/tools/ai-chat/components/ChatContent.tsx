'use client'

import MessageList from './MessageList.tsx'
import ChatTextField from './ChatTextField.tsx'
import { useChat } from 'ai/react'
import { useChatScroll } from '../hooks/useChatScroll.ts'

const WelcomeMessage = () => {
    const welcomeMessage = 'Hello, I am Qi! How can I help you today?'
    return (
        <h1 className="text-center text-3xl font-bold text-white">
            {welcomeMessage}
        </h1>
    )
}

const ChatContent = () => {
    const { messages, input, isLoading, handleSubmit, setInput, stop } =
        useChat()
    const { messagesEndRef } = useChatScroll(isLoading, messages)
    return (
        <>
            <div className="mx-auto px-8 md:max-w-[800px]">
                {messages.length > 0 ? (
                    <MessageList messages={messages} />
                ) : (
                    WelcomeMessage()
                )}
            </div>
            <div ref={messagesEndRef} />
            <div className="fixed bottom-0 left-0 right-0 mx-auto px-8 md:max-w-[800px]">
                <ChatTextField
                    value={input}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onMessageChange={setInput}
                    onStop={stop}
                />
            </div>
        </>
    )
}

export default ChatContent
