import MarkdownBlock from './MarkdownBlock.tsx'

interface MessageProps {
    role: 'user' | 'assistant' | 'system'
    content: string
}

const MessageItem = ({ role, content }: MessageProps) => {
    if (role === 'user') {
        return (
            <div className="flex justify-end">
                <div className="rounded-full bg-[#2F2F2F] px-4 py-2">
                    <p className="text-base text-white">{content}</p>
                </div>
            </div>
        )
    } else if (role === 'assistant') {
        return (
            <div className="flex gap-4">
                <div className="flex size-10 items-center justify-center self-start rounded-full bg-gray-300 text-black">
                    Bot
                </div>
                <div className="flex-1">
                    <MarkdownBlock markdown={content} />
                </div>
            </div>
        )
    } else {
        return <p className="text-center text-lg text-white">{content}</p>
    }
}

export default MessageItem
