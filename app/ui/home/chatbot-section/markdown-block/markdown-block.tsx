import Markdown from 'react-markdown'
import 'github-markdown-css/github-markdown.css'
import { ImgHTMLAttributes, memo } from 'react'

interface MarkdownBlockProps {
    markdown: string
}

const MarkdownBlock = ({ markdown }: MarkdownBlockProps) => {
    return (
        <div className="markdown-body !bg-transparent !font-normal !text-[#ECECEC]">
            <MessageMarkdownMemoized
                components={{
                    pre({ children }) {
                        return (
                            <pre className={'!bg-transparent !p-0'}>
                                {children}
                            </pre>
                        )
                    },
                    a({ children }) {
                        return (
                            <span className="text-blue-400 underline">
                                {children}
                            </span>
                        )
                    },
                    img(props: ImgHTMLAttributes<HTMLImageElement>) {
                        return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={props.src!}
                                alt={props.alt!}
                                className={'rounded-xl'}
                            />
                        )
                    },
                }}
            >
                {markdown}
            </MessageMarkdownMemoized>
        </div>
    )
}

export const MessageMarkdownMemoized = memo(
    Markdown,
    (prevProps, nextProps) => prevProps.children === nextProps.children
)

export default MarkdownBlock
