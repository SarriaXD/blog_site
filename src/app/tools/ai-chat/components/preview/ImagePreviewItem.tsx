import { Close } from '@public/icons'
import React from 'react'

interface ImagePreviewItemProps {
    previewUrl: string
    url: string
    name: string
    isUploading: boolean
    onImageRemove: (name: string, url: string) => void
}

const ImagePreviewItem = ({
    previewUrl,
    url,
    name,
    isUploading,
    onImageRemove,
}: ImagePreviewItemProps) => {
    return (
        <div key={name} className="relative size-24">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={previewUrl}
                className="size-full rounded-2xl border-[3px] border-[#676767] object-cover"
                alt={name}
                onLoad={() => {
                    URL.revokeObjectURL(previewUrl)
                }}
            />
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[#212121] bg-opacity-50">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-l-2 border-r-2 border-t-4 border-[#676767]" />
                </div>
            )}
            <button
                onClick={() => onImageRemove(name, url)}
                type={'button'}
                className="absolute right-0 top-0 size-5 -translate-y-1 translate-x-1 rounded-full bg-[#676767] p-[5px]"
            >
                <Close className="size-full text-[#2F2F2F]" />
            </button>
        </div>
    )
}

export default ImagePreviewItem
