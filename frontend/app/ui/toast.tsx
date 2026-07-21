import { Toast } from '@base-ui/react/toast'

export const toastManager = Toast.createToastManager()

export function notify(title: string, description: unknown) {
  toastManager.add({
    title,
    description:
      typeof description === 'string'
        ? description
        : JSON.stringify(description),
    priority: 'high',
  })
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((toast) => (
    <Toast.Root
      className="ui-panel pointer-events-auto w-80 p-4 data-limited:hidden"
      key={toast.id}
      toast={toast}
    >
      <Toast.Content className="flex items-start gap-3 overflow-hidden">
        <div className="min-w-0 flex-1">
          <Toast.Title className="font-600" />
          <Toast.Description className="mt-1 text-sm text-muted" />
        </div>
        <Toast.Close className="ui-icon-button" aria-label="关闭通知">
          ×
        </Toast.Close>
      </Toast.Content>
    </Toast.Root>
  ))
}

export default function ToastRegion({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Toast.Provider toastManager={toastManager} timeout={4000}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="pointer-events-none fixed right-4 top-4 z-200 flex w-[calc(100%-2rem)] max-w-80 flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
