import React, { Dispatch, FormEvent, SetStateAction, useState } from 'react'
import { ArrowUp, Close, FileUpload, Record } from '@public/icons'
import { HandleSubmit } from './ChatContent.tsx'
import { upload } from '@vercel/blob/client'
import { toast } from 'react-toastify'

interface ChatTextFieldProps {
    value: string
    isLoading: boolean
    files: FileWithPreview[]
    setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
    onOpenFile: () => void
    onMessageChange: (message: string) => void
    onSubmit: HandleSubmit
    onStop: (e: FormEvent) => void
}

export interface FileWithPreview {
    preview: string
    file: File
}

const ChatTextfield = ({
    value,
    isLoading,
    files,
    setFiles,
    onOpenFile,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatTextFieldProps) => {
    const [isUploading, setIsUploading] = useState(false)
    return (
        <div className="flex flex-col gap-4 rounded-[28px] bg-[#2F2F2F] py-2 pl-6 pr-2">
            <ImagesPreview
                isUploading={isUploading}
                files={files}
                setFiles={setFiles}
            />
            <InnerTextfield
                value={value}
                isLoading={isLoading}
                isUploading={isUploading}
                files={files}
                setFiles={setFiles}
                setIsUploading={setIsUploading}
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
    isUploading: boolean
    files: FileWithPreview[]
    setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
    setIsUploading: Dispatch<SetStateAction<boolean>>
    onMessageChange: (message: string) => void
    onOpenFile: () => void
    onSubmit: HandleSubmit
    onStop: (e: FormEvent) => void
}

const InnerTextfield = ({
    value,
    isLoading,
    isUploading,
    files,
    setFiles,
    setIsUploading,
    onMessageChange,
    onOpenFile,
    onSubmit,
    onStop,
}: InnerTextfieldProps) => {
    return (
        <form
            className="flex items-center gap-4"
            onSubmit={async (event) => {
                event.preventDefault()
                if (isUploading) {
                    return
                }
                if (!value && files.length === 0) {
                    return
                }
                try {
                    setIsUploading(true)
                    const uploadPromises = files.map(({ file }) => {
                        return upload(file.name, file, {
                            access: 'public',
                            handleUploadUrl: '/api/chat/upload',
                        })
                    })
                    const results = await Promise.all(uploadPromises)
                    const attachments = results.map((result, index) => ({
                        url: result.url,
                        name: files[index].file.name,
                        contentType: files[index].file.type,
                    }))
                    onSubmit(event, {
                        experimental_attachments: attachments,
                    })
                } catch (e) {
                    toast('Error uploading files', {
                        type: 'error',
                        isLoading: false,
                    })
                } finally {
                    setFiles([])
                    setIsUploading(false)
                }
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
                    setFiles((before) => {
                        return [
                            ...before,
                            ...files.map((file) => ({
                                preview: URL.createObjectURL(file),
                                file,
                            })),
                        ]
                    })
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
    files,
    isUploading,
    setFiles,
}: {
    files: FileWithPreview[]
    isUploading: boolean
    setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
}) => {
    if (files.length === 0) {
        return null
    }
    const onRemoveFile = (name: string) => {
        setFiles((before) => {
            return before.filter((file) => file.file.name !== name)
        })
    }
    return (
        <div className="mt-2 flex gap-4">
            {files.map((file) => (
                <div key={file.file.name} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element*/}
                    <img
                        src={file.preview}
                        className="size-24 rounded-lg border-2 border-[#676767] object-cover"
                        onLoad={() => {
                            URL.revokeObjectURL(file.preview)
                        }}
                        alt={file.file.name}
                    />
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-l-2 border-r-2 border-t-4 border-white" />
                        </div>
                    )}
                    <button
                        onClick={() => onRemoveFile(file.file.name)}
                        type={'button'}
                        className="absolute right-0 top-0 size-4 -translate-y-1 translate-x-1 rounded-full bg-[#676767] p-1"
                    >
                        <Close className="size-full text-[#2F2F2F]" />
                    </button>
                </div>
            ))}
        </div>
    )
}

const ImageUploadButton = ({ onClick }: { onClick: () => void }) => {
    return <FileUpload className="size-6 text-white" onClick={onClick} />
}

export default ChatTextfield
