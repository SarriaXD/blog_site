import { cache } from 'react'
import Vibrant from 'node-vibrant'

export const getImageColor = cache(async (image: string) => {
    return await Vibrant.from(image).getPalette()
})
