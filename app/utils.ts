import { cache } from 'react'
import {
    android,
    dart,
    flutter,
    java,
    jetpackCompose,
    kotlin,
    react,
    springBoot,
    python,
    typescript,
    hero_mobile,
    hero_web,
    hero_backend,
} from '../assets/images'
import Vibrant from 'node-vibrant'

export interface StaticImageColor {
    mainColor: string
    secondaryColor: string
}

// we need rowPath for Vibrant to read the image
export const allNeedColorImages = [
    { staticImageData: android, rowPath: 'assets/images/android.png' },
    { staticImageData: dart, rowPath: 'assets/images/dart.png' },
    { staticImageData: flutter, rowPath: 'assets/images/flutter.png' },
    { staticImageData: java, rowPath: 'assets/images/java.png' },
    {
        staticImageData: jetpackCompose,
        rowPath: 'assets/images/jetpack_compose.png',
    },
    { staticImageData: kotlin, rowPath: 'assets/images/kotlin.png' },
    { staticImageData: react, rowPath: 'assets/images/react.png' },
    { staticImageData: springBoot, rowPath: 'assets/images/spring_boot.png' },
    { staticImageData: python, rowPath: 'assets/images/python.png' },
    { staticImageData: typescript, rowPath: 'assets/images/typescript.png' },
    { staticImageData: hero_mobile, rowPath: 'assets/images/hero_mobile.png' },
    { staticImageData: hero_web, rowPath: 'assets/images/hero_web.png' },
    {
        staticImageData: hero_backend,
        rowPath: 'assets/images/hero_backend.png',
    },
]

export const getAllNeedColorImageColors = cache(async () => {
    const dictionary = new Map<string, StaticImageColor>()
    const promises = allNeedColorImages.map(async (image) => {
        const vibrant = await Vibrant.from(image.rowPath).getPalette()
        const mainColor = vibrant.DarkVibrant?.hex
        const secondaryColor = vibrant.Muted?.hex
        // we use the src as the key to the dictionary, because if we use the StaticImageData object as the key,
        // it will not be the same object when we import it in different files
        dictionary.set(image.staticImageData.src, {
            mainColor: mainColor ?? 'transparent',
            secondaryColor: secondaryColor ?? 'transparent',
        })
    })
    await Promise.all(promises)
    return dictionary
})
