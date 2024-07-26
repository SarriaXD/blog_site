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

export const frameworkTechData = {
    title: 'Frameworks I Excel At',
    subtitle:
        'Building Powerful Applications: Jetpack Compose, Android, Flutter, React, Spring Boot - Leveraging cutting-edge frameworks to create robust, scalable solutions.',
    data: [
        {
            image: android,
            name: 'Android',
        },
        {
            image: flutter,
            name: 'Flutter',
        },
        {
            image: jetpackCompose,
            name: 'Compose',
        },
        {
            image: react,
            name: 'React',
        },
        {
            image: springBoot,
            name: 'Spring',
        },
    ],
}

export const languageTechData = {
    title: 'Languages I Master',
    subtitle:
        'Multi-Language Proficiency: Java, Dart, Python, Kotlin, TypeScript - Harnessing diverse programming languages to efficiently solve complex challenges.',
    data: [
        {
            image: java,
            name: 'Java',
        },
        {
            image: kotlin,
            name: 'Kotlin',
        },
        {
            image: dart,
            name: 'Dart',
        },
        {
            image: python,
            name: 'Python',
        },
        {
            image: typescript,
            name: 'TypeScript',
        },
    ],
}

export const techIntroductions = [
    {
        images: [android, java, kotlin],
        names: ['Android', 'Java', 'Kotlin'],
        introduction:
            'The primary technology stack for developing native Android mobile applications, offering robust performance and full access to device features.',
    },
    {
        images: [jetpackCompose, kotlin],
        names: ['Jetpack Compose', 'Kotlin'],
        introduction:
            'A modern UI toolkit for Android development, using Kotlin to create declarative user interfaces. It simplifies UI development and supports multi-platform projects for desktop and web.',
    },
    {
        images: [flutter, dart],
        names: ['Flutter', 'Dart'],
        introduction:
            "Google's cross-platform development framework for building high-performance native interface applications that run on multiple platforms from a single codebase.",
    },
    {
        images: [react, typescript],
        names: ['React', 'TypeScript'],
        introduction:
            'A popular front-end technology combination for building modern, reactive web applications, with TypeScript adding static type checking for enhanced reliability.',
    },
    {
        images: [python],
        names: ['Python'],
        introduction:
            "My primary tool for data analysis and artificial intelligence. Python's rich ecosystem of libraries makes it ideal for processing large datasets, creating machine learning models, and developing AI applications.",
    },
    {
        images: [springBoot, java, kotlin],
        names: ['Spring Boot', 'Java', 'Kotlin'],
        introduction:
            'A framework for rapidly developing and deploying enterprise-grade Java applications, with Kotlin offering a more modern and concise syntax option.',
    },
]
