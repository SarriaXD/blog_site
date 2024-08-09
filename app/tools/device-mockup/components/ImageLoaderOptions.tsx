import { useEffect, useRef, useState } from 'react'

interface SliderStyle {
    left: string
    width: string
}

const ImageLoaderOptions = () => {
    const [activeTab, setActiveTab] = useState(0)
    const [sliderStyle, setSliderStyle] = useState<SliderStyle | null>(null)
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

    const tabs = [
        {
            title: 'contain',
            description:
                'Device frame is resized to fit the image. The image ratio is maintained.',
        },
        {
            title: 'fit',
            description:
                'Image is resized to fit the device frame. The image ratio is not maintained.',
        },
    ]

    useEffect(() => {
        const activeTabElement = tabRefs.current[activeTab]
        if (activeTabElement) {
            setSliderStyle({
                left: `${activeTabElement.offsetLeft}px`,
                width: `${activeTabElement.offsetWidth}px`,
            })
        }
    }, [activeTab])

    return (
        <div className="rounded-lg p-6">
            <div className="relative mb-6">
                <div className="flex">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            ref={(el) => (tabRefs.current[index] = el)}
                            className="relative z-10 rounded-md px-4 py-2 text-base font-medium transition-colors duration-300"
                            onClick={() => setActiveTab(index)}
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
                    className="absolute top-0 h-full rounded-md bg-white transition-all duration-300 ease-in-out"
                    style={sliderStyle ? sliderStyle : {}}
                />
            </div>
            <div className="mt-4 text-white">
                <h3 className="mb-2 text-xl font-semibold">
                    {tabs[activeTab].title}
                </h3>
                <p className="text-gray-300">{tabs[activeTab].description}</p>
            </div>
        </div>
    )
}

export default ImageLoaderOptions
