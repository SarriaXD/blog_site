import { FormEvent, useCallback, useState } from 'react'
import ChatTextfield, { FileWithPreview } from './ChatTextfield.tsx'
import { HandleSubmit } from './ChatContent.tsx'
import { useDropzone } from 'react-dropzone'

interface ChatPanelProps {
    value: string
    isLoading: boolean
    onMessageChange: (message: string) => void
    onSubmit: HandleSubmit
    onStop: (e: FormEvent) => void
}

const DragZoneOverlay = ({ isDragActive }: { isDragActive: boolean }) => {
    return (
        <div
            className={`fixed inset-0 z-50 bg-gray-300 bg-opacity-10 ${
                isDragActive ? 'visible' : 'hidden'
            }`}
        />
    )
}

const ChatPanel = ({
    value,
    isLoading,
    onMessageChange,
    onSubmit,
    onStop,
}: ChatPanelProps) => {
    const [files, setFiles] = useState<FileWithPreview[]>([])

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles((before) => {
            return [
                ...before,
                ...acceptedFiles.map((file) => ({
                    preview: URL.createObjectURL(file),
                    file,
                })),
            ]
        })
    }, [])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.jpeg', '.png', '.jpg'],
        },
    })

    return (
        <div className="fixed inset-x-0 bottom-0 w-full">
            <div
                {...getRootProps({
                    className: `mx-auto max-w-[800px] px-4 pt-[200px]`,
                })}
            >
                <input {...getInputProps()} />
                <div className="bg-[#212121] pb-4 pt-2">
                    <ChatTextfield
                        value={value}
                        isLoading={isLoading}
                        files={files}
                        setFiles={setFiles}
                        onOpenFile={open}
                        onMessageChange={onMessageChange}
                        onSubmit={onSubmit}
                        onStop={onStop}
                    />
                </div>
                <DragZoneOverlay isDragActive={isDragActive} />
            </div>
        </div>
    )
}

export default ChatPanel
