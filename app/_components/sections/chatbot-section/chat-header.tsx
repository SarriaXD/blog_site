import { Book, Pen } from '@public/icons'

export default function ChatHeader() {
    return (
        <div className="flex h-16 items-center justify-between border-b border-white/8 px-4 py-3">
            <div className="flex items-center justify-center gap-2 md:hidden">
                <div className="rounded-xl p-2 transition-colors hover:bg-white/10">
                    <Book className="size-full transform text-white/60 transition-all duration-200 active:scale-95" />
                </div>
                <div className="rounded-xl p-2 transition-colors hover:bg-white/10">
                    <Pen className="size-full transform text-white/60 transition-all duration-200 active:scale-95" />
                </div>
            </div>
            <span className="hidden text-sm font-semibold text-white/60 md:block">
                Sarria Chat
            </span>
            <div className="flex h-8 items-center rounded-full border border-white/25 bg-[linear-gradient(135deg,#8c9bff_0%,#5d6cff_100%)] px-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                You
            </div>
        </div>
    )
}
