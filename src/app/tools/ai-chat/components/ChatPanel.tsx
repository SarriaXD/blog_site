import { FormEvent, useCallback, useState } from 'react'
import ChatTextfield, { FilesState } from './ChatTextfield.tsx'
import { HandleSubmit } from './ChatContent.tsx'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-toastify'
import { upload } from '@vercel/blob/client'
import { toastErrorOptions } from '@components/ToastProvider.tsx'

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
    const [filesState, setFilesState] = useState<FilesState>({
        isUploading: false,
        images: [],
    })

    const onFilesLoad = useCallback(
        async (acceptedFiles: File[]) => {
            try {
                // update loading state
                setFilesState((before) => {
                    return {
                        ...before,
                        isUploading: true,
                    }
                })
                // check if the file type is valid, currently only images are allowed
                const allowedContentTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                ]
                if (
                    acceptedFiles.some(
                        (file) => !allowedContentTypes.includes(file.type)
                    )
                ) {
                    toast(
                        'Currently only images are allowed',
                        toastErrorOptions
                    )
                    return
                }
                // filter out files that are already uploaded
                const beforeFileNames = filesState.images.map(
                    (image) => image.name
                )
                const filteredFiles = acceptedFiles.filter((file) => {
                    return !beforeFileNames.includes(file.name)
                })
                // check if the total size of files is less than 5MB
                if (filteredFiles.some((file) => file.size > 5 * 1024 * 1024)) {
                    toast(
                        'You can only upload files up to 5MB',
                        toastErrorOptions
                    )
                    return
                }
                // check if the total number of files is less than 2
                if (filteredFiles.length + filesState.images.length > 2) {
                    toast(
                        'You can only upload up to 2 files',
                        toastErrorOptions
                    )
                    return
                }
                // upload files
                const uploadPromises = filteredFiles.map((file) =>
                    upload(file.name, file, {
                        access: 'public',
                        handleUploadUrl: '/api/chat/upload',
                    })
                )
                const results = await Promise.all(uploadPromises)
                const images = results.map((result, index) => {
                    return {
                        url: result.url,
                        previewUrl: URL.createObjectURL(filteredFiles[index]),
                        name: filteredFiles[index].name,
                        contentType: filteredFiles[index].type,
                    }
                })
                setFilesState((before) => {
                    return {
                        ...before,
                        images: [...before.images, ...images],
                    }
                })
            } catch (e) {
                toast('Error uploading files', toastErrorOptions)
            } finally {
                setFilesState((before) => {
                    return {
                        ...before,
                        isUploading: false,
                    }
                })
            }
        },
        [filesState.images]
    )

    const onSubmitWithImages = useCallback(
        (event: FormEvent) => {
            try {
                if (filesState.isUploading) {
                    toast('Files are still uploading', toastErrorOptions)
                    return
                }
                onSubmit(event, {
                    experimental_attachments: filesState.images,
                })
            } catch (e) {
                toast("Can' sent message right now", toastErrorOptions)
            } finally {
                setFilesState((before) => {
                    return {
                        ...before,
                        images: [],
                    }
                })
            }
        },
        [filesState.images, filesState.isUploading, onSubmit]
    )

    const onFileRemove = useCallback(async (name: string, url: string) => {
        try {
            setFilesState((before) => {
                return {
                    ...before,
                    images: before.images.filter(
                        (image) => image.name !== name
                    ),
                }
            })
            await fetch(`/api/chat/upload?url=${url}`, {
                method: 'DELETE',
            })
        } catch (e) {
            console.log('Error removing file from server', e)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop: onFilesLoad,
        noClick: true,
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
                        filesState={filesState}
                        onFilesLoad={onFilesLoad}
                        onFileRemove={onFileRemove}
                        onOpenFile={open}
                        onMessageChange={onMessageChange}
                        onSubmit={onSubmitWithImages}
                        onStop={onStop}
                    />
                </div>
                <DragZoneOverlay isDragActive={isDragActive} />
            </div>
        </div>
    )
}

export default ChatPanel
