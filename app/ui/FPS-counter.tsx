'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface FPSCounterProps {
    defaultVisible?: boolean
}

const useFPS = (defaultVisible: boolean) => {
    const [fps, setFps] = useState<number>(0)
    const [isVisible, setIsVisible] = useState<boolean>(defaultVisible)
    const searchParams = useSearchParams()

    useEffect(() => {
        const checkURLParam = (): void => {
            setIsVisible(searchParams.get('showFPS') === 'true')
        }

        checkURLParam()
    }, [searchParams])

    useEffect(() => {
        if (!isVisible) return

        let frameCount = 0
        let lastTime = performance.now()

        const updateFPS = (currentTime: number): void => {
            frameCount++

            if (currentTime - lastTime > 1000) {
                setFps(
                    Math.round((frameCount * 1000) / (currentTime - lastTime))
                )
                frameCount = 0
                lastTime = currentTime
            }

            requestAnimationFrame(updateFPS)
        }

        const animationId = requestAnimationFrame(updateFPS)

        return () => cancelAnimationFrame(animationId)
    }, [isVisible])

    return { isVisible, fps }
}

const RawFPSCounter = ({ defaultVisible = false }: FPSCounterProps) => {
    const { isVisible, fps } = useFPS(defaultVisible)
    if (!isVisible) return null
    return (
        <div className="fixed right-0 top-24 z-50 flex justify-end rounded bg-black bg-opacity-50 p-2 text-white">
            FPS: {fps}
        </div>
    )
}

const FPSCounter = ({ defaultVisible = false }: FPSCounterProps) => {
    return (
        <Suspense>
            <RawFPSCounter defaultVisible={defaultVisible} />
        </Suspense>
    )
}

export default FPSCounter
