interface ShortcutHintProps {
  /** 1-4 选选项（拼写题没有选项，不传） */
  optionKeys?: boolean
  /** Tab 重听（看词选义/看义选词没有音频，不传） */
  replayKey?: boolean
}

export function ShortcutHint({ optionKeys = false, replayKey = false }: ShortcutHintProps) {
  const items: [string, string][] = []
  if (optionKeys) items.push(['1-4', '选选项'])
  if (replayKey) items.push(['Tab', '重听'])
  items.push(['←', '上一题'], ['→ / Enter', '下一题'])

  return (
    <p className="mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
      {items.map(([key, label]) => (
        <span key={key} className="inline-flex items-center gap-1">
          <kbd className="rounded border border-gray-200 bg-white px-1.5 py-0.5 font-sans text-[10px] leading-none text-gray-500">
            {key}
          </kbd>
          {label}
        </span>
      ))}
    </p>
  )
}
