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
    flutter_history_2,
    flutter_dynamic_color_2,
    flutter_firebase_2,
    flutter_test_2,
} from '@public/images'
import Vibrant from 'node-vibrant'

export interface StaticImageColor {
    mainColor: string
    secondaryColor: string
}

// we need rowPath for Vibrant to read the image
export const allNeedColorImages = [
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
    flutter_history_2,
    flutter_dynamic_color_2,
    flutter_firebase_2,
    flutter_test_2,
]

export const getAllNeedColorImageColors = cache(async () => {
    const dictionary = new Map<string, StaticImageColor>()
    const promises = allNeedColorImages.map(async (image) => {
        const imageURL = image.src.replace('/_next', '.next')
        const vibrant = await Vibrant.from(imageURL).getPalette()
        const mainColor = vibrant.DarkVibrant?.hex
        const secondaryColor = vibrant.Muted?.hex
        // we use the src as the key to the dictionary, because if we use the StaticImageData object as the key,
        // it will not be the same object when we import it in different files
        dictionary.set(image.src, {
            mainColor: mainColor ?? 'transparent',
            secondaryColor: secondaryColor ?? 'transparent',
        })
    })
    await Promise.all(promises)
    return dictionary
})
