'use client'

import React, { useState, useEffect, useRef } from 'react'
import MessageList from './MessageList.tsx'
import ChatTextField from './ChatTextField.tsx'

export interface Message {
    role: 'user' | 'assistant' | 'system'
    content: string
}

const ChatContent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'system',
            content: 'Welcome to the AI chat! Ask me anything.',
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage: Message = { role: 'user', content: input }
        const beforeLastMessages =
            messages && messages[0].role == 'system'
                ? [userMessage]
                : [...messages, userMessage]
        setMessages(beforeLastMessages)
        setInput('')
        setIsLoading(true)

        const requestBody = JSON.stringify({
            model: 'llama3.1',
            messages: beforeLastMessages,
            stream: true,
        })
        try {
            const response = await fetch('https://api.sarria.ca/ai-chat/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            })

            if (!response.body) throw new Error('No response body')

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            // const assistantMessage: Message = { role: 'assistant', content: '' }

            let isDone = false
            while (!isDone) {
                const { value, done } = await reader.read()
                isDone = done
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                // const lines = chunk.split('\n')
                //
                // for (const line of lines) {
                //     console.log('Assistant:', lines)
                //     if (line.trim() === '') continue
                //     const parsed = JSON.parse(line)
                //     assistantMessage.content += parsed.message?.content || ''
                //     setMessages([...beforeLastMessages, assistantMessage])
                // }
                console.log('Assistant:', chunk)
                try {
                    // const contentToAdd =
                    chunk
                        .trimEnd()
                        .split('\n')
                        .reduce((acc, line) => {
                            console.log('Assistant:', line)
                            return acc + JSON.parse(line).message.content
                        }, '')
                    // assistantMessage.content += contentToAdd
                    // setMessages([...beforeLastMessages, assistantMessage])
                } catch (error) {
                    console.error('Error parsing JSON:', error)
                }
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <div className="mx-auto min-h-[100vh] px-8 md:max-w-[600px] lg:max-w-[800px]">
                <MessageList messages={messages} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 mx-auto px-8 md:max-w-[600px] lg:max-w-[800px]">
                <ChatTextField
                    value={input}
                    isLoading={isLoading}
                    onSubmit={handleSubmit}
                    onMessageChange={setInput}
                />
            </div>
        </>
    )
}

export default ChatContent
