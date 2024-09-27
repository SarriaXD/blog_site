import { Book, Pen } from '@public/icons'

export default function ChatHeader() {
    return (
        <div className="flex h-16 items-center justify-between px-4 py-3">
            <div className="flex items-center justify-center gap-4 md:hidden">
                <div className="rounded-lg p-2 hover:bg-gray-800">
                    <Book className="size-full transform text-gray-400 transition-all duration-200 hover:shadow-lg active:scale-95" />
                </div>
                <div className="rounded-lg p-2 hover:bg-gray-800">
                    <Pen className="size-full transform text-gray-400 transition-all duration-200 hover:shadow-lg active:scale-95" />
                </div>
            </div>
            <span />
            <div className="overflow-hidden rounded-full border border-gray-400 bg-[#7988FF]">
                You
            </div>
        </div>
    )
}
