export default function WidthLimit({
  children,
  style,
  maxWidth = '1200px',
  topPadding: top,
  ...props
}: {
  maxWidth?: string | number
  topPadding?: boolean
} & React.HTMLAttributes<HTMLDivElement>) {
  top = top ?? false
  return (
    <div
      style={{
        maxWidth,
        marginLeft: 'auto',
        marginRight: 'auto',
        margin: '0 auto',
        paddingLeft: '1em',
        paddingRight: '1em',
        ...(top ? { paddingTop: '1em' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
