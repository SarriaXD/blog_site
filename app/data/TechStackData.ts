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
} from '../../assets/images'
import { StaticImageData } from 'next/image'

export interface TechDataItem {
    image: StaticImageData
    title: string
    subtitle: string
    link: string
}

export const frameworkTechData: TechDataItem[] = [
    {
        image: android,
        title: 'Android',
        subtitle:
            'Android is a mobile operating system based on a modified version of the Linux kernel and other open source software, designed primarily for touchscreen mobile devices such as smartphones and tablets.',
        link: 'https://developer.android.com/',
    },
    {
        image: flutter,
        title: 'Flutter',
        subtitle:
            'Flutter is Google’s UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.',
        link: 'https://flutter.dev/',
    },
    {
        image: jetpackCompose,
        title: 'Compose',
        subtitle:
            'Jetpack Compose is Android’s modern toolkit for building native UI. It simplifies and accelerates UI development on Android.',
        link: 'https://developer.android.com/jetpack/compose',
    },
    {
        image: react,
        title: 'React',
        subtitle:
            'React is an open-source, front end, JavaScript library for building user interfaces or UI components.',
        link: 'https://reactjs.org/',
    },
    {
        image: springBoot,
        title: 'Spring',
        subtitle:
            'Spring Boot makes it easy to create stand-alone, production-grade Spring-based Applications that you can "just run".',
        link: 'https://spring.io/projects/spring-boot',
    },
]

export const languageTechData: TechDataItem[] = [
    {
        image: java,
        title: 'Java',
        subtitle:
            'Java is a high-level, class-based, object-oriented programming language that is designed to have as few implementation dependencies as possible.',
        link: 'https://www.java.com/',
    },
    {
        image: kotlin,
        title: 'Kotlin',
        subtitle:
            'Kotlin is a cross-platform, statically typed, general-purpose programming language with type inference. Kotlin is designed to be fully interoperable with Java.',
        link: 'https://kotlinlang.org/',
    },
    {
        image: dart,
        title: 'Dart',
        subtitle:
            'Dart is a client-optimized programming language for apps on multiple platforms. It is developed by Google and is used to build mobile, desktop, server, and web applications.',
        link: 'https://dart.dev/',
    },
    {
        image: python,
        title: 'Python',
        subtitle:
            'Python is an interpreted, high-level, general-purpose programming language. Created by Guido van Rossum and first released in 1991.',
        link: 'https://www.python.org/',
    },
    {
        image: typescript,
        title: 'TypeScript',
        subtitle:
            'TypeScript is a strict syntactical superset of JavaScript that adds optional static typing to the language. TypeScript is designed for the development of large applications and transcompiles to JavaScript.',
        link: 'https://www.typescriptlang.org/',
    },
]
