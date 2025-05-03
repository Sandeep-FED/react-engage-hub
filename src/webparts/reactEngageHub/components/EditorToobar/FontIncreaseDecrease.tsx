import * as React from "react"
import { ToolbarButton } from "@fluentui/react-components"
import {
  FontDecrease20Regular,
  FontIncrease20Regular,
} from "@fluentui/react-icons"

import { IEditor } from "roosterjs-content-model-types"
import { setFontSize } from "roosterjs-content-model-api"

interface FontSizeMenuProps {
  editor: IEditor | null
  mode?: "increase" | "decrease"
}

export const FontIncreaseDecrease = ({ editor, mode }: FontSizeMenuProps) => {
  const applyFontSize = () => {
    if (!editor) return

    editor.focus()

    const domSelection = editor.getDOMSelection()
    if (!domSelection || !domSelection.type || domSelection.type !== "range")
      return

    const node =
      domSelection.range?.startContainer.nodeType === Node.ELEMENT_NODE
        ? (domSelection.range.startContainer as HTMLElement)
        : (domSelection.range?.startContainer?.parentElement as HTMLElement)

    if (!node) return

    const computedStyle = window.getComputedStyle(node)
    const currentPx = parseFloat(computedStyle.fontSize || "14px")

    const delta = mode === "increase" ? 2 : -2
    const newSize = Math.max(currentPx + delta, 8) // min 8px safety net

    setFontSize(editor, `${newSize}px`)
  }

  return (
    <ToolbarButton
      icon={
        mode === "increase" ? (
          <FontIncrease20Regular />
        ) : (
          <FontDecrease20Regular />
        )
      }
      onClick={applyFontSize}
    />
  )
}
