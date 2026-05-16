'use client'

import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onClose, title, children, footer }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement
      dialog.showModal()
    } else {
      dialog.close()
      previousFocusRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  // ESC is handled natively by <dialog>
  // Click backdrop to close
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect()
    if (!rect) return
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    )
      onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={[
        'w-[min(640px,calc(100vw-1.5rem))]',
        'max-h-[calc(100dvh-2rem)]',
        'rounded-lg',
        'border border-border-subtle',
        'bg-surface-card',
        'shadow-lg',
        'p-0',
        'overflow-y-auto',
        // Backdrop via CSS (native <dialog>::backdrop)
        'backdrop:bg-black/40 backdrop:backdrop-blur-sm',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Header + body */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h2 font-semibold text-fg-primary">{title}</h2>
          <button
            aria-label="ปิด"
            onClick={onClose}
            className="w-9 h-9 rounded-md flex items-center justify-center text-fg-secondary hover:bg-surface-sunken active:bg-surface-card transition-all duration-[120ms] border-0 bg-transparent text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-5 py-4 border-t border-border-subtle flex justify-between items-center bg-surface-sunken">
          {footer}
        </div>
      )}
    </dialog>
  )
}
