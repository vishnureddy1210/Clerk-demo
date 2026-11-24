import type { PointerEvent } from 'react'

/**
 * Provides lightweight, 60fps CSS-variable-driven 3D pointer tilt handlers
 * for mouse pointers without triggering React re-renders.
 */
export function getTiltHandlers(maxDeg = 5, disabled = false) {
    return {
        onPointerMove(e: PointerEvent<HTMLElement>) {
            if (disabled || e.pointerType !== 'mouse') return
            const el = e.currentTarget
            const rect = el.getBoundingClientRect()
            if (!rect.width || !rect.height) return

            const px = (e.clientX - rect.left) / rect.width
            const py = (e.clientY - rect.top) / rect.height

            const ry = (px - 0.5) * (maxDeg * 2)
            const rx = (0.5 - py) * (maxDeg * 2)

            el.style.setProperty('--rx', `${rx.toFixed(2)}deg`)
            el.style.setProperty('--ry', `${ry.toFixed(2)}deg`)
            el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
            el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
        },
        onPointerLeave(e: PointerEvent<HTMLElement>) {
            const el = e.currentTarget
            el.style.removeProperty('--rx')
            el.style.removeProperty('--ry')
            el.style.removeProperty('--mx')
            el.style.removeProperty('--my')
        },
    }
}
