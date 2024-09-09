import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import CodeBlock from './CodeBlock.tsx'
import 'github-markdown-css/github-markdown.css'
import { ImgHTMLAttributes, memo } from 'react'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'

interface MarkdownBlockProps {
    markdown: string
}

const MarkdownBlock = ({ markdown }: MarkdownBlockProps) => {
    return (
        <MessageMarkdownMemoized
            className="markdown-body !bg-transparent py-2 !font-semibold !text-white"
            children={markdown}
            rehypePlugins={[
                [rehypeExternalLinks, { target: '_blank' }],
                [rehypeKatex],
            ]}
            remarkPlugins={[remarkGfm, remarkMath]}
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
                img(props: ImgHTMLAttributes<HTMLImageElement>) {
                    return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            {...props}
                            className="my-2 rounded-lg !bg-transparent"
                        />
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
