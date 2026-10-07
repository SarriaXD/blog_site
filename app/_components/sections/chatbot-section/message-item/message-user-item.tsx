import { Message } from '@lib/types/chat.ts'
import Image, { StaticImageData } from 'next/image'

const UserItem = (message: Message) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <p className="glass-inset rounded-[20px] px-4 py-2 !font-normal break-all !text-[#ECECEC]">
                    {message.content}
                </p>
            </div>
            {(message.images || message.files) && (
                <div className="flex justify-end gap-4">
                    {message.images?.map((image, index) => {
                        return <ImagePreview key={index} imageDate={image} />
                    })}
                    {message.files?.map((file, index) => {
                        return (
                            <FilePreview
                                key={index}
                                name={file.name}
                                extension={file.extension}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const ImagePreview = ({ imageDate }: { imageDate: StaticImageData }) => {
    return (
        <div className="h-40 overflow-hidden rounded-lg">
            <Image
                src={imageDate}
                alt={'user image'}
                className="h-full w-auto object-cover"
            />
        </div>
    )
}

const FilePreview = ({
    name,
    extension,
}: {
    name: string
    extension: string
}) => {
    return (
        <div className="relative flex size-24 items-center justify-center rounded-xl bg-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_24px_-12px_rgba(0,0,0,0.6)]">
            <span className="overflow-hidden px-2 text-center text-[14px] font-extrabold tracking-tighter text-ellipsis whitespace-nowrap text-[var(--ui-brand-500)]">
                {name}
            </span>
            <span className="absolute -bottom-2 rounded-md bg-[var(--ui-brand-500)] px-2 text-[14px] font-extrabold tracking-tighter text-white">
                {extension}
            </span>
        </div>
    )
}

export default UserItem
