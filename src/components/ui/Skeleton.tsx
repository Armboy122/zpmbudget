type Props = {
  width?: string | number
  height?: string | number
  borderRadius?: string
  className?: string
}

export function Skeleton({
  width = '100%',
  height = '1em',
  borderRadius,
  className = '',
}: Props) {
  return (
    <span
      aria-hidden="true"
      className={['block animate-pulse rounded-md bg-surface-sunken', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        height,
        // Only apply borderRadius override when a non-default value is passed
        ...(borderRadius ? { borderRadius } : {}),
      }}
    />
  )
}
