import { Dog } from '@public/icons'

const EmptyMessagePlaceholder = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-8">
            <Dog className="size-64 text-white" />
            <p className="text-2xl">Hi I am Qi, how can I help you today?</p>
        </div>
    )
}

export default EmptyMessagePlaceholder
