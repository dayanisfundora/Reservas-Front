import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

const A4_LANDSCAPE = { w: 297, h: 210 }
const MARGIN_MM = 10

const UNSAFE_COLOR_RE = /(color-mix|oklch|oklab|lab\(|lch\(|color\()/i

/**
 * html2canvas fails on modern CSS color functions. Flatten cloned subtree to rgb().
 * @param {HTMLElement} root
 */
function sanitizeCloneForHtml2Canvas(root) {
    if (!root || !root.querySelectorAll) return

    const doc = root.ownerDocument
    if (doc) {
        // Remove stylesheet nodes that declare unsupported color functions (clone only)
        doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
            try {
                if (node.tagName === 'STYLE' && UNSAFE_COLOR_RE.test(node.textContent || '')) {
                    node.remove()
                    return
                }
                if (node.tagName === 'LINK') {
                    // Prefer computed/inlined colors over external Quasar sheets during capture
                    node.remove()
                }
            } catch {
                // ignore
            }
        })

        const patch = doc.createElement('style')
        patch.setAttribute('data-export-patch', '1')
        patch.textContent = `
            * {
                box-shadow: none !important;
                text-shadow: none !important;
                filter: none !important;
                backdrop-filter: none !important;
            }
        `
        doc.head?.appendChild(patch)
    }

    const nodes = [root, ...root.querySelectorAll('*')]
    nodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return

        const styleAttr = node.getAttribute('style')
        if (styleAttr && UNSAFE_COLOR_RE.test(styleAttr)) {
            // Keep custom properties / safe parts: rebuild from live computed
            node.removeAttribute('style')
        }

        let computed
        try {
            const id = node.getAttribute('data-export-id')
            const live = id ? document.querySelector(`[data-export-id="${CSS.escape(id)}"]`) : null
            computed = window.getComputedStyle(live || node)
        } catch {
            return
        }

        const colorProps = [
            'color',
            'background-color',
            'border-top-color',
            'border-right-color',
            'border-bottom-color',
            'border-left-color',
            'outline-color',
            'caret-color'
        ]

        colorProps.forEach((prop) => {
            try {
                const value = computed.getPropertyValue(prop)
                if (!value || UNSAFE_COLOR_RE.test(value)) return
                node.style.setProperty(prop, value)
            } catch {
                // skip
            }
        })

        ;['border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
            'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
            'border-radius', 'opacity', 'font-size', 'font-weight', 'padding-top', 'padding-right',
            'padding-bottom', 'padding-left', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
            'display', 'flex-direction', 'gap', 'align-items', 'justify-content', 'grid-template-columns',
            'width', 'min-width', 'max-width', 'height', 'min-height'
        ].forEach((prop) => {
            try {
                const value = computed.getPropertyValue(prop)
                if (value) node.style.setProperty(prop, value)
            } catch {
                // skip
            }
        })
    })
}

/**
 * Capture a DOM element into a landscape A4 PDF (multi-page if tall).
 * html2canvas cannot parse modern CSS color functions (color-mix, color(), oklch…).
 * onclone flattens colors to rgb()/hex so capture does not throw.
 */
export async function captureElementToPdf(element, options = {}) {
    if (!element) {
        throw new Error('No hay contenido para exportar.')
    }

    const title = options.title || 'Calendario'
    const filename = options.filename || `calendario_${Date.now()}.pdf`

    // Mark nodes so the clone can resolve live computed styles
    const marked = []
    element.querySelectorAll('*').forEach((el, idx) => {
        const key = `exp-${idx}`
        el.setAttribute('data-export-id', key)
        marked.push(el)
    })
    element.setAttribute('data-export-id', 'exp-root')
    marked.push(element)

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: Math.max(element.scrollWidth, element.offsetWidth),
            windowHeight: Math.max(element.scrollHeight, element.offsetHeight),
            onclone: (_doc, cloned) => {
                sanitizeCloneForHtml2Canvas(cloned)
            }
        })

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        })

        const pageW = A4_LANDSCAPE.w
        const pageH = A4_LANDSCAPE.h
        const contentW = pageW - MARGIN_MM * 2
        const headerH = 12
        const contentH = pageH - MARGIN_MM * 2 - headerH

        const imgW = contentW
        const imgH = (canvas.height * imgW) / canvas.width
        const pageCanvasH = Math.floor((contentH / imgH) * canvas.height) || canvas.height

        let renderedY = 0
        let pageIndex = 0

        while (renderedY < canvas.height) {
            if (pageIndex > 0) {
                pdf.addPage('a4', 'landscape')
            }

            pdf.setFontSize(11)
            pdf.setTextColor(15, 118, 110)
            pdf.text(title, MARGIN_MM, MARGIN_MM + 5)

            const sliceH = Math.min(pageCanvasH, canvas.height - renderedY)
            const sliceCanvas = document.createElement('canvas')
            sliceCanvas.width = canvas.width
            sliceCanvas.height = sliceH
            const ctx = sliceCanvas.getContext('2d')
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
            ctx.drawImage(
                canvas,
                0,
                renderedY,
                canvas.width,
                sliceH,
                0,
                0,
                canvas.width,
                sliceH
            )

            const sliceImgH = (sliceH * imgW) / canvas.width
            pdf.addImage(
                sliceCanvas.toDataURL('image/jpeg', 0.92),
                'JPEG',
                MARGIN_MM,
                MARGIN_MM + headerH,
                imgW,
                sliceImgH,
                undefined,
                'MEDIUM'
            )

            renderedY += sliceH
            pageIndex += 1
        }

        const blob = pdf.output('blob')
        return { blob, filename }
    } finally {
        marked.forEach((el) => el.removeAttribute('data-export-id'))
    }
}

export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

/**
 * Open PDF blob in a hidden iframe and trigger print.
 * @param {Blob} blob
 * @param {string} [iframeId]
 */
export function printPdfBlob(blob, iframeId = 'calendario-pdf-print-iframe') {
    return new Promise((resolve, reject) => {
        try {
            const url = URL.createObjectURL(blob)
            let iframe = document.getElementById(iframeId)
            if (!iframe) {
                iframe = document.createElement('iframe')
                iframe.id = iframeId
                iframe.style.position = 'fixed'
                iframe.style.right = '0'
                iframe.style.bottom = '0'
                iframe.style.width = '0'
                iframe.style.height = '0'
                iframe.style.border = '0'
                document.body.appendChild(iframe)
            }

            const cleanup = () => {
                URL.revokeObjectURL(url)
            }

            iframe.onload = () => {
                try {
                    iframe.contentWindow.focus()
                    iframe.contentWindow.print()
                    resolve()
                } catch (err) {
                    reject(err)
                } finally {
                    setTimeout(cleanup, 60_000)
                }
            }
            iframe.src = url
        } catch (err) {
            reject(err)
        }
    })
}
