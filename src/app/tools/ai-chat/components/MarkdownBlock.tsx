import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import CodeBlock from './CodeBlock.tsx'
import 'github-markdown-css/github-markdown.css'

interface MarkdownBlockProps {
    markdown: string
}

const MarkdownBlock = ({ markdown }: MarkdownBlockProps) => {
    return (
        <Markdown
            className="markdown-body p-4 md:p-8 xl:p-12"
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

export default MarkdownBlock
