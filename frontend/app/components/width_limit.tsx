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
        padding: '0 1em',
        paddingTop: top ? '1em' : 0,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
