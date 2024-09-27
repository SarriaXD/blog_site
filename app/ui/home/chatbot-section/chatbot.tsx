import ChatHeader from '@ui/home/chatbot-section/chat-header.tsx'
import ChatSidebar from '@ui/home/chatbot-section/chat-side-bar.tsx'
import { MotionValue } from 'framer-motion'
import ChatTextfield from '@ui/home/chatbot-section/chat-textfield.tsx'
import ChatList from '@ui/home/chatbot-section/chat-list.tsx'

const Chatbot = ({ progress }: { progress: MotionValue<number> }) => {
    return (
        <div className="flex size-full overflow-hidden rounded-xl bg-gray-900">
            <ChatSidebar progress={progress} />
            <div className="flex h-full flex-1 flex-col overflow-hidden">
                <ChatHeader />
                <div className="flex-1">
                    <ChatList />
                </div>
                <ChatTextfield />
            </div>
        </div>
    )
}

export default Chatbot
