import { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  loading,
  className,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        'px-6 py-3 rounded-xl font-medium transition',
        variant === 'primary' &&
          'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]',
        variant === 'outline' &&
          'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white',
        className
      )}
      {...props}
    >
      {loading ? 'Chargement...' : children}
    </button>
  )
}