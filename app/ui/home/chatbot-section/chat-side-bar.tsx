import { Book, Pen } from '@public/icons'
import { MotionValue, useInView } from 'framer-motion'
import { useRef, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'

const sampleChatHistories = [
    {
        groupedName: 'Yesterday',
        histories: [
            {
                chatId: 'chat004',
                title: 'Curated Book Recommendations Based on Personal Reading Preferences',
            },
            {
                chatId: 'chat005',
                title: 'Comprehensive Tutorial on React Hooks and State Management',
            },
            {
                chatId: 'chat006',
                title: 'Effective Time Management Strategies for Increased Productivity',
            },
        ],
    },
    {
        groupedName: '2 Days Ago',
        histories: [
            {
                chatId: 'chat007',
                title: 'Personalized Workout Routine Planning for Fitness Goals',
            },
            {
                chatId: 'chat008',
                title: 'Efficient Data Analysis Techniques Using Python and Pandas',
            },
        ],
    },
    {
        groupedName: 'Last Week',
        histories: [
            {
                chatId: 'chat009',
                title: 'Customized Travel Itinerary Planning for European Vacation',
            },
            {
                chatId: 'chat010',
                title: 'Introduction to Machine Learning and Neural Networks',
            },
            {
                chatId: 'chat011',
                title: 'Implementing Effective Productivity Techniques in Daily Routine',
            },
        ],
    },
    {
        groupedName: '2 Weeks Ago',
        histories: [
            {
                chatId: 'chat012',
                title: 'Comprehensive Notes from Advanced Guitar Lessons on Jazz Theory',
            },
            {
                chatId: 'chat013',
                title: 'Personalized Movie Recommendations Based on Viewing History',
            },
        ],
    },
    {
        groupedName: 'Last Month',
        histories: [
            {
                chatId: 'chat014',
                title: 'Creative and Cost-Effective Home Renovation Ideas for Modern Living',
            },
            {
                chatId: 'chat015',
                title: 'Tailored Career Advice for Transitioning to the Tech Industry',
            },
            {
                chatId: 'chat016',
                title: 'Personalized Fitness Training Plan for Weight Loss',
            },
        ],
    },
    {
        groupedName: '2 Months Ago',
        histories: [
            {
                chatId: 'chat017',
                title: 'Sustainable Gardening Tips for Urban Spaces and Small Yards',
            },
            {
                chatId: 'chat018',
                title: 'Long-Term Financial Planning Strategies for Early Retirement',
            },
        ],
    },
    {
        groupedName: '3 Months Ago',
        histories: [
            {
                chatId: 'chat019',
                title: 'Effective Language Learning Strategies for Multilingual Proficiency',
            },
            {
                chatId: 'chat020',
                title: 'Collection of Healthy and Delicious Recipes for a Balanced Diet',
            },
        ],
    },
]

const useItems = (value: MotionValue<number>) => {
    const items = [
        {
            groupedName: 'Today',
            histories: [
                {
                    chatId: 'chat000',
                    title: 'How about the weather in Winnipeg today?',
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
                    title: 'Help me search the latest news in Winnipeg',
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
                    title: 'Who are you?',
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
            <h2 className="mb-2 mt-4 px-2 py-1 text-lg text-gray-400">
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
                    sequence={[title, 600]}
                    wrapper="span"
                    speed={50}
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
    const bgColor = chatId === currentChatId ? 'bg-gray-900' : ''
    const threeDotsVisibility = chatId === currentChatId ? '!visible' : ''
    const threeDotsColor = chatId === currentChatId ? '!bg-gray-900' : ''
    return (
        <li>
            <div
                className={`relative h-[40px] overflow-hidden whitespace-nowrap rounded-xl p-2 text-[16px] font-normal tracking-tight ${bgColor}`}
            >
                {chatId === currentChatId ? (
                    <TypeAnimationWrapper title={title} />
                ) : (
                    title
                )}
                <div
                    className={`absolute inset-y-0 right-0 flex items-center justify-center bg-[#171717] ${threeDotsColor}`}
                    style={{
                        maskImage:
                            'linear-gradient(to left, black 60%, transparent)',
                    }}
                >
                    <span
                        className={`invisible flex h-full items-center justify-center gap-0.5 pl-6 pr-2 ${threeDotsVisibility}`}
                    >
                        <span className="size-1 rounded-full bg-gray-400" />
                        <span className="size-1 rounded-full bg-gray-400" />
                        <span className="size-1 rounded-full bg-gray-400" />
                    </span>
                </div>
            </div>
        </li>
    )
}

const ChatSidebar = ({ progress }: { progress: MotionValue<number> }) => {
    const items = useItems(progress)
    return (
        <div className="hidden h-full w-[256px] flex-col bg-[#171717] text-gray-300 md:flex">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="rounded-lg p-2 hover:bg-gray-900">
                    <Book className="transform text-gray-400 transition-all duration-200 hover:shadow-lg active:scale-95" />
                </div>
                <div className="rounded-lg p-2 hover:bg-gray-900">
                    <Pen className="size-full transform text-gray-400 transition-all duration-200 hover:shadow-lg active:scale-95" />
                </div>
            </div>
            <div className={'flex-1 overflow-scroll'}>
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
        </div>
    )
}

export default ChatSidebar
