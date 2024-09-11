import { retrieveSearch } from '@utils/search-utils.ts'
import { cache } from 'react'

const whoAmI = async () => {
    const resultFromWebsite = await retrieveSearch('https://sarria.ca')
    const resultFromGithub = await retrieveSearch(
        'https://github.com/SarriaXD?tab=repositories'
    )
    return {
        images: [
            ...(resultFromWebsite?.images ?? []),
            ...(resultFromGithub?.images ?? []),
        ],
        results: [
            ...(resultFromWebsite?.results ?? []),
            ...(resultFromGithub?.results ?? []),
            {
                title: 'Resume',
                description: staticResume,
                url: 'https://www.linkedin.com/in/qi-wang-793a562a7',
            },
        ],
    }
}

const staticResume = `Qi Wang
225 Carlton Street Manitoba | (431)-788-6683 | sarria.qi.wang@gmail.com | LinkedIn | GitHub | Personal Site
Profile
Seasoned full-stack engineer with 5+ years of experience, specializing in mobile and backend development:
·\t3 years in Android development, 2 years in backend development 
·\tLanguages: Kotlin (Advanced), Java (Proficient), Dart, Python, TypeScript 
·\tFrameworks & Technologies: Jetpack Compose, React, Flutter, Spring Boot
·\tCloud & DevOps: AWS (EC2, S3, CloudFront), CI/CD (GitHub Workflow, Jenkins, Docker)
·\tDatabase: MySQL, MongoDB, Redis
Self-motivated developer constantly expanding technical horizons. Personal projects include:
·\tManitoba Drive Knowledge Test (Flutter)
\tFirebase Authentication; Beautiful UI & Fun Test; History Storage & Review.
\tLive: https://sarria.ca/#my-flutter-project
\tGitHub: https://github.com/SarriaXD/manitoba_driving_test
·\tPersonal website (React)
\tDesigned and developed a responsive, SEO-optimized personal blog
\tUtilized modern React practices like Next.js, Tailwind CSS, Typescript
\tLive: https://sarria.ca/
\tGitHub: https://github.com/SarriaXD/blog_site
Latest Experience
Senior Software Engineer\tMay 2022 - December 2023
Walt Disney Company\tShanghai, China
·\tMentored junior developers across teams in Kotlin best practices, accelerating the organization-wide adoption of the language.
·\tSpearheaded the DSP architecture overhaul, transitioning from MVC to MVVM using Kotlin, enhancing system efficiency and maintainability.
·\tChampioned Jetpack Compose adoption, boosting team productivity by 50% while significantly improving code quality and project sustainability.
·\tPioneered the rebuilding of legacy View components with Jetpack Compose, establishing a robust foundation for future development.
·\tOptimized video playback through advanced caching techniques and resolved critical memory leaks, dramatically enhancing user experience.
·\tImplemented WebSocket functionality, enabling real-time bidirectional communication between client and server, revolutionizing app responsiveness.
Technologies used: Java, Kotlin, Jetpack Compose, SQLite, WebSocket

Education
Artificial Intelligence Post Graduate Diploma\tJanuary 2024 – January 2025
The University of Winnipeg\tWinnipeg, Canada

Pharmacy Undergraduate Degree\tJuly 2013 – September 2017
Shandong University\tShandong, China

`

const getCachedWhoAmI = cache(whoAmI)

export default getCachedWhoAmI
