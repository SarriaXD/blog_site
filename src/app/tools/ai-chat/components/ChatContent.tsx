import 'github-markdown-css/github-markdown.css'
import MarkdownBlock from './MarkdownBlock.tsx'
import aiGeneratedData from '../fakedata/aiGeneratedData.ts'

const ChatContent = () => {
    return (
        <div>
            <MarkdownBlock markdown={aiGeneratedData} />
        </div>
    )
}

export default ChatContent
