import SyntaxHighlighter from 'react-syntax-highlighter'
import CopyButton from './CopyButton'
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs'

type Props = {
    code: string
    language: string
}

const CodeBlock = ({ code, language }: Props) => {
    return (
        <div className="relative">
            <SyntaxHighlighter
                children={code}
                language={language}
                style={vs2015}
                wrapLines={true}
                wrapLongLines={true}
                customStyle={{
                    backgroundColor: 'transparent',
                    fontSize: '100%',
                }}
            />
            <CopyButton code={code} />
        </div>
    )
}

export default CodeBlock
