import { Message } from '@lib/types/chat.ts'
import Image, { StaticImageData } from 'next/image'

const UserItem = (message: Message) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end">
                <p className="break-all rounded-[20px] bg-[#2F2F2F] px-4 py-2 !font-normal !text-[#ECECEC]">
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
        <div className="relative flex size-24 items-center justify-center rounded-xl bg-white">
            <span className="overflow-hidden text-ellipsis whitespace-nowrap px-2 text-center text-[14px] font-extrabold tracking-tighter text-blue-600">
                {name}
            </span>
            <span className="absolute -bottom-2 rounded bg-blue-700 px-2 text-[14px] font-extrabold tracking-tighter">
                {extension}
            </span>
        </div>
    )
}

export default UserItem
