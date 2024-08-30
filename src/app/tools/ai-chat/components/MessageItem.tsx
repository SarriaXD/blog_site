import MarkdownBlock from './MarkdownBlock.tsx'

export interface Message {
    role: 'user' | 'bot'
    content: string
}

const MessageItem = ({ role, content }: Message) => {
    const isUser = role === 'user'
    const avtarStyle = isUser
        ? ' self-star bg-blue-300'
        : 'self-end bg-gray-300'
    return (
        <div className="flex flex-col">
            <div className={`size-6 rounded ${avtarStyle}`} />
            <MarkdownBlock markdown={content} />
        </div>
    )
}

export default MessageItem
