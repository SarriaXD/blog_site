import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock.tsx'
import 'github-markdown-css/github-markdown.css'
import { memo } from 'react'

interface MarkdownBlockProps {
    markdown: string
}

const MarkdownBlock = ({ markdown }: MarkdownBlockProps) => {
    return (
        <MessageMarkdownMemoized
            className="markdown-body !bg-transparent py-2 !font-semibold"
            children={markdown}
            remarkPlugins={[remarkGfm]}
            components={{
                code(props) {
                    const { children, className, ...rest } = props
                    const match = /language-(\w+)/.exec(className || '')
                    return match ? (
                        <CodeBlock
                            code={String(children).replace(/\n$/, '')}
                            language={match[1]}
                        />
                    ) : (
                        <code {...rest} className={className}>
                            {children}
                        </code>
                    )
                },
            }}
        />
    )
}

export const MessageMarkdownMemoized = memo(
    Markdown,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.className === nextProps.className
)

export default MarkdownBlock
