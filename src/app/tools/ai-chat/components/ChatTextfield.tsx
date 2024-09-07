import React, { FormEvent } from 'react'
import { ArrowUp, Close, FileUpload, Record } from '@public/icons'

interface ChatTextFieldProps {
    value: string
    isLoading: boolean
    filesState: FilesState
    onFilesLoad: (files: File[]) => void
    onFileRemove: (name: string, url: string) => void
    onOpenFile: () => void
    onMessageChange: (message: string) => void
    onSubmit: (event: FormEvent) => void
    onStop: (e: FormEvent) => void
}

export interface FilesState {
    isUploading: boolean
    images: {
        url: string
        previewUrl: string
        name: string
        contentType: string
    }[]
}

const ChatTextfield = ({
    value,
    isLoading,
    filesState,
    onFilesLoad,
    onFileRemove,
    onOpenFile,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatTextFieldProps) => {
    return (
        <div className="flex flex-col gap-4 rounded-[28px] bg-[#2F2F2F] py-2 pl-6 pr-2">
            <ImagesPreview
                filesState={filesState}
                onImageRemove={onFileRemove}
            />
            <InnerTextfield
                value={value}
                isLoading={isLoading}
                filesState={filesState}
                onFilesLoad={onFilesLoad}
                onFileRemove={onFileRemove}
                onOpenFile={onOpenFile}
                onMessageChange={onMessageChange}
                onSubmit={onSubmit}
                onStop={onStop}
            />
        </div>
    )
}

interface InnerTextfieldProps {
    value: string
    isLoading: boolean
    filesState: FilesState
    onFilesLoad: (files: File[]) => void
    onFileRemove: (name: string, url: string) => void
    onMessageChange: (message: string) => void
    onOpenFile: () => void
    onSubmit: (event: FormEvent) => void
    onStop: (e: FormEvent) => void
}

const InnerTextfield = ({
    value,
    isLoading,
    filesState,
    onFilesLoad,
    onMessageChange,
    onOpenFile,
    onSubmit,
    onStop,
}: InnerTextfieldProps) => {
    const { isUploading } = filesState
    return (
        <form
            className="flex items-center gap-4"
            onSubmit={async (event) => {
                event.preventDefault()
                if (isUploading && !value) {
                    return
                }
                onSubmit(event)
            }}
            onPaste={(event) => {
                const items = event.clipboardData?.items
                if (!items || items.length === 0) {
                    return
                }
                const allowedImageTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                ]
                const files: File[] = []
                for (let i = 0; i < items.length; i++) {
                    const item = items[i]
                    if (item.kind === 'file') {
                        event.preventDefault()
                    }
                    if (allowedImageTypes.includes(item.type)) {
                        const file = item.getAsFile()
                        if (file) {
                            files.push(file)
                        }
                    }
                }
                if (files.length > 0) {
                    onFilesLoad(files)
                }
            }}
        >
            <ImageUploadButton onClick={onOpenFile} />
            <input
                type="text"
                value={value}
                onChange={(e) => onMessageChange(e.target.value)}
                className="flex-1 border-none bg-transparent p-2 text-white outline-none"
                placeholder="Type a message"
            />
            {!isLoading && (
                <button
                    type="submit"
                    className={`rounded-full p-2 text-[#2F2F2F] ${value && !isUploading ? 'bg-white' : 'bg-[#676767]'}`}
                    disabled={isUploading}
                >
                    <ArrowUp className="size-5" />
                </button>
            )}
            {isLoading && (
                <button
                    onClick={onStop}
                    className="animate-pulse rounded-full bg-[#676767]  p-2 text-white"
                >
                    <Record className="size-5 text-white" />
                </button>
            )}
        </form>
    )
}

const ImagesPreview = ({
    filesState,
    onImageRemove,
}: {
    filesState: FilesState
    onImageRemove: (name: string, url: string) => void
}) => {
    const { images, isUploading } = filesState
    if (filesState.images.length === 0 && !isUploading) {
        return null
    }
    return (
        <div className="mt-2 flex gap-4">
            {images.map((file) => (
                <ImagePreviewItem
                    key={file.name}
                    previewUrl={file.previewUrl}
                    url={file.url}
                    name={file.name}
                    onImageRemove={onImageRemove}
                />
            ))}
            {isUploading && (
                <div className="flex size-24 items-center justify-center bg-black bg-opacity-50">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-l-2 border-r-2 border-t-4 border-white" />
                </div>
            )}
        </div>
    )
}

interface ImagePreviewItemProps {
    previewUrl: string
    url: string
    name: string
    onImageRemove: (name: string, url: string) => void
}

const ImagePreviewItem = ({
    previewUrl,
    url,
    name,
    onImageRemove,
}: ImagePreviewItemProps) => {
    return (
        <div
            key={name}
            className="relative size-24 rounded-lg border-2 border-[#676767]"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={previewUrl}
                className="h-full w-full object-cover"
                alt={name}
                onLoad={() => {
                    URL.revokeObjectURL(previewUrl)
                }}
            />
            <button
                onClick={() => onImageRemove(name, url)}
                type={'button'}
                className="absolute right-0 top-0 size-4 -translate-y-1 translate-x-1 rounded-full bg-[#676767] p-1"
            >
                <Close className="size-full text-[#2F2F2F]" />
            </button>
        </div>
    )
}

const ImageUploadButton = ({ onClick }: { onClick: () => void }) => {
    return <FileUpload className="size-6 text-white" onClick={onClick} />
}

export default ChatTextfield
