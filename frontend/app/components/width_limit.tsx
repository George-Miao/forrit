export default function WidthLimit({
  children,
  style,
  maxWidth = '1200px',
  top,
  ...props
}: {
  maxWidth?: string | number
  top?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  top = top ?? false
  return (
    <div
      style={{
        ...style,
        maxWidth,
        margin: '0 auto',
        padding: '0 1em',
        paddingTop: top ? '1em' : 0,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
