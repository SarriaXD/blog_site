'use client'

import ImageUploader from './components/ImageLoader.tsx'
import { FrameGallery } from './components/FrameGallery.tsx'

const MainContent = () => {
    return (
        <div className="p-8">
            <div className="flex flex-col gap-8 md:flex-row">
                <FrameGallery className="flex-1" />
                <ImageUploader
                    className="flex-1"
                    onError={() => {}}
                    onImageLoaded={() => {}}
                    onImageRemoved={() => {}}
                />
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <section
                className="py-24"
                style={{
                    backgroundImage:
                        'linear-gradient(180deg,#000000 0%,rgba(0,0,0,0) 100%), radial-gradient(200% 100% at -66% 36%,rgb(0, 73, 184) 100%)',
                }}
            >
                <div className="mx-auto min-h-[100vh] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </section>
        </main>
    )
}
