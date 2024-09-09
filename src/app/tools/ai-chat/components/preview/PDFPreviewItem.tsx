import { Close } from '@public/icons'
import React from 'react'

interface PDFPreviewItemProps {
    url: string
    name: string
    isUploading: boolean
    onPDFRemove: (name: string, url: string) => void
}

const PDFPreviewItem = ({
    url,
    name,
    isUploading,
    onPDFRemove,
}: PDFPreviewItemProps) => {
    return (
        <div className="relative flex size-24 items-center justify-center rounded-2xl bg-white">
            <span className="px-2 text-center text-[14px] font-extrabold tracking-tighter text-blue-600">
                {name.endsWith('.pdf') ? name.slice(0, -4) : name}
            </span>
            <span className="absolute -bottom-2 rounded bg-blue-700 px-2 text-[14px] font-extrabold tracking-tighter">
                PDF
            </span>
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#212121] bg-opacity-50">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-l-2 border-r-2 border-t-4 border-[#676767]" />
                </div>
            )}
            <button
                onClick={() => onPDFRemove(name, url)}
                type={'button'}
                className="absolute right-0 top-0 size-5 -translate-y-1 translate-x-1 rounded-full bg-[#676767] p-[5px]"
            >
                <Close className="size-full text-[#2F2F2F]" />
            </button>
        </div>
    )
}

export default PDFPreviewItem
