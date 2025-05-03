import * as React from "react"
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
} from "@fluentui/react-components"
import {
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  CodeBlockIcon,
  LinkDismissIcon,
  TextBoldIcon,
  TextBulletListIcon,
  TextItalicIcon,
  TextNumberListIcon,
  TextStrikethroughIcon,
  TextUnderlineIcon,
} from "../../../constants/icons"

import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleBullet,
  toggleNumbering,
  toggleCode,
  setAlignment,
  toggleStrikethrough,
  removeLink,
} from "roosterjs-content-model-api"
import { IEditor } from "roosterjs-content-model-types"
import { FontIncreaseDecrease } from "./FontIncreaseDecrease"
import { InsertLinkPopover } from "./Popovers/InsertLinkPopover"
import { SwatchPickerPopover } from "./Popovers/SwatchPickerPopover"
import { ImageUploader } from "../ImageUploader"
import { useAlertDialog } from "../../../hooks/useAlertDialog"

interface IEditorToolbarProps {
  editor: IEditor | null
  images: { imageUrls: File[] }
  maxFileLimit: number
  addImages: (files: File[]) => void
}

export const EditorToolbar = (props: IEditorToolbarProps) => {
  const { editor, images, maxFileLimit, addImages } = props

  const isDisabled = !editor

  const actions = [
    { icon: <TextBoldIcon />, handler: toggleBold, label: "Bold" },
    { icon: <TextItalicIcon />, handler: toggleItalic, label: "Italic" },
    {
      icon: <TextUnderlineIcon />,
      handler: toggleUnderline,
      label: "Underline",
    },
    {
      icon: <TextStrikethroughIcon />,
      handler: toggleStrikethrough,
      label: "Strike Through",
    },
    {
      icon: <TextBulletListIcon />,
      handler: toggleBullet,
      label: "Bullet List",
    },
    {
      icon: <TextNumberListIcon />,
      handler: toggleNumbering,
      label: "Number List",
    },
    { icon: <CodeBlockIcon />, handler: toggleCode, label: "Code Block" },
    {
      icon: <AlignLeftIcon />,
      handler: (editor: IEditor) => setAlignment(editor, "left"),
      label: "Align Left",
    },
    {
      icon: <AlignCenterIcon />,
      handler: (editor: IEditor) => setAlignment(editor, "center"),
      label: "Align Center",
    },
    {
      icon: <AlignRightIcon />,
      handler: (editor: IEditor) => setAlignment(editor, "right"),
      label: "Align Right",
    },
  ]

  const alertDialog = useAlertDialog()

  return (
    <Toolbar>
      <ImageUploader
        imageCount={images.imageUrls.length}
        maxFileLimit={maxFileLimit}
        setAlert={alertDialog.setIsOpen}
        addImages={addImages}
      />
      <ToolbarDivider vertical />
      {actions.map(({ icon, handler, label }, index) => (
        <ToolbarButton
          key={index}
          icon={icon}
          onClick={() => handler(editor!)}
          aria-label={label}
          disabled={isDisabled}
        />
      ))}
      <FontIncreaseDecrease editor={editor} mode='increase' />
      <FontIncreaseDecrease editor={editor} mode='decrease' />
      <InsertLinkPopover editor={editor} />
      <ToolbarButton
        icon={<LinkDismissIcon />}
        onClick={() => removeLink(editor!)}
      />
      <SwatchPickerPopover editor={editor} mode='text' />
      <SwatchPickerPopover editor={editor} mode='highlight' />
    </Toolbar>
  )
}
