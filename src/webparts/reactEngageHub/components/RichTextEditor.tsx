import * as React from "react"
import { useRef, useEffect, useState } from "react"
import { Editor } from "roosterjs-content-model-core"
import { EditorToolbar } from "../components/EditorToobar/EditorToolbar"
import {
  Button,
  buttonClassNames,
  Card,
  Link,
  makeStyles,
  Spinner,
  tokens,
} from "@fluentui/react-components"
import { AutoFormatPlugin, HyperlinkPlugin } from "roosterjs"
import { usePostSubmission } from "../../hooks/usePostSubmission"
import { useImageUpload } from "../../hooks/useImageUpload"
import { addNewPost } from "../services/SPService"
import { WEBPARTCONTEXT } from "../../context/webPartContext"
import { IReactEngageHubProps } from "../IReactEngageHubProps"
import { CollapseRelaxed } from "@fluentui/react-motion-components-preview"
import { ContentChangePlugin } from "./plugins/ContentChangePlugin"
import styles from "../ReactEngageHub.module.scss"
import { ImagePreview } from "./ImagePreview"
import { SendIcon } from "../../constants/icons"

const useStyles = makeStyles({
  textEditor: {
    minHeight: "200px",
    overflow: "scroll",
    caretColor: tokens.colorBrandBackground,
    color: "white",
    outline: "none",
  },
  wrapper: {
    padding: "1rem !important",
    flexShrink: " 0",
  },
  postBtn: {
    width: "fit-content",
    alignSelf: "flex-end",
  },

  buttonNonInteractive: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `${tokens.strokeWidthThin} solid ${tokens.colorNeutralStroke1}`,
    color: tokens.colorNeutralForeground1,
    cursor: "default",
    pointerEvents: "none",

    [`& .${buttonClassNames.icon}`]: {
      color: tokens.colorStatusSuccessForeground1,
    },
    width: "fit-content",
    alignSelf: "flex-end",
  },
  collapseBtn: {
    width: "fit-content",
    marginLeft: "0.25rem",
  },
  actionBtnWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
})

interface IRichTextEditorProps {
  isCompactView: boolean
  setIsCompactView: React.Dispatch<React.SetStateAction<boolean>>
  mode?: string
  postId?: number
  onPostSubmit?: () => void
  fetchPosts?: () => Promise<void>
}

export const RichTextEditor = (props: IRichTextEditorProps) => {
  const [content, setContent] = useState<any>(null)
  const editorDivRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<Editor | null>(null)

  const { isDarkTheme } = React.useContext<IReactEngageHubProps>(WEBPARTCONTEXT)

  const { isCompactView, setIsCompactView, onPostSubmit } = props

  const fluentStyles = useStyles()

  const { context, maxFileLimit } =
    React.useContext<IReactEngageHubProps>(WEBPARTCONTEXT)

  const { images, addImages, clearImages, removeImage } = useImageUpload()

  const { submitPost, loadingState } = usePostSubmission({
    addNewPost,
    onPostSubmit,
    clearImages,
    setContent,
    setIsCompactView,
    context,
  })

  const handleLink = (anchor: HTMLAnchorElement, mouseEvent: MouseEvent) => {
    window.open(anchor.href, "_blank")
  }

  useEffect(() => {
    if (editorDivRef.current && !editor) {
      const rooster = new Editor(editorDivRef.current, {
        plugins: [
          new AutoFormatPlugin({
            autoBullet: true,
            autoLink: true,
            autoNumbering: true,
            autoUnlink: false,
            autoHyphen: true,
            autoFraction: true,
            autoOrdinals: true,
          }),
          new HyperlinkPlugin(undefined, "_blank", handleLink),
          ContentChangePlugin((html) => setContent(html)),
        ],
      })
      rooster.setDarkModeState(isDarkTheme)
      setEditor(rooster)
    }
    return () => {
      editor?.dispose()
    }
  }, [])

  const buttonIcon =
    loadingState === "loading" ? <Spinner size='tiny' /> : <SendIcon />

  const buttonClassName =
    loadingState === "initial" || loadingState === "loaded"
      ? fluentStyles.postBtn
      : fluentStyles.buttonNonInteractive

  const postButtonLabel = loadingState === "loading" ? "Posting..." : "Post"

  return (
    <>
      <CollapseRelaxed visible={isCompactView === false ? true : false}>
        <Card
          className={fluentStyles.wrapper}
          style={{ display: isCompactView ? "none" : "block" }}
        >
          {editor && (
            <EditorToolbar
              editor={editor}
              images={images}
              maxFileLimit={maxFileLimit}
              addImages={addImages}
            />
          )}
          {images.previewUrls.length > 0 && (
            <div className={styles.previewImageWrapper}>
              {images.previewUrls.map((url, index) => (
                <ImagePreview
                  key={url + index}
                  preview={url}
                  index={index}
                  handleRemoveImageFromPreview={() => removeImage(index)}
                />
              ))}
            </div>
          )}
          <div
            ref={editorDivRef}
            className={fluentStyles.textEditor}
            contentEditable
          />
          <div className={fluentStyles.actionBtnWrapper}>
            <Link
              className={fluentStyles.collapseBtn}
              onClick={() => setIsCompactView(!isCompactView)}
            >
              Collapse
            </Link>
            <Button
              icon={buttonIcon}
              appearance='primary'
              onClick={() => submitPost(content, images.imageUrls)}
              disabled={content === null}
              disabledFocusable={loadingState === "loading" ? true : false}
              className={buttonClassName}
            >
              {postButtonLabel}
            </Button>
          </div>
        </Card>
      </CollapseRelaxed>
    </>
  )
}
