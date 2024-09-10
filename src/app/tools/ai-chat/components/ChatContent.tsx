'use client'

import MessageList from './MessageList.tsx'
import { useChat } from 'ai/react'
import { useChatScroll } from '../hooks/useChatScroll.ts'
import ChatPanel from './ChatPanel.tsx'
import EmptyMessagePlaceholder from './EmptyMessagePlaceholder.tsx'
import useChatFiles from '../hooks/useChatFiles.ts'
import { AnimatePresence, motion } from 'framer-motion'
import { Add } from '@public/icons'
import React from 'react'

export type HandleSubmit = (
    event?: {
        preventDefault?: () => void
    },
    chatRequestOptions?: {
        experimental_attachments?: Array<{
            url: string
            name: string
            contentType: string
        }>
    }
) => void

const DragZoneOverlay = ({ isDragActive }: { isDragActive: boolean }) => {
    return (
        <AnimatePresence>
            {isDragActive && (
                <motion.div
                    className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-30 will-change-transform`}
                    initial={{
                        backdropFilter: 'blur(0px)',
                    }}
                    animate={{
                        backdropFilter: 'blur(20px)',
                    }}
                    exit={{
                        backdropFilter: 'blur(0px)',
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                        }}
                        exit={{
                            opacity: 0,
                        }}
                        className="flex flex-col items-center justify-center gap-16 rounded-xl text-3xl text-white"
                    >
                        <Add className="size-36 text-gray-200" />
                        Drop here to upload image
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const ChatContent = () => {
    const { messages, input, isLoading, handleSubmit, setInput, stop } =
        useChat()

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        open,
        filesState,
        onFilesLoad,
        onFileRemove,
        onSubmitWithImages,
    } = useChatFiles(handleSubmit)

    const { scrollRef } = useChatScroll(messages, isLoading)

    return (
        <div
            {...getRootProps({
                className: 'flex size-full flex-col',
            })}
        >
            <input {...getInputProps()} />
            <DragZoneOverlay isDragActive={isDragActive} />
            <div className="w-full flex-1 overflow-auto">
                {messages && messages.length > 0 && (
                    <div className="px-8 pt-24">
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                        />
                        <div ref={scrollRef} className="h-12 w-full" />
                    </div>
                )}
                {(!messages || messages.length === 0) && (
                    <EmptyMessagePlaceholder />
                )}
            </div>
            <ChatPanel
                value={input}
                isLoading={isLoading}
                filesState={filesState}
                onFilesLoad={onFilesLoad}
                onFileRemove={onFileRemove}
                open={open}
                onSubmit={onSubmitWithImages}
                onMessageChange={setInput}
                onStop={stop}
            />
        </div>
    )
}

export default ChatContent
