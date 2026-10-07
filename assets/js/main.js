/* sarria.ca — shared behaviour. No dependencies. */
(() => {
    'use strict'

    const reduceMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
    ).matches

    /* ---------- navigation ---------- */

    const burger = document.querySelector('.nav__burger')
    if (burger) {
        const setOpen = (open) => {
            document.body.classList.toggle('menu-open', open)
            burger.setAttribute('aria-expanded', String(open))
        }
        burger.addEventListener('click', () =>
            setOpen(!document.body.classList.contains('menu-open'))
        )
        document
            .querySelectorAll('.nav__menu a')
            .forEach((a) => a.addEventListener('click', () => setOpen(false)))
        window
            .matchMedia('(min-width: 735px)')
            .addEventListener('change', (e) => e.matches && setOpen(false))
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') setOpen(false)
        })
    }

    const here = location.pathname.replace(/\/+$/, '') || '/'
    document.querySelectorAll('.nav a[href^="/"]').forEach((a) => {
        const target = a.getAttribute('href').replace(/\/+$/, '') || '/'
        if (target !== '/' && here.startsWith(target)) {
            a.setAttribute('aria-current', 'page')
        }
    })

    document.querySelectorAll('[data-year]').forEach((el) => {
        el.textContent = String(new Date().getFullYear())
    })

    /* ---------- reveal on scroll ---------- */

    const revealTargets = document.querySelectorAll('.reveal')
    if (revealTargets.length) {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue
                    entry.target.classList.add('is-visible')
                    io.unobserve(entry.target)
                }
            },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
        )
        revealTargets.forEach((el) => io.observe(el))
    }

    /* ---------- scroll-linked motion (parallax + hero fade) ---------- */

    const parallaxItems = Array.from(
        document.querySelectorAll('[data-parallax]')
    ).map((el) => ({
        el,
        ref: el.parentElement,
        factor: parseFloat(el.dataset.parallax) || 0.1,
    }))
    const heroCopy = document.querySelector('.hero__copy')

    if (!reduceMotion && (parallaxItems.length || heroCopy)) {
        let ticking = false

        const update = () => {
            ticking = false
            const vh = window.innerHeight

            for (const { el, ref, factor } of parallaxItems) {
                const r = ref.getBoundingClientRect()
                if (r.bottom < -300 || r.top > vh + 300) continue
                const offset = r.top + r.height / 2 - vh / 2
                el.style.setProperty(
                    '--py',
                    `${(-offset * factor).toFixed(1)}px`
                )
                el.style.transform = `translate3d(0, var(--py), 0)${
                    el.dataset.parallaxBase ? ' ' + el.dataset.parallaxBase : ''
                }`
            }

            if (heroCopy) {
                const y = window.scrollY
                const span = vh * 0.6
                const p = Math.min(1, Math.max(0, y / span))
                heroCopy.style.opacity = String(1 - p)
                heroCopy.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`
            }
        }

        const onScroll = () => {
            if (ticking) return
            ticking = true
            requestAnimationFrame(update)
        }

        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
        update()
    }

    /* ---------- scrolly: sticky stage driven by steps ---------- */

    document.querySelectorAll('[data-scrolly]').forEach((root) => {
        const steps = Array.from(root.querySelectorAll('.step'))
        const scenes = Array.from(root.querySelectorAll('[data-scene]'))
        if (!steps.length) return

        const activate = (i) => {
            steps.forEach((s, j) => s.classList.toggle('is-active', j === i))
            scenes.forEach((s, j) => s.classList.toggle('is-active', j === i))
        }
        activate(0)

        // On phones the chat stage is pinned at the top, so the "active"
        // band sits in the lower part of the viewport instead of the middle.
        const pinned =
            root.dataset.scrolly === 'pinned' &&
            window.matchMedia('(max-width: 734px)').matches
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        activate(steps.indexOf(entry.target))
                    }
                }
            },
            {
                rootMargin: pinned ? '-66% 0px -18% 0px' : '-45% 0px -45% 0px',
                threshold: 0,
            }
        )
        steps.forEach((s) => io.observe(s))
    })

    /* ---------- carousel ---------- */

    document.querySelectorAll('.carousel').forEach((root) => {
        const track = root.querySelector('.carousel__track')
        const prev = root.querySelector('[data-prev]')
        const next = root.querySelector('[data-next]')
        if (!track || !prev || !next) return

        const stepSize = () => {
            const card = track.querySelector('.card')
            return card ? card.getBoundingClientRect().width + 20 : 300
        }
        const sync = () => {
            const max = track.scrollWidth - track.clientWidth - 2
            prev.disabled = track.scrollLeft <= 2
            next.disabled = track.scrollLeft >= max
        }
        prev.addEventListener('click', () =>
            track.scrollBy({ left: -stepSize(), behavior: 'smooth' })
        )
        next.addEventListener('click', () =>
            track.scrollBy({ left: stepSize(), behavior: 'smooth' })
        )
        track.addEventListener('scroll', sync, { passive: true })
        window.addEventListener('resize', sync)
        sync()
    })
})()
