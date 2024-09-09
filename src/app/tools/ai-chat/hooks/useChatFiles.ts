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
        pdfs: [],
    })

    const onFilesLoad = useCallback(
        async (acceptedFiles: File[]) => {
            try {
                // check if the file type is valid, currently only images and PDFs are allowed
                const allowedContentTypes = [
                    'image/jpeg',
                    'image/png',
                    'image/jpg',
                    // 'application/pdf',
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
                            ...filteredFiles
                                .filter((file) =>
                                    file.type.startsWith('image/')
                                )
                                .map((file) => {
                                    return {
                                        url: '',
                                        isUploading: true,
                                        previewUrl: URL.createObjectURL(file),
                                        name: file.name,
                                        contentType: file.type,
                                    }
                                }),
                        ],
                        pdfs: [
                            ...before.pdfs,
                            ...filteredFiles
                                .filter(
                                    (file) => file.type === 'application/pdf'
                                )
                                .map((file) => {
                                    return {
                                        url: '',
                                        isUploading: true,
                                        name: file.name,
                                        contentType: file.type,
                                    }
                                }),
                        ],
                    }
                })
                // upload images to server
                const imagesPromises = filteredFiles
                    .filter((file) => file.type.startsWith('image/'))
                    .map((file) =>
                        upload(file.name, file, {
                            access: 'public',
                            handleUploadUrl: '/api/chat/upload',
                        })
                    )
                // upload the pdfs to server
                const pdfsPromises = filteredFiles
                    .filter((file) => file.type === 'application/pdf')
                    .map((file) =>
                        upload(file.name, file, {
                            access: 'public',
                            handleUploadUrl: '/api/chat/upload',
                        })
                    )
                const results = await Promise.all([
                    ...imagesPromises,
                    ...pdfsPromises,
                ])
                // update the url of the uploaded files for the previous images with '' url
                setFilesState((before) => {
                    const images = before.images.map((image) => {
                        const result = results.find(
                            (result) => result.pathname === image.name
                        )
                        if (result) {
                            return {
                                ...image,
                                url: result.url,
                                isUploading: false,
                            }
                        } else {
                            return image
                        }
                    })
                    const pdfs = before.pdfs.map((pdf) => {
                        const result = results.find(
                            (result) => result.pathname === pdf.name
                        )
                        if (result) {
                            return {
                                ...pdf,
                                url: result.url,
                                isUploading: false,
                            }
                        } else {
                            return pdf
                        }
                    })
                    return {
                        images: [...images],
                        pdfs: [...pdfs],
                    }
                })
            } catch (e) {
                toast(`Error uploading files ${e}`, toastErrorOptions)

                // clean up the files that are not uploaded
                setFilesState((before) => {
                    return {
                        images: before.images.filter(
                            (image) => !image.isUploading && image.url !== ''
                        ),
                        pdfs: before.pdfs.filter(
                            (pdf) => !pdf.isUploading && pdf.url !== ''
                        ),
                    }
                })
            }
        },
        [filesState]
    )

    const onSubmitWithFiles = useCallback(
        (event: FormEvent) => {
            try {
                // check if some files are still uploading
                const isSomeFilesUploading =
                    filesState.images.some((image) => image.isUploading) ||
                    filesState.pdfs.some((pdf) => pdf.isUploading)
                if (isSomeFilesUploading) {
                    toast('Files are still uploading', toastErrorOptions)
                    return
                }
                onSubmit(event, {
                    experimental_attachments: [
                        ...filesState.images,
                        ...filesState.pdfs,
                    ],
                })
            } catch (e) {
                toast("Can' sent message right now", toastErrorOptions)
            } finally {
                setFilesState(() => {
                    return {
                        images: [],
                        pdfs: [],
                    }
                })
            }
        },
        [filesState, onSubmit]
    )

    const onFileRemove = useCallback(async (name: string, url: string) => {
        try {
            setFilesState((before) => {
                return {
                    images: before.images.filter(
                        (image) => image.name !== name
                    ),
                    pdfs: before.pdfs.filter((pdf) => pdf.name !== name),
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
        onSubmitWithImages: onSubmitWithFiles,
    }
}

export default useChatFiles
