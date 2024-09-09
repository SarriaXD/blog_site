import { Dog } from '@public/icons'

const EmptyMessagePlaceholder = () => {
    return (
        <div className="flex size-full flex-1 flex-col items-center justify-center gap-8 bg-[#212121] px-4">
            <Dog className="size-64 text-white md:size-80" />
            <p className="text-center text-xl text-gray-300 md:text-2xl">
                Hi I am Qi, how can I help you today?
            </p>
        </div>
    )
}

export default EmptyMessagePlaceholder
