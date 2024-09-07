import { FormEvent, useCallback, useState } from 'react'
import { FilesState } from '../components/ChatTextfield.tsx'
import { toast } from 'react-toastify'
import { toastErrorOptions } from '@components/ToastProvider.tsx'
import { useDropzone } from 'react-dropzone'
import { HandleSubmit } from '../components/ChatContent.tsx'
import { upload } from '@vercel/blob/client'

const useChatFiles = (onSubmit: HandleSubmit) => {
    const [filesState, setFilesState] = useState<FilesState>({
        images: [],
    })

    const onFilesLoad = useCallback(
        async (acceptedFiles: File[]) => {
            try {
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
                // update the preview url for images for better user experience
                setFilesState((before) => {
                    return {
                        images: [
                            ...before.images,
                            ...filteredFiles.map((file) => {
                                return {
                                    url: '',
                                    isUploading: true,
                                    previewUrl: URL.createObjectURL(file),
                                    name: file.name,
                                    contentType: file.type,
                                }
                            }),
                        ],
                    }
                })
                // upload files to server
                const uploadPromises = filteredFiles.map((file) =>
                    upload(file.name, file, {
                        access: 'public',
                        handleUploadUrl: '/api/chat/upload',
                    })
                )
                const results = await Promise.all(uploadPromises)
                // update the url of the uploaded files for the previous images with '' url
                setFilesState((before) => {
                    const images = before.images.map((image) => {
                        const index = filteredFiles.findIndex(
                            (originalFile) => originalFile.name === image.name
                        )
                        if (index === -1) {
                            return image
                        } else {
                            return {
                                ...image,
                                url: results[index].url,
                                isUploading: false,
                            }
                        }
                    })
                    return {
                        ...before,
                        images: [...images],
                    }
                })
            } catch (e) {
                toast('Error uploading files', toastErrorOptions)
                // clean up the files that are not uploaded
                setFilesState((before) => {
                    return {
                        images: before.images.filter(
                            (image) => !image.isUploading && image.url !== ''
                        ),
                    }
                })
            }
        },
        [filesState.images]
    )

    const onSubmitWithImages = useCallback(
        (event: FormEvent) => {
            try {
                // check if some files are still uploading
                const isSomeFilesUploading = filesState.images.some(
                    (image) => image.isUploading
                )
                if (isSomeFilesUploading) {
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
        [filesState.images, onSubmit]
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

    return {
        filesState,
        getRootProps,
        getInputProps,
        isDragActive,
        open,
        onFilesLoad,
        onFileRemove,
        onSubmitWithImages,
    }
}

export default useChatFiles
