import Link from 'next/link'
import { Footer } from '@components/layout/footer.tsx'
import { Header } from '@components/layout/header.tsx'
import {
    Alert,
    Button,
    Card,
    CardBody,
    Chip,
    Container,
    IconButton,
    MainLayout,
    Section,
    Spinner,
    Stack,
    Tooltip,
} from '@components/ui/ui-kit.tsx'
import { Book, Check, Email, Github, Linkedin, Pen, Warn } from '@public/icons'

const CodeBlock = ({ code }: { code: string }) => {
    return (
        <pre className="whitespace-pre-wrap break-words rounded-2xl border border-white/12 bg-[#050912]/84 p-5 font-mono text-[13px] leading-relaxed text-[#c8d4ea] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6 lg:p-7">
            <code>{code}</code>
        </pre>
    )
}

const SectionTitle = ({
    title,
    subtitle,
}: {
    title: string
    subtitle: string
}) => {
    return (
        <div className="mb-6 flex flex-col gap-3 md:mb-8">
            <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">{title}</h2>
            <p className="max-w-3xl text-base text-[var(--ui-text-secondary)] md:text-lg">
                {subtitle}
            </p>
        </div>
    )
}

const TokenItem = ({ label, value }: { label: string; value: string }) => {
    return (
        <li className="grid grid-cols-[4.5rem_1fr] items-start gap-3 border-b border-white/12 px-2 py-3 text-sm md:grid-cols-[5.5rem_1fr] md:px-3">
            <span className="text-[var(--ui-text-secondary)]">{label}</span>
            <span className="min-w-0 break-words font-medium text-white">{value}</span>
        </li>
    )
}

export default function DesignSystemPage() {
    return (
        <>
            <Header />
            <MainLayout>
                <Section className="pb-8 pt-12 md:pb-12 md:pt-20">
                    <Container className="max-w-[1240px] px-6 md:px-10 xl:px-12">
                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card tone="neutral" className="relative overflow-hidden">
                                <div className="pointer-events-none absolute -left-16 top-14 size-64 rounded-full bg-cyan-400/20 blur-[72px]" />
                                <div className="pointer-events-none absolute -right-20 -top-12 size-60 rounded-full bg-blue-500/30 blur-[84px]" />
                                <CardBody className="relative flex flex-col gap-7 p-7 md:p-10 lg:p-12">
                                    <Chip value="Custom Theme" tone="brand" size="sm" />
                                    <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.045em] md:text-7xl">
                                        Aurora Glass UI Kit
                                    </h1>
                                    <p className="max-w-2xl text-base text-[var(--ui-text-secondary)] md:text-lg">
                                        这是一套彻底重做的基础组件体系。核心目标是更干净的视觉层级、
                                        更稳定的交互语义，以及可以快速扩展的主题能力。
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button tone="brand">Start Building</Button>
                                        <Button tone="neutral" variant="soft">
                                            Read Primitives
                                        </Button>
                                        <Link href="/tools">
                                            <Button tone="neutral" variant="ghost">
                                                Open Tools
                                            </Button>
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card tone="brand" className="relative overflow-hidden">
                                <div className="pointer-events-none absolute -bottom-12 -right-8 size-64 rounded-full bg-cyan-200/20 blur-[80px]" />
                                <CardBody className="relative flex h-full flex-col justify-between gap-6 p-7 md:p-9 lg:p-10">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/80">
                                            Foundation Tokens
                                        </p>
                                        <ul className="mt-4">
                                            <TokenItem label="Tone" value="neutral / brand / danger / inverse" />
                                            <TokenItem label="Variant" value="solid / soft / ghost / outline" />
                                            <TokenItem label="Size" value="sm / md / lg" />
                                        </ul>
                                    </div>
                                    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                                        <p className="text-sm text-cyan-50/90">Quick Actions</p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <IconButton tone="neutral" aria-label="mail">
                                                <Email className="size-4" />
                                            </IconButton>
                                            <IconButton tone="neutral" aria-label="linkedin">
                                                <Linkedin className="size-4" />
                                            </IconButton>
                                            <IconButton tone="neutral" aria-label="github">
                                                <Github className="size-4" />
                                            </IconButton>
                                            <Spinner className="ml-1 size-4 text-cyan-100" />
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </Container>
                </Section>

                <Section className="py-8 md:py-12">
                    <Container className="max-w-[1240px] px-6 md:px-10 xl:px-12">
                        <SectionTitle
                            title="Core Primitives"
                            subtitle="基础组件覆盖布局、操作、状态反馈三个层面。每个例子都给出最小可复用写法。"
                        />

                        <Stack space="lg">
                            <div className="grid gap-6 xl:grid-cols-2">
                                <Card tone="neutral" className="overflow-hidden">
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Pen className="size-5 text-cyan-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Buttons & Intent
                                            </h3>
                                        </div>
                                        <p className="text-[var(--ui-text-secondary)]">
                                            通过 `tone` 和 `variant` 表达语义，不再依赖零散颜色类名。
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <Button tone="brand">Publish</Button>
                                            <Button tone="neutral" variant="soft">
                                                Save Draft
                                            </Button>
                                            <Button tone="danger" variant="outline">
                                                Delete
                                            </Button>
                                            <Button tone="inverse">Preview</Button>
                                        </div>
                                        <CodeBlock
                                            code={`<Button tone="brand">Publish</Button>
<Button tone="neutral" variant="soft">Save Draft</Button>
<Button tone="danger" variant="outline">Delete</Button>
<Button tone="inverse">Preview</Button>`}
                                        />
                                    </CardBody>
                                </Card>

                                <Card tone="neutral" className="overflow-hidden">
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Book className="size-5 text-cyan-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Card Composition
                                            </h3>
                                        </div>
                                        <p className="text-[var(--ui-text-secondary)]">
                                            卡片负责信息分组，Chip 负责状态标签，组合后即可快速形成内容面板。
                                        </p>
                                        <div className="rounded-2xl border border-white/12 bg-[#091221]/80 p-4">
                                            <p className="text-sm text-[var(--ui-text-secondary)]">Article Status</p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Chip value="Draft" tone="neutral" />
                                                <Chip value="Review" tone="brand" />
                                                <Chip value="Blocked" tone="danger" />
                                                <Chip value="Published" tone="inverse" />
                                            </div>
                                        </div>
                                        <CodeBlock
                                            code={`<Card tone="neutral">
  <CardBody>
    <Chip value="Review" tone="brand" />
  </CardBody>
</Card>`}
                                        />
                                    </CardBody>
                                </Card>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                                <Card tone="brand" className="overflow-hidden">
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Check className="size-5 text-cyan-50" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Actions, Tooltip, Loading
                                            </h3>
                                        </div>
                                        <p className="text-cyan-100/85">
                                            图标按钮用于高频操作，Tooltip 提供上下文，Spinner 负责异步反馈。
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Tooltip content="Email">
                                                <IconButton tone="neutral" aria-label="email">
                                                    <Email className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip content="LinkedIn">
                                                <IconButton tone="neutral" aria-label="linkedin">
                                                    <Linkedin className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip content="GitHub">
                                                <IconButton tone="neutral" aria-label="github">
                                                    <Github className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Spinner className="size-5 text-cyan-100" />
                                        </div>
                                        <CodeBlock
                                            code={`<Tooltip content="GitHub">
  <IconButton tone="neutral" aria-label="github">
    <Github className="size-5" />
  </IconButton>
</Tooltip>`}
                                        />
                                    </CardBody>
                                </Card>

                                <Card tone="neutral" className="overflow-hidden">
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Warn className="size-5 text-red-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Alert Feedback
                                            </h3>
                                        </div>
                                        <Alert open tone="danger">
                                            Save failed. Please check your network and retry.
                                        </Alert>
                                        <Alert open tone="brand">
                                            Tokens synced successfully.
                                        </Alert>
                                        <CodeBlock
                                            code={`<Alert open tone="danger">
  Save failed. Please check your network and retry.
</Alert>`}
                                        />
                                    </CardBody>
                                </Card>
                            </div>
                        </Stack>
                    </Container>
                </Section>
            </MainLayout>
            <Footer />
        </>
    )
}
