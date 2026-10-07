import { useEffect, useRef, useState } from 'react'

interface SliderStyle {
    left: string
    width: string
}

interface ImageLoaderOptionsProps {
    tabs: Tab[]
    activeTab: number
    setActiveTab: (index: number) => void
}

interface Tab {
    title: string
    description: string
}

const ImageLoaderOptions = ({
    tabs,
    activeTab,
    setActiveTab,
}: ImageLoaderOptionsProps) => {
    const [sliderStyle, setSliderStyle] = useState<SliderStyle | null>(null)
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
    const shouldAnimateSlider = useRef(false)

    useEffect(() => {
        const updateActiveTabPosition = () => {
            const activeTabRef = tabRefs.current[activeTab]
            if (activeTabRef) {
                setSliderStyle({
                    left: `${activeTabRef.offsetLeft}px`,
                    width: `${activeTabRef.offsetWidth}px`,
                })
            }
        }
        updateActiveTabPosition()
        const updateActiveTabPositionOnResize = () => {
            updateActiveTabPosition()
            shouldAnimateSlider.current = false
        }
        window.addEventListener('resize', updateActiveTabPositionOnResize)
        return () =>
            window.removeEventListener(
                'resize',
                updateActiveTabPositionOnResize
            )
    }, [activeTab])

    return (
        <div className="rounded-lg p-6">
            <div className="relative mb-6">
                <div className="flex rounded-full bg-black/30 p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            ref={(el) => {
                                tabRefs.current[index] = el
                            }}
                            className="relative z-10 flex-1 rounded-full px-4 py-2 text-base font-semibold capitalize transition-colors duration-300"
                            onClick={() => {
                                setActiveTab(index)
                                shouldAnimateSlider.current = true
                            }}
                            style={{
                                color:
                                    activeTab === index
                                        ? '#0a1020'
                                        : 'rgba(255,255,255,0.75)',
                                background:
                                    activeTab === index && !sliderStyle
                                        ? '#fff'
                                        : 'transparent',
                            }}
                        >
                            {tab.title}
                        </button>
                    ))}
                </div>
                <div
                    className="absolute top-1 h-[calc(100%-0.5rem)] rounded-full bg-white/92 shadow-[inset_0_1px_0_rgba(255,255,255,1),0_6px_16px_-6px_rgba(0,0,0,0.6)]"
                    style={
                        sliderStyle
                            ? {
                                  ...sliderStyle,
                                  transition: shouldAnimateSlider.current
                                      ? 'all 0.3s ease-in-out'
                                      : 'none',
                              }
                            : {}
                    }
                />
            </div>
            <div className="mt-4">
                <p className="text-center text-[var(--ui-text-secondary)]">
                    {tabs[activeTab].description}
                </p>
            </div>
        </div>
    )
}

export default ImageLoaderOptions
