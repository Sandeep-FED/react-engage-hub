import * as React from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverSurface,
  SwatchPicker,
  ToolbarButton,
  SwatchPickerOnSelectionChangeData,
  renderSwatchPickerGrid,
} from "@fluentui/react-components"
import { setBackgroundColor, setTextColor } from "roosterjs-content-model-api"
import { TEXT_COLORS, HIGHLIGHT_COLORS } from "../../../../constants/colors"

import { HighlightIcon, TextColorIcon } from "../../../../constants/icons"

interface IBackgroundColorPopover {
  editor: any
  mode: "highlight" | "text"
}

export const SwatchPickerPopover = ({
  editor,
  mode,
}: IBackgroundColorPopover) => {
  const [open, setOpen] = React.useState<boolean>(false)

  const handleSelect = (
    ev: React.FormEvent,
    data: SwatchPickerOnSelectionChangeData
  ) => {
    mode === "highlight"
      ? setBackgroundColor(editor, data.selectedSwatch)
      : setTextColor(editor, data.selectedSwatch)
    editor?.focus()
    setOpen(false)
  }

  const swatches = mode === "text" ? TEXT_COLORS : HIGHLIGHT_COLORS

  return (
    <Popover open={open} withArrow onOpenChange={() => setOpen(!open)}>
      <PopoverTrigger disableButtonEnhancement>
        <ToolbarButton
          icon={mode === "highlight" ? <HighlightIcon /> : <TextColorIcon />}
          onClick={() => setOpen(!open)}
        />
      </PopoverTrigger>

      <PopoverSurface>
        <SwatchPicker
          layout='grid'
          shape='rounded'
          aria-label='SwatchPicker'
          onSelectionChange={handleSelect}
        >
          {renderSwatchPickerGrid({
            items: swatches,
            columnCount: mode === "text" ? 6 : 3,
          })}
        </SwatchPicker>
      </PopoverSurface>
    </Popover>
  )
}
