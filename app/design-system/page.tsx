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
    Glass,
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
        <pre className="glass-inset-dark rounded-2xl p-5 font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap text-[#c8d4ea] md:p-6">
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
            <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                {title}
            </h2>
            <p className="max-w-3xl text-base text-[var(--ui-text-secondary)] md:text-lg">
                {subtitle}
            </p>
        </div>
    )
}

const TokenItem = ({ label, value }: { label: string; value: string }) => {
    return (
        <li className="grid grid-cols-[5rem_1fr] items-start gap-3 border-b border-white/12 px-2 py-3 text-sm md:grid-cols-[6rem_1fr] md:px-3">
            <span className="text-[var(--ui-text-secondary)]">{label}</span>
            <span className="min-w-0 font-medium break-words text-white">
                {value}
            </span>
        </li>
    )
}

const LayerItem = ({
    index,
    name,
    description,
}: {
    index: number
    name: string
    description: string
}) => (
    <li className="flex gap-4">
        <span className="glass-inset flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white/80">
            {index}
        </span>
        <div>
            <p className="font-semibold">{name}</p>
            <p className="text-sm text-[var(--ui-text-secondary)]">
                {description}
            </p>
        </div>
    </li>
)

export default function DesignSystemPage() {
    return (
        <>
            <Header />
            <MainLayout>
                <Section className="pt-8 pb-8 md:pt-14 md:pb-12">
                    <Container className="max-w-[1240px] px-6 md:px-10 xl:px-12">
                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card tone="neutral" band={36} className="relative">
                                <div className="pointer-events-none absolute top-14 -left-16 size-64 rounded-full bg-cyan-400/25 blur-[72px]" />
                                <div className="pointer-events-none absolute -top-12 -right-20 size-60 rounded-full bg-violet-500/30 blur-[84px]" />
                                <CardBody className="relative flex flex-col gap-7 p-7 md:p-10 lg:p-12">
                                    <div>
                                        <Chip
                                            value="Liquid Glass"
                                            tone="brand"
                                            size="sm"
                                        />
                                    </div>
                                    <h1 className="max-w-3xl text-4xl leading-[1.03] font-semibold tracking-[-0.045em] md:text-7xl">
                                        Liquid Glass UI Kit
                                    </h1>
                                    <p className="max-w-2xl text-base text-[var(--ui-text-secondary)] md:text-lg">
                                        一套用真实折射写出来的玻璃组件体系：背景模糊与饱和、
                                        边缘透镜折射、流动的高光，以及跟随指针的反光。所有组件
                                        共用同一个 Glass 基元，主题只靠几组 CSS
                                        变量切换。
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button tone="brand">
                                            Start Building
                                        </Button>
                                        <Button tone="neutral" variant="soft">
                                            Read Primitives
                                        </Button>
                                        <Link href="/tools">
                                            <Button
                                                tone="neutral"
                                                variant="ghost"
                                            >
                                                Open Tools
                                            </Button>
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>

                            <Card tone="brand" band={32} className="relative">
                                <div className="pointer-events-none absolute -right-8 -bottom-12 size-64 rounded-full bg-cyan-200/20 blur-[80px]" />
                                <CardBody className="relative flex h-full flex-col justify-between gap-6 p-7 md:p-9 lg:p-10">
                                    <div>
                                        <p className="text-xs tracking-[0.2em] text-cyan-100/80 uppercase">
                                            Foundation Tokens
                                        </p>
                                        <ul className="mt-4">
                                            <TokenItem
                                                label="Tone"
                                                value="neutral / brand / danger / inverse"
                                            />
                                            <TokenItem
                                                label="Variant"
                                                value="solid / soft / ghost / outline"
                                            />
                                            <TokenItem
                                                label="Size"
                                                value="sm / md / lg"
                                            />
                                            <TokenItem
                                                label="Glass"
                                                value="tint / refraction / aberration / band / strength"
                                            />
                                        </ul>
                                    </div>
                                    <div className="glass-inset rounded-2xl p-5">
                                        <p className="text-sm text-cyan-50/90">
                                            Quick Actions
                                        </p>
                                        <div className="mt-3 flex items-center gap-2">
                                            <IconButton
                                                tone="neutral"
                                                aria-label="mail"
                                            >
                                                <Email className="size-4" />
                                            </IconButton>
                                            <IconButton
                                                tone="neutral"
                                                aria-label="linkedin"
                                            >
                                                <Linkedin className="size-4" />
                                            </IconButton>
                                            <IconButton
                                                tone="neutral"
                                                aria-label="github"
                                            >
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
                            title="The Glass Primitive"
                            subtitle="每一块玻璃由四层叠成。前三层是纯 CSS，第二层额外在 Chromium 中用 SVG 位移贴图弯折模糊后的背景，边缘会真实地把画面挤压成一圈透镜。"
                        />
                        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                            <Card tone="neutral" band={30}>
                                <CardBody className="flex flex-col gap-6 p-7 md:p-9">
                                    <ol className="flex flex-col gap-5">
                                        <LayerItem
                                            index={1}
                                            name="Backdrop"
                                            description="blur + saturate + brightness，再铺一层带颗粒的染色。"
                                        />
                                        <LayerItem
                                            index={2}
                                            name="Refraction"
                                            description="按元素尺寸与圆角生成位移贴图，feDisplacementMap 折射边缘。"
                                        />
                                        <LayerItem
                                            index={3}
                                            name="Rim"
                                            description="渐变描边、顶部高光、斜切内阴影与指针跟随的反光。"
                                        />
                                        <LayerItem
                                            index={4}
                                            name="Content"
                                            description="你的内容。"
                                        />
                                    </ol>
                                    <CodeBlock
                                        code={`<Glass tint="brand" interactive aberration band={20}>
  Hello, glass.
</Glass>`}
                                    />
                                </CardBody>
                            </Card>

                            <div className="relative overflow-hidden rounded-[28px]">
                                <div className="absolute inset-0 bg-[conic-gradient(from_210deg_at_50%_50%,#ff9d7e,#ffcf6b,#a6f7c9,#5fd8ff,#c6b4ff,#ffb3c7,#ff9d7e)] opacity-90" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_45%)]" />
                                <div className="relative grid min-h-[360px] place-items-center gap-6 p-8 md:p-12">
                                    <div className="flex flex-wrap items-center justify-center gap-4">
                                        <Glass
                                            tint="clear"
                                            interactive
                                            aberration
                                            band={22}
                                            className="rounded-full px-7 py-4 text-lg font-semibold"
                                        >
                                            Clear
                                        </Glass>
                                        <Glass
                                            tint="neutral"
                                            interactive
                                            band={22}
                                            className="rounded-full px-7 py-4 text-lg font-semibold"
                                        >
                                            Neutral
                                        </Glass>
                                        <Glass
                                            tint="inverse"
                                            interactive
                                            band={22}
                                            className="rounded-full px-7 py-4 text-lg font-semibold"
                                        >
                                            Inverse
                                        </Glass>
                                    </div>
                                    <Glass
                                        tint="clear"
                                        interactive
                                        aberration
                                        band={40}
                                        strength={1}
                                        className="w-full max-w-[420px] rounded-[32px] [--lg-blur:10px]"
                                        contentClassName="p-7"
                                    >
                                        <p className="text-xs tracking-[0.2em] text-white/70 uppercase">
                                            Thick rim · low blur
                                        </p>
                                        <p className="mt-2 text-2xl font-semibold">
                                            看边缘：背景在这里被弯折。
                                        </p>
                                    </Glass>
                                </div>
                            </div>
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
                                <Card tone="neutral" band={30}>
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Pen className="size-5 text-cyan-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Buttons &amp; Intent
                                            </h3>
                                        </div>
                                        <p className="text-[var(--ui-text-secondary)]">
                                            通过 tone 和 variant
                                            表达语义，不再依赖零散颜色类名。
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            <Button tone="brand">
                                                Publish
                                            </Button>
                                            <Button
                                                tone="neutral"
                                                variant="soft"
                                            >
                                                Save Draft
                                            </Button>
                                            <Button
                                                tone="danger"
                                                variant="outline"
                                            >
                                                Delete
                                            </Button>
                                            <Button tone="inverse">
                                                Preview
                                            </Button>
                                        </div>
                                        <CodeBlock
                                            code={`<Button tone="brand">Publish</Button>
<Button tone="neutral" variant="soft">Save Draft</Button>
<Button tone="danger" variant="outline">Delete</Button>
<Button tone="inverse">Preview</Button>`}
                                        />
                                    </CardBody>
                                </Card>

                                <Card tone="neutral" band={30}>
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Book className="size-5 text-cyan-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Card Composition
                                            </h3>
                                        </div>
                                        <p className="text-[var(--ui-text-secondary)]">
                                            卡片负责信息分组，Chip
                                            负责状态标签，组合后即可快速形成内容面板。
                                        </p>
                                        <div className="glass-inset rounded-2xl p-4">
                                            <p className="text-sm text-[var(--ui-text-secondary)]">
                                                Article Status
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <Chip
                                                    value="Draft"
                                                    tone="neutral"
                                                />
                                                <Chip
                                                    value="Review"
                                                    tone="brand"
                                                />
                                                <Chip
                                                    value="Blocked"
                                                    tone="danger"
                                                />
                                                <Chip
                                                    value="Published"
                                                    tone="inverse"
                                                />
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
                                <Card tone="brand" band={30}>
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Check className="size-5 text-cyan-50" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Actions, Tooltip, Loading
                                            </h3>
                                        </div>
                                        <p className="text-cyan-100/85">
                                            图标按钮用于高频操作，Tooltip
                                            提供上下文，Spinner 负责异步反馈。
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Tooltip content="Email">
                                                <IconButton
                                                    tone="neutral"
                                                    aria-label="email"
                                                >
                                                    <Email className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip content="LinkedIn">
                                                <IconButton
                                                    tone="neutral"
                                                    aria-label="linkedin"
                                                >
                                                    <Linkedin className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip content="GitHub">
                                                <IconButton
                                                    tone="neutral"
                                                    aria-label="github"
                                                >
                                                    <Github className="size-5" />
                                                </IconButton>
                                            </Tooltip>
                                            <Button tone="brand" loading>
                                                Saving
                                            </Button>
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

                                <Card tone="neutral" band={30}>
                                    <CardBody className="flex h-full flex-col gap-5 p-7 md:p-9 lg:p-10">
                                        <div className="flex items-center gap-3">
                                            <Warn className="size-5 text-red-200" />
                                            <h3 className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                                                Alert Feedback
                                            </h3>
                                        </div>
                                        <Alert open tone="danger">
                                            Save failed. Please check your
                                            network and retry.
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
