import Image from 'next/image'
import { not_found } from '@public/images'
import React from 'react'

const NotFoundImage = () => {
    return (
        <div
            className="animate-ghost md:h-full"
            style={{
                maskImage:
                    'radial-gradient(circle, black 0%, transparent 70%, transparent 100%)',
            }}
        >
            <Image
                src={not_found}
                priority={true}
                placeholder="blur"
                alt="under development image"
            />
        </div>
    )
}

export default NotFoundImage
