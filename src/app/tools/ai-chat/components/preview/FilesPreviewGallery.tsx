import { motion } from 'framer-motion'
import React from 'react'
import ImagePreviewItem from './ImagePreviewItem.tsx'
import PDFPreviewItem from './PDFPreviewItem.tsx'

interface FilesPreviewProps {
    images: {
        isUploading: boolean
        url: string
        previewUrl: string
        name: string
        contentType: string
    }[]
    pdfs: {
        isUploading: boolean
        url: string
        name: string
        contentType: string
    }[]
    onPDFRemove: (name: string, url: string) => void
    onImageRemove: (name: string, url: string) => void
}

const FilesPreviewGallery = ({
    images,
    pdfs,
    onImageRemove,
    onPDFRemove,
}: FilesPreviewProps) => {
    const hasFiles = images.length + pdfs.length > 0
    return (
        <motion.div
            animate={{
                height: hasFiles ? 'auto' : 0,
                margin: hasFiles ? '12px' : '0',
            }}
        >
            <div className="flex gap-4">
                {images.map((file) => (
                    <ImagePreviewItem
                        key={file.name}
                        previewUrl={file.previewUrl}
                        url={file.url}
                        name={file.name}
                        isUploading={file.isUploading}
                        onImageRemove={onImageRemove}
                    />
                ))}
                {pdfs.map((file) => (
                    <PDFPreviewItem
                        key={file.name}
                        url={file.url}
                        name={file.name}
                        isUploading={file.isUploading}
                        onPDFRemove={onPDFRemove}
                    />
                ))}
            </div>
        </motion.div>
    )
}

export default FilesPreviewGallery
