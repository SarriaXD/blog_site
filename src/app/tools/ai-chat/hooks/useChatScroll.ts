import { useEffect, useRef } from 'react'
import { Message } from 'ai'

export const useChatScroll = (messages: Message[], isLoading: boolean) => {
    const scrollRef = useRef<HTMLDivElement>(null)
    const lastMessage = messages.at(-1)
    const lastMessageContent = lastMessage?.content ?? ''
    useEffect(() => {
        if (isLoading) {
            scrollRef.current?.scrollIntoView({
                block: 'end',
                behavior: 'instant',
            })
        }
    }, [lastMessageContent, isLoading])
    return { scrollRef }
}

export default useChatScroll
