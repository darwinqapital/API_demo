import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  onBack?: () => void
}

export function PhoneFrame({ title, subtitle, children, footer, onBack }: Props) {
  return (
    <div className="phone-frame" role="region" aria-label={title}>
      <div className="phone-frame__header">
        {onBack && (
          <button
            className="phone-frame__back"
            onClick={onBack}
            type="button"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h2 className="phone-frame__title">{title}</h2>
        {subtitle && <p className="phone-frame__subtitle">{subtitle}</p>}
      </div>
      <div className="phone-frame__body">{children}</div>
      {footer && <div className="phone-frame__footer">{footer}</div>}
    </div>
  )
}
