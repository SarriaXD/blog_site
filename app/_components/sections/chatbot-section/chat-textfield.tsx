import { ArrowRight, FileUpload } from '@public/icons'

const ChatTextfield = () => {
    return (
        <div className="w-full rounded-b-xl bg-gray-900 px-4 pb-4 pt-2">
            <div className="mx-auto max-w-[800px]">
                <div className="flex flex-col rounded-[28px] bg-[#2F2F2F] py-1 pl-3.5 pr-2 md:py-2 md:pl-6 md:pr-2">
                    <div className="flex items-center gap-2 md:gap-4">
                        <FileUpload className="size-5 text-white md:size-6" />
                        <div className="flex-1" />
                        <button
                            className="rounded-full bg-[#676767] p-2 text-[#2F2F2F]"
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
