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
                <div className="flex rounded-md bg-[#282828]">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            ref={(el) => {
                                tabRefs.current[index] = el
                            }}
                            className="relative z-10 flex-1 rounded-md px-4 py-2 text-base font-medium transition-colors duration-300"
                            onClick={() => {
                                setActiveTab(index)
                                shouldAnimateSlider.current = true
                            }}
                            style={{
                                color: activeTab === index ? '#000' : '#fff',
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
                    className="absolute top-0 h-full rounded-md bg-white"
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
            <div className="mt-4 text-white">
                <p className="text-gray-300">{tabs[activeTab].description}</p>
            </div>
        </div>
    )
}

export default ImageLoaderOptions
