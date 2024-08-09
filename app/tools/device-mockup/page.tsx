'use client'

import ImageUploader from './components/ImageLoader.tsx'
import { FrameGallery } from './components/FrameGallery.tsx'
import ImageLoaderOptions from './components/ImageLoaderOptions.tsx'
import { Button } from '../../components/Material.tsx'

const MainContent = () => {
    return (
        <div className="p-8">
            <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
                <div className="w-[300px] md:w-[500px] lg:w-[800px]">
                    <FrameGallery />
                </div>
                <div className="w-[300px] md:w-[500px] lg:w-[800px]">
                    <ImageUploader
                        onError={() => {}}
                        onImageLoaded={() => {}}
                        onImageRemoved={() => {}}
                    />
                    <ImageLoaderOptions />
                    <div className="flex items-center justify-center">
                        <Button color="blue-gray">Generate Mockup</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <main>
            <section className="bg-[#1E1E1E] py-24">
                <div className="mx-auto min-h-[100vh] py-24 md:max-w-[908px] lg:max-w-[1120px]">
                    <MainContent />
                </div>
            </section>
        </main>
    )
}
