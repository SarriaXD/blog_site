import { MyTech } from '../components/home/MyTech.tsx'
import { HeroSection } from '../sections/home/HeroSection.tsx'
import { MasonryGridGallery } from '../components/home/MasonryGridGallery.tsx'

export function Homepage() {
    return (
        <>
            <HeroSection />
            <MasonryGridGallery />
            <MyTech />
        </>
    )
}
