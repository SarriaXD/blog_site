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
} from '../../../public/images'

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
        title: 'Android Development',
        introduction:
            'I use Java and Kotlin for native Android development, providing robust performance and full access to device features.',
    },
    {
        images: [jetpackCompose, kotlin],
        names: ['Jetpack Compose', 'Kotlin'],
        title: 'Jetpack Compose',
        introduction:
            'I use Jetpack Compose to create declarative user interfaces for both Android and desktop applications, simplifying UI development and supporting multi-platform projects.',
    },
    {
        images: [springBoot, java, kotlin],
        names: ['Spring Boot', 'Java', 'Kotlin'],
        title: 'Spring Backend Development',
        introduction:
            'I use Spring Boot for rapidly developing and deploying enterprise-grade Java applications, with Kotlin offering a more modern and concise syntax option.',
    },
    {
        images: [flutter, dart],
        names: ['Flutter', 'Dart'],
        title: 'Flutter Cross-Platform Development',
        introduction:
            'I use Flutter for building high-performance native applications that run on both iOS and Android platforms from a single codebase.',
    },
    {
        images: [react, typescript],
        names: ['React', 'TypeScript'],
        title: 'Web Development',
        introduction:
            'I use TypeScript and React to build modern, reactive web applications, with TypeScript adding static type checking for enhanced reliability.',
    },
    {
        images: [python],
        names: ['Python'],
        title: 'Data Science & AI',
        introduction:
            'I use Python for data analysis and artificial intelligence development. Python’s rich ecosystem of libraries makes it ideal for processing large datasets, creating machine learning models, and developing AI applications.',
    },
]
