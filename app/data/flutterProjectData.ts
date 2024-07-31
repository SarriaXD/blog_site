import {
    android,
    dart,
    flutter,
    java,
    jetpackCompose,
    kotlin,
    react,
    springBoot,
} from '../../public/images'
import { StaticImageData } from 'next/image'

export interface FlutterDataItem {
    image: StaticImageData
    title: string
    subtitle: string
}

export const flutterProjectData: FlutterDataItem[][] = [
    [
        {
            image: flutter,
            title: 'Flutter',
            subtitle:
                'Flutter is Google’s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.',
        },
        {
            image: dart,
            title: 'Dart',
            subtitle:
                'Dart is a client-optimized programming language for apps on multiple platforms. It is developed by Google and is used to build mobile, desktop, server, and web applications.',
        },
        {
            image: android,
            title: 'Android',
            subtitle:
                'Android is a mobile operating system based on a modified version of the Linux kernel and other open source software, designed primarily for touchscreen mobile devices such as smartphones and tablets.',
        },
        {
            image: kotlin,
            title: 'Kotlin',
            subtitle:
                'Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to be fully interoperable with Java.',
        },
        {
            image: jetpackCompose,
            title: 'Jetpack Compose',
            subtitle:
                'Jetpack Compose is Android’s modern toolkit for building native UI. It simplifies and accelerates UI development on Android.',
        },
    ],
    [
        {
            image: springBoot,
            title: 'Spring Boot',
            subtitle:
                'Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications that you can "just run".',
        },
        {
            image: java,
            title: 'Java',
            subtitle:
                'Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.',
        },
        {
            image: react,
            title: 'React',
            subtitle:
                'React is an open-source, front end, JavaScript library for building user interfaces or UI components.',
        },
    ],
    [
        {
            image: flutter,
            title: 'Flutter',
            subtitle:
                'Flutter is Google’s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.',
        },
        {
            image: dart,
            title: 'Dart',
            subtitle:
                'Dart is a client-optimized programming language for apps on multiple platforms. It is developed by Google and is used to build mobile, desktop, server, and web applications.',
        },
        {
            image: android,
            title: 'Android',
            subtitle:
                'Android is a mobile operating system based on a modified version of the Linux kernel and other open source software, designed primarily for touchscreen mobile devices such as smartphones and tablets.',
        },
    ],
]
