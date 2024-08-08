'use client'

import ImageUploader from './components/ImageLoader.tsx'

const MainContent = () => {
    return (
        <div>
            <h1>图片上传</h1>
            <ImageUploader
                onError={() => {}}
                onImageLoaded={() => {}}
                onImageRemoved={() => {}}
            />
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <section className="bg-[#101010] py-24">
                <div className="mx-auto min-h-[100vh] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </section>
        </main>
    )
}
