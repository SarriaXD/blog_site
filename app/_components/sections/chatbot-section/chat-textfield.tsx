import { ArrowRight, FileUpload } from '@public/icons'

const ChatTextfield = () => {
    return (
        <div className="w-full px-4 pt-2 pb-4">
            <div className="mx-auto max-w-[800px]">
                <div className="glass-inset flex flex-col rounded-[28px] py-1.5 pr-2 pl-3.5 md:py-2.5 md:pr-2.5 md:pl-6">
                    <div className="flex items-center gap-2 md:gap-4">
                        <FileUpload className="size-5 text-white/80 md:size-6" />
                        <span className="flex-1 text-sm text-white/40">
                            Message Sarria Chat…
                        </span>
                        <button
                            className="rounded-full bg-white/22 p-2 text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                            disabled={true}
                        >
                            <ArrowRight className="size-4 -rotate-90 md:size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatTextfield
