import { cache } from 'react'
import { allStaticImages } from '../assets/images'
import Vibrant from 'node-vibrant'

export interface StaticImageColor {
    mainColor: string
    secondaryColor: string
}

export const getAllStaticImageColors = cache(async () => {
    const dictionary = new Map<string, StaticImageColor>()
    const promises = allStaticImages.map(async (image) => {
        const vibrant = await Vibrant.from(image.rowPath).getPalette()
        const mainColor = vibrant.DarkVibrant?.hex
        const secondaryColor = vibrant.Muted?.hex
        dictionary.set(image.staticImageData.src, {
            mainColor: mainColor ?? 'transparent',
            secondaryColor: secondaryColor ?? 'transparent',
        })
    })
    await Promise.all(promises)
    return dictionary
})
