import { useState, useEffect } from 'react'

export const useMediaQuery = (query: string, initValue: boolean = false) => {
    const [matches, setMatches] = useState<boolean>(initValue)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const media = window.matchMedia(query)

            // Initial check
            if (media.matches !== matches) {
                setMatches(media.matches)
            }

            // Event listener callback
            const listener = (event: MediaQueryListEvent) => {
                setMatches(event.matches)
            }

            // Add event listener
            media.addEventListener('change', listener)

            // Cleanup event listener on unmount
            return () => media.removeEventListener('change', listener)
        }
    }, [matches, query])

    return matches
}
