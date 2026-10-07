import { Book, Pen } from '@public/icons'
import { MotionValue, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'
import { sampleChatHistories } from '@lib/data/ai-chatbot-data.ts'

const useItems = (value: MotionValue<number>) => {
    const items = [
        {
            groupedName: 'Today',
            histories: [
                {
                    chatId: 'chat000',
                    title: 'Table of Dishes and Drinks',
                },
                {
                    chatId: 'chat001',
                    title: 'Exploring the Ethical Implications of AI in Modern Society',
                },
                {
                    chatId: 'chat002',
                    title: 'Advanced JavaScript Debugging Techniques for Complex Applications',
                },
                {
                    chatId: 'chat003',
                    title: 'Quick and Nutritious Lunch Recipe Ideas for Busy Professionals',
                },
            ],
        },
        {
            groupedName: 'Today',
            histories: [
                {
                    chatId: 'chat000',
                    title: 'Latest CBC News in Winnipeg',
                },
                {
                    chatId: 'chat001',
                    title: 'Exploring the Ethical Implications of AI in Modern Society',
                },
                {
                    chatId: 'chat002',
                    title: 'Advanced JavaScript Debugging Techniques for Complex Applications',
                },
                {
                    chatId: 'chat003',
                    title: 'Quick and Nutritious Lunch Recipe Ideas for Busy Professionals',
                },
            ],
        },
        {
            groupedName: 'Today',
            histories: [
                {
                    chatId: 'chat000',
                    title: 'Weather and Forecast in Winnipeg',
                },
                {
                    chatId: 'chat001',
                    title: 'Exploring the Ethical Implications of AI in Modern Society',
                },
                {
                    chatId: 'chat002',
                    title: 'Advanced JavaScript Debugging Techniques for Complex Applications',
                },
                {
                    chatId: 'chat003',
                    title: 'Quick and Nutritious Lunch Recipe Ideas for Busy Professionals',
                },
            ],
        },
    ]
    const [index, setIndex] = useState(0)
    value.on('change', (latest) => {
        if (latest < 0.33) {
            setIndex(0)
        } else if (latest < 0.66) {
            setIndex(1)
        } else if (latest < 1) {
            setIndex(2)
        }
    })
    return [items[index], ...sampleChatHistories]
}

const GroupedItems = ({
    groupedName,
    currentChatId,
    items,
}: {
    groupedName: string
    currentChatId?: string
    items: { chatId: string; title: string }[]
}) => {
    return (
        <>
            <h2 className="mt-4 mb-1 px-2 py-1 text-xs font-semibold tracking-[0.14em] text-white/45 uppercase">
                {groupedName}
            </h2>
            {items.map((item) => {
                return (
                    <HistoryItem
                        key={item.chatId}
                        currentChatId={currentChatId}
                        chatId={item.chatId}
                        title={item.title}
                    />
                )
            })}
        </>
    )
}

const TypeAnimationWrapper = ({ title }: { title: string }) => {
    const ref = useRef(null)
    const inView: boolean = useInView(ref, {
        once: false,
    })
    return (
        <div ref={ref}>
            {inView ? (
                <TypeAnimation
                    key={title}
                    sequence={[title]}
                    wrapper="span"
                    speed={40}
                    omitDeletionAnimation={true}
                    cursor={false}
                />
            ) : (
                <span key={title}>{title}</span>
            )}
        </div>
    )
}

const HistoryItem = ({
    currentChatId,
    chatId,
    title,
}: {
    currentChatId?: string
    chatId: string
    title: string
}) => {
    const active = chatId === currentChatId
    return (
        <li>
            <div
                className={`relative h-[40px] overflow-hidden rounded-xl p-2 text-[15px] font-medium tracking-tight whitespace-nowrap transition-colors ${
                    active
                        ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]'
                        : 'text-white/70 hover:bg-white/6'
                }`}
            >
                <div
                    className="overflow-hidden"
                    style={{
                        maskImage: active
                            ? 'linear-gradient(to right, black 72%, transparent 92%)'
                            : 'linear-gradient(to right, black 82%, transparent 100%)',
                    }}
                >
                    {active ? <TypeAnimationWrapper title={title} /> : title}
                </div>
                {active && (
                    <span className="absolute inset-y-0 right-2 flex items-center justify-center gap-0.5">
                        <span className="size-1 rounded-full bg-white/70" />
                        <span className="size-1 rounded-full bg-white/70" />
                        <span className="size-1 rounded-full bg-white/70" />
                    </span>
                )}
            </div>
        </li>
    )
}

const ChatSidebar = ({ progress }: { progress: MotionValue<number> }) => {
    const items = useItems(progress)
    return (
        <div className="hidden h-full overflow-hidden border-r border-white/8 bg-black/18 text-white/80 md:block md:w-[180px] xl:w-[256px]">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="rounded-xl p-2 transition-colors hover:bg-white/10">
                    <Book className="transform text-white/60 transition-all duration-200 active:scale-95" />
                </div>
                <div className="rounded-xl p-2 transition-colors hover:bg-white/10">
                    <Pen className="size-full transform text-white/60 transition-all duration-200 active:scale-95" />
                </div>
            </div>
            <div className="p-2">
                <div className="mb-4">
                    <ul>
                        {items.map((groupedItem) => (
                            <GroupedItems
                                key={groupedItem.groupedName}
                                groupedName={groupedItem.groupedName}
                                currentChatId="chat000"
                                items={groupedItem.histories}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default ChatSidebar
