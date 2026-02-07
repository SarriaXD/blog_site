import UserItem from '@app/_components/sections/chatbot-section/message-item/message-user-item.tsx'
import ToolcallItem from '@app/_components/sections/chatbot-section/message-item/message-toolcall-item.tsx'
import AssistantItem from '@app/_components/sections/chatbot-section/message-item/message-assistant-item.tsx'
import { Message } from '@lib/types/chat.ts'

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
