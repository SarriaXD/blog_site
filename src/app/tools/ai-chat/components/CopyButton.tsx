'use client'

import * as React from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Copy } from '@public/icons'

type Props = {
    code: string
}

const CopyButton = ({ code }: Props) => {
    const first2Line = code.split('\n').slice(0, 2)
    return (
        <button className="absolute right-4 top-2 cursor-pointer">
            <CopyToClipboard
                text={code}
                onCopy={() => alert(`Copied! ${first2Line}....`)}
            >
                <Copy className={'size-5'} />
            </CopyToClipboard>
        </button>
    )
}

export default CopyButton
