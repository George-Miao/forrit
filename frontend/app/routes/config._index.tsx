import type { MetaFunction } from '@remix-run/react'
import {
  type ConfigField,
  type ConfigSourceInput,
  type ConfigSourceView,
  type ConfigUpdate,
  type ConfigValue,
  type ConfigView,
  getConfiguration,
  updateConfiguration,
  useConfiguration,
} from 'app/client'
import Loading from 'app/components/loading'
import PageHeader from 'app/components/page_header'
import WidthLimit from 'app/components/width_limit'
import Button from 'app/ui/button'
import Icon from 'app/ui/icon'
import { Tab, TabIndicator, TabList, TabPanel, TabRoot } from 'app/ui/tabs'
import { notify } from 'app/ui/toast'
import { type KeyboardEvent, useEffect, useRef, useState } from 'react'

export const meta: MetaFunction = () => [{ title: '配置 | Forrit' }]

type Draft = boolean | string

type Choice = {
  label: string
  value: string
  disabled?: boolean
}

const labels: Record<string, string> = {
  '/resolver/tmdb_api_key': 'TMDB API 密钥',
  '/resolver/tmdb_rate_limit': 'TMDB 每秒请求数',
  '/resolver/index/enable': '启用索引更新',
  '/resolver/index/start_at_begin': '启动时从头索引',
  '/resolver/index/interval': '索引更新间隔',
  '/subscription/exclude': '全局排除规则',
  '/downloader/type': '下载器',
  '/downloader/check_interval': '下载状态检查间隔',
  '/downloader/savepath': '保存目录',
  '/downloader/url': '服务地址',
  '/downloader/username': '用户名',
  '/downloader/password': '密码',
  '/downloader/rename/enable': '启用重命名',
  '/downloader/rename/interval': '重命名检查间隔',
  '/downloader/rename/format': '重命名格式',
  '/http/webui': '启用网页界面',
  '/http/log': '记录 HTTP 请求',
  '/http/debug': '显示详细错误',
  '/http/doc/enable': '启用 API 文档',
  '/http/doc/path': 'API 文档路径',
  '/http/auth/type': '访问认证',
  '/http/auth/username': '认证用户名',
  '/http/auth/password': '认证密码',
}

const fieldLabels: Record<string, string> = {
  enable: '启用',
  url: '源地址',
  update_interval: '更新间隔',
  deny_non_torrent: '拒绝非种子项目',
  zone: '分区',
  page: '起始页',
  load_history_pages: '历史加载页数',
  category: '分类',
}

const choices: Record<string, Choice[]> = {
  '/downloader/type': [
    { label: '禁用', value: 'disabled' },
    { label: 'qBittorrent', value: 'qbittorrent' },
    {
      label: 'Transmission（暂不支持）',
      value: 'transmission',
      disabled: true,
    },
  ],
  '/downloader/rename/format': [
    { label: '完整标题', value: 'full' },
    { label: '短标题', value: 'short' },
  ],
  '/http/auth/type': [
    { label: '无认证', value: 'none' },
    { label: '基础认证', value: 'basic' },
  ],
}

const inputClass =
  'ui-focus w-full rounded-md border border-edge bg-surface px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-background disabled:text-muted'

const saveDelay = 500

function valuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (Array.isArray(left) && Array.isArray(right))
    return (
      left.length === right.length &&
      left.every((value, index) => valuesEqual(value, right[index]))
    )
  if (
    left === null ||
    right === null ||
    typeof left !== 'object' ||
    typeof right !== 'object'
  )
    return false

  const leftEntries = Object.entries(left)
  const rightRecord = right as Record<string, unknown>
  return (
    leftEntries.length === Object.keys(rightRecord).length &&
    leftEntries.every(([key, value]) =>
      valuesEqual(value, rightRecord[key]),
    )
  )
}

function message(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>
    if (typeof value.brief === 'string') return value.brief
    if (typeof value.detail === 'string') return value.detail
  }
  return '配置保存失败'
}

function isConflict(error: unknown): boolean {
  return message(error).toLowerCase().includes('conflict')
}

function displayValue(field: ConfigField): Draft {
  if (typeof field.value === 'boolean') return field.value
  if (Array.isArray(field.value)) return field.value.join('\n')
  if (field.value === null || field.value === undefined) return ''
  return String(field.value)
}

function isInteger(path: string): boolean {
  return (
    path === '/resolver/tmdb_rate_limit' ||
    path.endsWith('/zone') ||
    path.endsWith('/page') ||
    path.endsWith('/load_history_pages')
  )
}

function isNullable(path: string): boolean {
  return (
    path === '/downloader/savepath' ||
    path.endsWith('/zone') ||
    path.endsWith('/page') ||
    path.endsWith('/load_history_pages')
  )
}

function parseValue(field: ConfigField, draft: Draft): ConfigValue {
  if (typeof draft === 'boolean') return draft
  const value = draft.trim()

  if (field.path === '/subscription/exclude') {
    const expressions = draft
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
    for (const expression of expressions) new RegExp(expression)
    return expressions
  }
  if (isNullable(field.path) && value === '') return null
  if (isInteger(field.path)) {
    const number = Number(value)
    if (!Number.isSafeInteger(number) || number <= 0)
      throw new Error('请输入正整数')
    return number
  }
  if (field.path.endsWith('interval')) {
    if (!durationPattern.test(value))
      throw new Error('请输入时间，例如 30s、5m 或 2h')
  }
  if (field.path.endsWith('/url')) {
    const url = new URL(value)
    if (url.protocol !== 'http:' && url.protocol !== 'https:')
      throw new Error('地址必须使用 HTTP 或 HTTPS')
  }
  if (field.path === '/http/doc/path') {
    if (!value.startsWith('/')) throw new Error('路径必须以 / 开头')
    const path = value.replace(/\/+$/, '')
    if (path === '/api' || path.startsWith('/api/'))
      throw new Error('路径不能使用保留的 /api')
  }
  if (field.path.endsWith('/category') && !/^\d+_\d+$/.test(value))
    throw new Error('分类格式必须为“分类_子分类”')
  return value
}

function sourceName(path: string): string {
  const encoded = path.split('/')[2] ?? ''
  return encoded.replaceAll('~1', '/').replaceAll('~0', '~')
}

function label(field: ConfigField): string {
  return (
    labels[field.path] ??
    fieldLabels[field.path.split('/').at(-1) ?? ''] ??
    field.path
  )
}

function Toggle({
  checked,
  disabled,
  label,
  onChange,
}: {
  checked: boolean
  disabled: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`ui-focus relative h-6 w-11 shrink-0 rounded-full border-0 transition ${
        checked ? 'bg-accent' : 'bg-[rgb(28_31_35/20%)]'
      } disabled:cursor-not-allowed disabled:opacity-45`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      role="switch"
      type="button"
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? 'left-5.5' : 'left-0.5'
        }`}
      />
    </button>
  )
}

type FieldEditorProps = {
  draft: Draft
  dirty: boolean
  error?: string
  field: ConfigField
  saving: boolean
  onChange: (draft: Draft) => void
  onInvalid: (error: string) => void
  onCommit: (value: ConfigValue) => void
  onUnset: () => void
}

function FieldEditor({
  draft,
  dirty,
  error,
  field,
  saving,
  onChange,
  onCommit,
  onInvalid,
  onUnset,
}: FieldEditorProps) {
  const disabled = field.locked || saving
  const canUnset = !field.secret && field.source === 'ui' && !field.locked
  const onCommitRef = useRef(onCommit)
  const onInvalidRef = useRef(onInvalid)
  onCommitRef.current = onCommit
  onInvalidRef.current = onInvalid

  useEffect(() => {
    if (
      !dirty ||
      field.secret ||
      typeof field.value === 'boolean' ||
      choices[field.path]
    )
      return

    const timer = window.setTimeout(() => {
      try {
        const value = parseValue(field, draft)
        if (!valuesEqual(field.value, value)) onCommitRef.current(value)
      } catch (error) {
        onInvalidRef.current(message(error))
      }
    }, saveDelay)
    return () => window.clearTimeout(timer)
  }, [dirty, draft, field])

  const commit = (value: ConfigValue) => {
    if (!field.secret && valuesEqual(field.value, value)) return
    onCommitRef.current(value)
  }
  const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    event.currentTarget.blur()
  }

  let control: React.ReactNode
  if (field.secret) {
    control = (
      <div className="flex flex-wrap gap-2">
        <input
          aria-label={label(field)}
          autoComplete="new-password"
          className={`${inputClass} min-w-52 flex-1`}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.secret_set ? '已设置，输入新值以替换' : '未设置'}
          type="password"
          value={String(draft)}
        />
        <Button
          disabled={disabled || String(draft).length === 0}
          onClick={() => commit(String(draft))}
          type="button"
        >
          替换
        </Button>
        <Button
          disabled={saving || field.source !== 'ui'}
          onClick={onUnset}
          type="button"
          variant="ghost"
        >
          清除
        </Button>
      </div>
    )
  } else if (typeof field.value === 'boolean') {
    control = (
      <Toggle
        checked={Boolean(draft)}
        disabled={disabled}
        label={label(field)}
        onChange={(value) => {
          if (
            field.path === '/http/webui' &&
            !value &&
            !window.confirm(
              '关闭网页界面后，需要通过配置文件或 API 重新启用。是否继续？',
            )
          )
            return
          onChange(value)
          commit(value)
        }}
      />
    )
  } else if (choices[field.path]) {
    control = (
      <select
        aria-label={label(field)}
        className={inputClass}
        disabled={disabled}
        onChange={(event) => {
          onChange(event.target.value)
          commit(event.target.value)
        }}
        value={String(draft)}
      >
        {choices[field.path].map((choice) => (
          <option
            disabled={choice.disabled}
            key={choice.value}
            value={choice.value}
          >
            {choice.label}
          </option>
        ))}
      </select>
    )
  } else if (field.path === '/subscription/exclude') {
    control = (
      <textarea
        aria-label={label(field)}
        className={`${inputClass} min-h-28 resize-y font-mono`}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder="每行一个正则表达式"
        value={String(draft)}
      />
    )
  } else {
    control = (
      <input
        aria-label={label(field)}
        className={inputClass}
        disabled={disabled}
        inputMode={isInteger(field.path) ? 'numeric' : 'text'}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onEnter}
        type={isInteger(field.path) ? 'number' : 'text'}
        value={String(draft)}
      />
    )
  }

  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(16rem,1.2fr)] sm:items-start">
      <div>
        <div className="flex items-center gap-2">
          <label className="font-500">{label(field)}</label>
          {saving ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border border-edge border-t-accent" />
          ) : null}
        </div>
      </div>
      <div>
        <div
          className={`flex gap-2 ${
            typeof field.value === 'boolean' ? 'items-center' : 'items-start'
          }`}
        >
          <div
            className={
              typeof field.value === 'boolean' ? 'shrink-0' : 'min-w-0 flex-1'
            }
          >
            {control}
          </div>
          {canUnset ? (
            <button
              aria-label={`清除${label(field)}覆盖`}
              className="ui-focus flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-edge bg-surface text-muted transition hover:border-accent hover:text-text disabled:cursor-not-allowed disabled:opacity-45"
              disabled={saving}
              onClick={onUnset}
              title="清除覆盖"
              type="button"
            >
              <Icon className="text-base" name="x" />
            </button>
          ) : null}
        </div>
        <div className="mt-1 min-h-5">
          <span
            className="text-xs text-danger"
            role={error ? 'alert' : undefined}
          >
            {error}
          </span>
        </div>
      </div>
    </div>
  )
}

function CredentialsSetup({
  buttonLabel,
  description,
  disabled,
  error,
  password,
  saving,
  title,
  username,
  onEnable,
  onPasswordChange,
  onUsernameChange,
}: {
  buttonLabel: string
  description: string
  disabled: boolean
  error?: string
  password: string
  saving: boolean
  title: string
  username: string
  onEnable: () => void
  onPasswordChange: (value: string) => void
  onUsernameChange: (value: string) => void
}) {
  return (
    <div className="grid gap-3 py-4 sm:grid-cols-[minmax(12rem,0.8fr)_minmax(16rem,1.2fr)]">
      <div>
        <div className="font-500">{title}</div>
      </div>
      <div className="grid gap-2">
        <p className="m-0 text-sm text-muted">{description}</p>
        <input
          aria-label={`${title}用户名`}
          autoComplete="username"
          className={inputClass}
          disabled={disabled || saving}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="用户名"
          value={username}
        />
        <input
          aria-label={`${title}密码`}
          autoComplete="new-password"
          className={inputClass}
          disabled={disabled || saving}
          onChange={(event) => onPasswordChange(event.target.value)}
          placeholder="密码"
          type="password"
          value={password}
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className="text-xs text-danger"
            role={error ? 'alert' : undefined}
          >
            {error}
          </span>
          <Button
            disabled={disabled || saving}
            onClick={onEnable}
            type="button"
            variant="primary"
          >
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

type SourceKind = ConfigSourceView['kind']

const sourceKindLabels: Record<SourceKind, string> = {
  rss: 'RSS',
  acg_rip: 'acg.rip',
  nyaa: 'Nyaa',
}

const durationPattern = /^(\d+(?:\.\d+)?\s*(?:ns|us|µs|ms|s|m|h|d|w)\s*)+$/

function optionalPositiveInteger(
  value: string,
  label: string,
  maximum: number,
): number | null {
  if (!value.trim()) return null
  const number = Number(value)
  if (!Number.isSafeInteger(number) || number <= 0 || number > maximum)
    throw new Error(`${label}必须是 1 到 ${maximum} 之间的整数`)
  return number
}

function SourceCreator({
  names,
  saving,
  onCreate,
}: {
  names: string[]
  saving: boolean
  onCreate: (name: string, source: ConfigSourceInput) => Promise<string | null>
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [kind, setKind] = useState<SourceKind>('rss')
  const [enable, setEnable] = useState(true)
  const [url, setUrl] = useState('')
  const [interval, setInterval] = useState('5m')
  const [category, setCategory] = useState('1_3')
  const [zone, setZone] = useState('')
  const [page, setPage] = useState('')
  const [historyPages, setHistoryPages] = useState('')
  const [denyNonTorrent, setDenyNonTorrent] = useState(false)
  const [error, setError] = useState('')

  const close = () => {
    setOpen(false)
    setName('')
    setKind('rss')
    setEnable(true)
    setUrl('')
    setInterval('5m')
    setCategory('1_3')
    setZone('')
    setPage('')
    setHistoryPages('')
    setDenyNonTorrent(false)
    setError('')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const sourceName = name.trim()
      if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(sourceName))
        throw new Error('名称必须使用 1 到 64 个字母、数字、点、下划线或连字符')
      if (names.includes(sourceName)) throw new Error('该名称已存在')
      if (!durationPattern.test(interval.trim()))
        throw new Error('更新间隔格式无效，例如 5m 或 2h')

      let source: ConfigSourceInput
      if (kind === 'rss') {
        const parsedUrl = new URL(url)
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:')
          throw new Error('源地址必须使用 HTTP 或 HTTPS')
        source = {
          type: 'rss',
          enable,
          url,
          update_interval: interval,
          deny_non_torrent: denyNonTorrent,
        }
      } else if (kind === 'acg_rip') {
        source = {
          type: 'acg_rip',
          enable,
          update_interval: interval,
          zone: optionalPositiveInteger(zone, '分区', 255),
          page: optionalPositiveInteger(page, '起始页', 255),
          deny_non_torrent: denyNonTorrent,
          load_history_pages: optionalPositiveInteger(
            historyPages,
            '历史加载页数',
            4_294_967_295,
          ),
        }
      } else {
        if (!/^\d+_\d+$/.test(category))
          throw new Error('分类格式必须为“分类_子分类”')
        source = {
          type: 'nyaa',
          enable,
          update_interval: interval,
          category,
          load_history_pages: optionalPositiveInteger(
            historyPages,
            '历史加载页数',
            4_294_967_295,
          ),
        }
      }

      setError('')
      const failure = await onCreate(sourceName, source)
      if (failure) setError(failure)
      else close()
    } catch (error) {
      setError(message(error))
    }
  }

  return (
    <section className="ui-panel overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="m-0 text-lg font-600">订阅源</h2>
          <p className="mb-0 mt-1 text-sm text-muted">
            配置订阅源
          </p>
        </div>
        <Button onClick={() => (open ? close() : setOpen(true))} type="button">
          {open ? '取消' : '新增源'}
        </Button>
      </div>
      {open ? (
        <form
          className="grid gap-4 border-t border-edge px-5 py-5 sm:grid-cols-2"
          onSubmit={submit}
        >
          <label className="grid gap-1 text-sm">
            <span>名称</span>
            <input
              autoFocus
              className={inputClass}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如 anime"
              value={name}
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span>类型</span>
            <select
              className={inputClass}
              disabled={saving}
              onChange={(event) => setKind(event.target.value as SourceKind)}
              value={kind}
            >
              {Object.entries(sourceKindLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span>更新间隔</span>
            <input
              className={inputClass}
              disabled={saving}
              onChange={(event) => setInterval(event.target.value)}
              value={interval}
            />
          </label>
          {kind === 'rss' ? (
            <label className="grid gap-1 text-sm">
              <span>源地址</span>
              <input
                className={inputClass}
                disabled={saving}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/feed.xml"
                value={url}
              />
            </label>
          ) : null}
          {kind === 'nyaa' ? (
            <label className="grid gap-1 text-sm">
              <span>分类</span>
              <input
                className={inputClass}
                disabled={saving}
                onChange={(event) => setCategory(event.target.value)}
                value={category}
              />
            </label>
          ) : null}
          {kind === 'acg_rip' ? (
            <>
              <label className="grid gap-1 text-sm">
                <span>分区</span>
                <input
                  className={inputClass}
                  disabled={saving}
                  inputMode="numeric"
                  onChange={(event) => setZone(event.target.value)}
                  placeholder="全部"
                  value={zone}
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span>起始页</span>
                <input
                  className={inputClass}
                  disabled={saving}
                  inputMode="numeric"
                  onChange={(event) => setPage(event.target.value)}
                  placeholder="默认"
                  value={page}
                />
              </label>
            </>
          ) : null}
          {kind !== 'rss' ? (
            <label className="grid gap-1 text-sm">
              <span>历史加载页数</span>
              <input
                className={inputClass}
                disabled={saving}
                inputMode="numeric"
                onChange={(event) => setHistoryPages(event.target.value)}
                placeholder="不加载"
                value={historyPages}
              />
            </label>
          ) : null}
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>启用</span>
            <Toggle
              checked={enable}
              disabled={saving}
              label="启用新订阅源"
              onChange={setEnable}
            />
          </div>
          {kind !== 'nyaa' ? (
            <div className="flex items-center justify-between gap-3 text-sm">
              <span>拒绝非种子项目</span>
              <Toggle
                checked={denyNonTorrent}
                disabled={saving}
                label="拒绝非种子项目"
                onChange={setDenyNonTorrent}
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 sm:col-span-2">
            <span
              className="text-xs text-danger"
              role={error ? 'alert' : undefined}
            >
              {error}
            </span>
            <Button disabled={saving} type="submit" variant="primary">
              创建
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

function Section({
  action,
  before,
  description,
  fields,
  title,
  renderField,
}: {
  action?: React.ReactNode
  before?: React.ReactNode
  description: string
  fields: ConfigField[]
  title: string
  renderField: (field: ConfigField) => React.ReactNode
}) {
  if (fields.length === 0 && !before) return null
  return (
    <section className="ui-panel overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-edge px-5 py-4">
        <div>
          <h2 className="m-0 text-lg font-600">{title}</h2>
          <p className="mb-0 mt-1 text-sm text-muted">{description}</p>
        </div>
        {action}
      </div>
      <div className="divide-y divide-edge px-5">
        {before}
        {fields.map(renderField)}
      </div>
    </section>
  )
}

function ConfigurationEditor({ initial }: { initial: ConfigView }) {
  const [view, setView] = useState(initial)
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const viewRef = useRef(view)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    viewRef.current = view
  }, [view])

  const setDraft = (path: string, draft: Draft) => {
    setDrafts((current) => ({ ...current, [path]: draft }))
    setErrors((current) => {
      const next = { ...current }
      delete next[path]
      return next
    })
  }

  const commit = (paths: string[], changes: ConfigUpdate['changes']) => {
    setSaving((current) => new Set([...current, ...paths]))
    const run = async () => {
      try {
        const next = await updateConfiguration({
          revision: viewRef.current.revision,
          changes,
        })
        viewRef.current = next
        setView(next)
        setDrafts((current) => {
          const updated = { ...current }
          for (const path of paths) delete updated[path]
          return updated
        })
        setErrors((current) => {
          const updated = { ...current }
          for (const path of paths) delete updated[path]
          return updated
        })
        setSavedAt(new Date())
        return null
      } catch (error) {
        const detail = message(error)
        if (isConflict(error)) {
          try {
            const latest = await getConfiguration()
            viewRef.current = latest
            setView(latest)
          } catch (reloadError) {
            notify('配置刷新失败', reloadError)
          }
          notify(
            '配置已在其他位置更改',
            '已刷新服务器值，并保留当前草稿。请再次保存。',
          )
        } else {
          setErrors((current) => ({
            ...current,
            ...Object.fromEntries(paths.map((path) => [path, detail])),
          }))
        }
        return detail
      } finally {
        setSaving((current) => {
          const next = new Set(current)
          for (const path of paths) next.delete(path)
          return next
        })
      }
    }
    const operation = queue.current.then(run, run)
    queue.current = operation.then(() => undefined)
    return operation
  }

  const renderField = (field: ConfigField) => (
    <FieldEditor
      draft={drafts[field.path] ?? displayValue(field)}
      dirty={Object.hasOwn(drafts, field.path)}
      error={errors[field.path]}
      field={field}
      key={field.path}
      onChange={(draft) => setDraft(field.path, draft)}
      onCommit={(value) =>
        commit([field.path], [{ op: 'set', path: field.path, value }])
      }
      onInvalid={(error) =>
        setErrors((current) => ({ ...current, [field.path]: error }))
      }
      onUnset={() => commit([field.path], [{ op: 'unset', path: field.path }])}
      saving={saving.has(field.path)}
    />
  )

  const resolver = view.fields.filter((field) =>
    field.path.startsWith('/resolver/'),
  )
  const subscription = view.fields.filter((field) =>
    field.path.startsWith('/subscription/'),
  )
  const downloader = view.fields.filter((field) =>
    field.path.startsWith('/downloader/'),
  )
  const http = view.fields.filter((field) => field.path.startsWith('/http/'))
  const sources = view.fields
    .filter((field) => field.path.startsWith('/sourcer/'))
    .reduce((groups, field) => {
      const name = sourceName(field.path)
      const fields = groups.get(name) ?? []
      fields.push(field)
      groups.set(name, fields)
      return groups
    }, new Map<string, ConfigField[]>())
  const sourceSaving = [...saving].some((path) => path.startsWith('/sourcer/'))
  const createSource = (name: string, source: ConfigSourceInput) =>
    commit([`/sourcer/${name}`], [{ op: 'create_source', name, source }])
  const deleteSource = (source: ConfigSourceView) => {
    if (!window.confirm(`删除订阅源“${source.name}”？此操作会立即生效。`))
      return
    void commit(
      [`/sourcer/${source.name}`],
      [{ op: 'delete_source', name: source.name }],
    )
  }
  const authType = http.find((field) => field.path === '/http/auth/type')
  const configureAuth = authType?.value === 'none'
  const authUsernamePath = '/http/auth/username'
  const authPasswordPath = '/http/auth/password'
  const authUsername = String(drafts[authUsernamePath] ?? '')
  const authPassword = String(drafts[authPasswordPath] ?? '')
  const authSaving =
    saving.has(authUsernamePath) || saving.has(authPasswordPath)
  const enableBasicAuth = () => {
    const nextErrors: Record<string, string> = {}
    if (!authUsername) nextErrors[authUsernamePath] = '请输入用户名'
    if (!authPassword) nextErrors[authPasswordPath] = '请输入密码'
    if (Object.keys(nextErrors).length) {
      setErrors((current) => ({ ...current, ...nextErrors }))
      return
    }
    commit(
      ['/http/auth/type', authUsernamePath, authPasswordPath],
      [
        { op: 'set', path: '/http/auth/type', value: 'basic' },
        { op: 'set', path: authUsernamePath, value: authUsername },
        { op: 'set', path: authPasswordPath, value: authPassword },
      ],
    )
  }
  const authSetup =
    configureAuth && authType ? (
      <CredentialsSetup
        buttonLabel="启用基础认证"
        description="当前未启用认证。用户名和密码会与基础认证一起保存。"
        disabled={authType.locked}
        error={errors[authUsernamePath] ?? errors[authPasswordPath]}
        onEnable={enableBasicAuth}
        onPasswordChange={(value) => setDraft(authPasswordPath, value)}
        onUsernameChange={(value) => setDraft(authUsernamePath, value)}
        password={authPassword}
        saving={authSaving}
        title="访问认证"
        username={authUsername}
      />
    ) : null
  const visibleHttp = configureAuth
    ? http.filter((field) => !field.path.startsWith('/http/auth/'))
    : http

  const downloaderType = downloader.find(
    (field) => field.path === '/downloader/type',
  )
  const configureDownloader = downloaderType?.value === 'disabled'
  const downloaderUsernamePath = '/downloader/username'
  const downloaderPasswordPath = '/downloader/password'
  const downloaderUsername = String(drafts[downloaderUsernamePath] ?? '')
  const downloaderPassword = String(drafts[downloaderPasswordPath] ?? '')
  const downloaderSaving =
    saving.has(downloaderUsernamePath) || saving.has(downloaderPasswordPath)
  const enableDownloader = () => {
    commit(
      ['/downloader/type', downloaderUsernamePath, downloaderPasswordPath],
      [
        { op: 'set', path: '/downloader/type', value: 'qbittorrent' },
        {
          op: 'set',
          path: downloaderUsernamePath,
          value: downloaderUsername,
        },
        {
          op: 'set',
          path: downloaderPasswordPath,
          value: downloaderPassword,
        },
      ],
    )
  }
  const downloaderSetup =
    configureDownloader && downloaderType ? (
      <CredentialsSetup
        buttonLabel="启用 qBittorrent"
        description="当前未启用下载器。凭据可留空，并会与 qBittorrent 一起保存。"
        disabled={downloaderType.locked}
        error={errors[downloaderUsernamePath] ?? errors[downloaderPasswordPath]}
        onEnable={enableDownloader}
        onPasswordChange={(value) => setDraft(downloaderPasswordPath, value)}
        onUsernameChange={(value) => setDraft(downloaderUsernamePath, value)}
        password={downloaderPassword}
        saving={downloaderSaving}
        title="下载器"
        username={downloaderUsername}
      />
    ) : null
  const visibleDownloader = configureDownloader
    ? downloader.filter(
        (field) =>
          field.path !== '/downloader/type' &&
          !field.path.startsWith('/downloader/username') &&
          !field.path.startsWith('/downloader/password'),
      )
    : downloader

  return (
    <div className="grid gap-5">
      {view.warnings.length ? (
        <div
          className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
          role="status"
        >
          <div className="flex items-center gap-2 font-600">
            <Icon name="warning" />
            运行时警告
          </div>
          <ul className="mb-0 mt-2 pl-5">
            {view.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex justify-end text-xs text-muted">
        <span aria-live="polite">
          {saving.size
            ? '正在保存…'
            : savedAt
              ? `已于 ${savedAt.toLocaleTimeString()} 保存`
              : null}
        </span>
      </div>
      <TabRoot className="min-w-0" defaultValue="resolver">
        <TabList aria-label="配置分类">
          <Tab value="resolver">
            <Icon className="text-base" name="search" />
            解析器
          </Tab>
          <Tab value="sources">
            <Icon className="text-base" name="activity" />
            订阅源
          </Tab>
          <Tab value="subscription">
            <Icon className="text-base" name="bell" />
            订阅
          </Tab>
          <Tab value="downloader">
            <Icon className="text-base" name="download" />
            下载器
          </Tab>
          <Tab value="http">
            <Icon className="text-base" name="hardDrive" />
            HTTP
          </Tab>
          <TabIndicator />
        </TabList>
        <TabPanel value="resolver">
          <Section
            description="配置元数据解析器"
            fields={resolver}
            renderField={renderField}
            title="解析器"
          />
        </TabPanel>
        <TabPanel value="sources">
          <div className="grid gap-5">
            <SourceCreator
              names={view.sources.map((source) => source.name)}
              onCreate={createSource}
              saving={sourceSaving}
            />
            {view.sources.map((source) => (
              <Section
                action={
                  source.deletable ? (
                    <Button
                      aria-label={`删除订阅源 ${source.name}`}
                      disabled={sourceSaving}
                      onClick={() => deleteSource(source)}
                      type="button"
                      variant="danger"
                    >
                      删除
                    </Button>
                  ) : null
                }
                description={`${sourceKindLabels[source.kind]} 订阅源`}
                fields={sources.get(source.name) ?? []}
                key={source.name}
                renderField={renderField}
                title={source.name}
              />
            ))}
            {view.sources.length === 0 ? (
              <div className="rounded-md border border-dashed border-edge p-8 text-center text-sm text-muted">
                暂无订阅源
              </div>
            ) : null}
          </div>
        </TabPanel>
        <TabPanel value="subscription">
          <Section
            description="配置订阅过滤规则"
            fields={subscription}
            renderField={renderField}
            title="订阅"
          />
        </TabPanel>
        <TabPanel value="downloader">
          <Section
            before={downloaderSetup}
            description="配置当前下载器"
            fields={visibleDownloader}
            renderField={renderField}
            title="下载器"
          />
        </TabPanel>
        <TabPanel value="http">
          <Section
            before={authSetup}
            description="配置 HTTP 服务"
            fields={visibleHttp}
            renderField={renderField}
            title="HTTP 服务"
          />
        </TabPanel>
      </TabRoot>
    </div>
  )
}

export default function ConfigurationPage() {
  return (
    <>
      <PageHeader routes={[{ href: '/meta', name: '番剧' }, { name: '配置' }]}>
        <h1 className="m-0 text-4xl font-600 text-[rgb(28_31_35/80%)]">配置</h1>
      </PageHeader>
      <WidthLimit className="py-8" maxWidth="960px">
        <Loading size="large" useData={useConfiguration}>
          {(data) => <ConfigurationEditor initial={data} />}
        </Loading>
      </WidthLimit>
    </>
  )
}
