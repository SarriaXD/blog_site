/* Device mockup tool: pick a frame, drop a screenshot, call the API. */
(() => {
    'use strict'

    const API = 'https://api.sarria.ca/mockup-device'
    const ALLOWED = ['image/png', 'image/jpeg']

    const frameButtons = Array.from(document.querySelectorAll('[data-frame]'))
    const framePreview = document.querySelector('#frame-preview')
    const framePanel = document.querySelector('#frame-panel')
    const resultPanel = document.querySelector('#result-panel')
    const resultImg = document.querySelector('#result-img')
    const download = document.querySelector('#download')
    const drop = document.querySelector('#drop')
    const fileInput = document.querySelector('#file')
    const preview = document.querySelector('#preview')
    const remove = document.querySelector('#remove')
    const segmented = document.querySelector('#segmented')
    const optionButtons = Array.from(segmented.querySelectorAll('button'))
    const optionDesc = document.querySelector('#option-desc')
    const generate = document.querySelector('#generate')
    const toast = document.querySelector('#toast')

    let frame = frameButtons[0].dataset.frame
    let option = optionButtons[0].dataset.option
    let file = null
    let resultUrl = null
    let toastTimer = 0

    const showError = (message) => {
        toast.textContent = message
        toast.classList.add('is-open')
        clearTimeout(toastTimer)
        toastTimer = setTimeout(() => toast.classList.remove('is-open'), 4500)
    }

    const syncButton = () => {
        generate.disabled = !file || resultUrl !== null
    }

    const clearResult = () => {
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        resultUrl = null
        resultImg.removeAttribute('src')
        resultPanel.hidden = true
        framePanel.hidden = false
        syncButton()
    }

    /* frames */
    frameButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            frame = btn.dataset.frame
            frameButtons.forEach((b) =>
                b.setAttribute('aria-pressed', String(b === btn))
            )
            framePreview.src = btn.querySelector('img').src
            framePreview.alt = frame
            clearResult()
        })
    })

    /* options */
    optionButtons.forEach((btn, i) => {
        btn.addEventListener('click', () => {
            option = btn.dataset.option
            segmented.dataset.active = String(i)
            optionButtons.forEach((b) =>
                b.setAttribute('aria-pressed', String(b === btn))
            )
            optionDesc.textContent = btn.dataset.desc
            clearResult()
        })
    })

    /* upload */
    const validate = (list) => {
        if (!list || list.length === 0) return 'No file found.'
        if (list.length > 1) return 'Only one image at a time.'
        const type = list[0].type
        if (!type.startsWith('image/')) return 'Only images are allowed.'
        if (!ALLOWED.includes(type)) return 'Only PNG and JPEG images are allowed.'
        return null
    }

    const setFile = (next) => {
        file = next
        const reader = new FileReader()
        reader.onload = (e) => {
            preview.src = e.target.result
            drop.classList.add('has-image')
            clearResult()
        }
        reader.readAsDataURL(next)
    }

    const clearFile = () => {
        file = null
        preview.removeAttribute('src')
        fileInput.value = ''
        drop.classList.remove('has-image')
        clearResult()
    }

    drop.addEventListener('click', (e) => {
        if (file || e.target.closest('#remove')) return
        fileInput.click()
    })
    drop.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !file) {
            e.preventDefault()
            fileInput.click()
        }
    })
    ;['dragenter', 'dragover'].forEach((type) =>
        drop.addEventListener(type, (e) => {
            e.preventDefault()
            drop.classList.add('is-dragging')
        })
    )
    ;['dragleave', 'drop'].forEach((type) =>
        drop.addEventListener(type, (e) => {
            e.preventDefault()
            drop.classList.remove('is-dragging')
        })
    )
    drop.addEventListener('drop', (e) => {
        const error = validate(e.dataTransfer.files)
        if (error) return showError(error)
        setFile(e.dataTransfer.files[0])
    })
    fileInput.addEventListener('change', () => {
        const error = validate(fileInput.files)
        if (error) return showError(error)
        setFile(fileInput.files[0])
    })
    remove.addEventListener('click', (e) => {
        e.stopPropagation()
        clearFile()
    })

    /* generate */
    generate.addEventListener('click', async () => {
        if (!file) return showError('No image selected.')
        generate.disabled = true
        generate.classList.add('is-loading')
        try {
            const body = new FormData()
            body.append('image', file)
            body.append('frame', frame)
            body.append('option', option)
            const res = await fetch(API, { method: 'POST', body })
            if (!res.ok) throw new Error('Image processing failed.')
            const blob = await res.blob()
            resultUrl = URL.createObjectURL(blob)
            resultImg.src = resultUrl
            framePanel.hidden = true
            resultPanel.hidden = false
            resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } catch (err) {
            showError(
                err instanceof TypeError
                    ? 'Could not reach the server. Please try again.'
                    : err.message
            )
        } finally {
            generate.classList.remove('is-loading')
            syncButton()
        }
    })

    download.addEventListener('click', () => {
        if (!resultUrl) return
        const a = document.createElement('a')
        a.href = resultUrl
        a.download = 'mockup.png'
        a.click()
    })

    syncButton()
})()
