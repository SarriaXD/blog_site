import { FormEvent } from 'react'
import { ArrowUp, Close, FileUpload, Record } from '@public/icons'
import { HandleSubmit } from './ChatContent.tsx'

interface ChatTextFieldProps {
    value: string
    isLoading: boolean
    files: FileWithPreview[]
    setFiles: (files: FileWithPreview[]) => void
    onRemoveFile: (name: string) => void
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
    onRemoveFile,
    onOpenFile,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatTextFieldProps) => {
    return (
        <div className="flex flex-col gap-4 rounded-[28px] bg-[#2F2F2F] py-2 pl-6 pr-2">
            <ImagesPreview files={files} onRemoveFile={onRemoveFile} />
            <InnerTextfield
                value={value}
                isLoading={isLoading}
                files={files}
                setFiles={setFiles}
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
    files: FileWithPreview[]
    setFiles: (files: FileWithPreview[]) => void
    onMessageChange: (message: string) => void
    onOpenFile: () => void
    onSubmit: HandleSubmit
    onStop: (e: FormEvent) => void
}

const InnerTextfield = ({
    value,
    isLoading,
    files,
    setFiles,
    onMessageChange,
    onOpenFile,
    onSubmit,
    onStop,
}: InnerTextfieldProps) => {
    return (
        <form
            className="flex items-center gap-4"
            onSubmit={(event) => {
                event.preventDefault()
                if (!value && files.length === 0) {
                    return
                }
                const dataTransfer = new DataTransfer()
                files.forEach((file) => dataTransfer.items.add(file.file))
                onSubmit(event, {
                    experimental_attachments: dataTransfer.files,
                })

                setFiles([])
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
                    className={`rounded-full p-2 text-[#2F2F2F] ${value ? 'bg-white' : 'bg-[#676767]'}`}
                    disabled={isLoading}
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
    onRemoveFile,
}: {
    files: FileWithPreview[]
    onRemoveFile: (name: string) => void
}) => {
    if (files.length === 0) {
        return null
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
