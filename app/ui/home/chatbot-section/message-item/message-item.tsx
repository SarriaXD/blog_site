import UserItem from '@ui/home/chatbot-section/message-item/message-user-item.tsx'
import ToolcallItem, {
    WeatherData,
} from '@ui/home/chatbot-section/message-item/message-toolcall-item.tsx'
import AssistantItem from '@ui/home/chatbot-section/message-item/message-assistant-item.tsx'
import { StaticImageData } from 'next/image'

export interface Message {
    id: string
    role: 'user' | 'assistant' | 'tools'
    content: string
    images?: StaticImageData[]
    files?: {
        name: string
        extension: string
    }[]
    toolResults?: {
        toolName: string
        result:
            | WeatherData
            | {
                  length: number
              }
    }
}

const MessageItem = (message: Message) => {
    const { role } = message
    if (role === 'user') {
        return <UserItem {...message} />
    } else if (role === 'assistant') {
        return <AssistantItem {...message} />
    } else if (role === 'tools') {
        return <ToolcallItem {...message} />
    }
}

export default MessageItem
