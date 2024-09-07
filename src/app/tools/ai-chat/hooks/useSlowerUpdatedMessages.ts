import { Message } from 'ai'
import { useCallback, useEffect, useRef, useState } from 'react'

const useSlowerUpdatedMessages = (
    messages: Message[],
    delay: number = 16.67
) => {
    const [slowState, setSlowState] = useState(messages)
    const latestStateRef = useRef(messages)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        latestStateRef.current = messages
    }, [messages])

    const updateSlowState = useCallback(() => {
        setSlowState(latestStateRef.current)
        timeoutRef.current = setTimeout(updateSlowState, delay)
    }, [delay])

    useEffect(() => {
        timeoutRef.current = setTimeout(updateSlowState, delay)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [updateSlowState, delay])

    return slowState
}

export default useSlowerUpdatedMessages
