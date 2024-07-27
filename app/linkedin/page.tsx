// import { redirect } from 'next/navigation'

import { Spinner, Typography } from '../components/Material.tsx'

export default function Page() {
    // redirect('https://www.linkedin.com/in/qi-wang-793a562a7')

    return (
        <main>
            <div className="flex min-h-[100vh] flex-col items-center justify-center gap-16 bg-black">
                <Spinner className="size-24" />
                <Typography variant="h2">Redirecting to Linkedin</Typography>
            </div>
        </main>
    )
}
