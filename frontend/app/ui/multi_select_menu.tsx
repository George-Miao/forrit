import { Menu } from '@base-ui/react/menu'
import Icon from './icon'

export interface MultiSelectOption {
  label: string
  suffix?: string | number
  value: string
}

export interface MultiSelectExclusiveOption {
  label: string
  onSelectedChange: (selected: boolean) => void
  selected: boolean
}

const hasJapaneseKana = (value: string) =>
  /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(value)

function GroupName({ name }: { name: string }) {
  return (
    <span className={hasJapaneseKana(name) ? 'font-cjk-jp' : undefined}>
      {name}
    </span>
  )
}

export default function MultiSelectMenu({
  disabled = false,
  exclusiveOption,
  label,
  onValueChange,
  options,
  values,
}: {
  disabled?: boolean
  exclusiveOption?: MultiSelectExclusiveOption
  label: string
  onValueChange: (values: string[]) => void
  options: MultiSelectOption[]
  values: string[]
}) {
  const selected = new Set(values)
  const itemClass =
    'ui-focus flex w-full cursor-pointer items-center gap-2 rounded-md border-0 bg-transparent px-3 py-2 text-left text-sm transition hover:bg-[rgb(28_31_35/8%)] data-highlighted:bg-[rgb(28_31_35/8%)] active:scale-[0.98]'

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger
        disabled={disabled}
        nativeButton
        render={
          <button
            aria-label={label}
            className="ui-focus flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-edge bg-surface px-3 text-left text-sm text-text transition hover:border-[rgb(28_31_35/18%)] hover:bg-background disabled:cursor-not-allowed disabled:bg-background disabled:text-muted"
            type="button"
          />
        }
      >
        <span className="min-w-0 truncate font-500">
          {exclusiveOption?.selected
            ? exclusiveOption.label
            : values.length
              ? values.map((value, index) => (
                  <span key={value}>
                    {index ? '、' : null}
                    <GroupName
                      name={
                        options.find((option) => option.value === value)
                          ?.label ?? value
                      }
                    />
                  </span>
                ))
              : '选择字幕组'}
        </span>
        <Icon name="chevronDown" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner
          align="start"
          className="z-300 outline-none"
          sideOffset={4}
        >
          <Menu.Popup className="ui-popup max-h-64 min-w-64 overflow-y-auto p-1">
            {exclusiveOption ? (
              <>
                <Menu.CheckboxItem
                  checked={exclusiveOption.selected}
                  className={itemClass}
                  closeOnClick={false}
                  nativeButton
                  onCheckedChange={exclusiveOption.onSelectedChange}
                  render={<button type="button" />}
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center">
                    <Menu.CheckboxItemIndicator>
                      <Icon name="check" />
                    </Menu.CheckboxItemIndicator>
                  </span>
                  <span className="min-w-0 flex-1 truncate font-500">
                    {exclusiveOption.label}
                  </span>
                </Menu.CheckboxItem>
                {options.length ? (
                  <Menu.Separator className="my-1 h-px bg-edge" />
                ) : null}
              </>
            ) : null}
            {options.length ? (
              options.map((option) => (
                <Menu.CheckboxItem
                  checked={
                    exclusiveOption?.selected || selected.has(option.value)
                  }
                  className={`${itemClass} ${
                    exclusiveOption?.selected
                      ? 'cursor-not-allowed text-muted opacity-45 hover:bg-transparent active:scale-100'
                      : ''
                  }`}
                  closeOnClick={false}
                  disabled={exclusiveOption?.selected}
                  key={option.value}
                  nativeButton
                  onCheckedChange={(checked) =>
                    onValueChange(
                      checked
                        ? [...values, option.value]
                        : values.filter((value) => value !== option.value),
                    )
                  }
                  render={<button type="button" />}
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center">
                    <Menu.CheckboxItemIndicator>
                      <Icon name="check" />
                    </Menu.CheckboxItemIndicator>
                  </span>
                  <span className="min-w-0 flex-1 truncate font-500">
                    <GroupName name={option.label} />
                  </span>
                  {option.suffix !== undefined ? (
                    <span className="text-xs tabular-nums text-muted">
                      {option.suffix}
                    </span>
                  ) : null}
                </Menu.CheckboxItem>
              ))
            ) : exclusiveOption ? null : (
              <p className="m-0 px-3 py-4 text-center text-sm text-muted">
                暂无字幕组
              </p>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
