import * as React from "react"
import { useEffect, useState } from "react"
import { RichTextEditorToolbar } from "./toolbar/RichTextEditorToolbar"
import {
  Button,
  buttonClassNames,
  Card,
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
  tokens,
} from "@fluentui/react-components"
import {
  CollapseRelaxed,
  Fade,
} from "@fluentui/react-motion-components-preview"

import { usePostSubmission } from "../../hooks/usePostSubmission"
import { useImageUpload } from "../../hooks/useImageUpload"
import { useRoosterEditor } from "../../hooks/useRoosterEditor"
import { useAITextActions } from "../../hooks/useAITextActions"

import { ImagePreview } from "./ImagePreview"

import {
  ChevronCircleUpIcon,
  SendIcon,
  SparkleBundle,
} from "../../constants/icons"
import { AI_OPTIONS } from "../../constants/ai"
import { WEBPARTCONTEXT } from "../../context/webPartContext"

import { addNewPost } from "../services/SPService"
import { IReactEngageHubProps } from "../IReactEngageHubProps"
import styles from "../ReactEngageHub.module.scss"

const useStyles = makeStyles({
  textEditor: {
    minHeight: "120px",
    overflow: "scroll",
    caretColor: tokens.colorBrandBackground,
    color: "white",
    outline: "none",
    marginTop: "0.5rem",
    marginBottom: "0.5rem",
    padding: "0.5rem",
  },
  wrapper: {
    padding: "1rem !important",
    flexShrink: " 0",
    overflow: "unset",
    position: "relative",
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
  actionBtnWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  collapseBtn: {
    position: "absolute",
    bottom: "-16px",
    left: "50%",
    transition: "opacity 0.2s",
    zIndex: 2,
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
  const [isHovered, setIsHovered] = useState(false)

  const { isDarkTheme } = React.useContext<IReactEngageHubProps>(WEBPARTCONTEXT)

  const { isCompactView, setIsCompactView, onPostSubmit } = props

  const fluentStyles = useStyles()

  const { context, maxFileLimit, apiKey, apiEndpoint, deploymentName } =
    React.useContext<IReactEngageHubProps>(WEBPARTCONTEXT)

  const { images, addImages, clearImages, removeImage } = useImageUpload()

  const handleLink = (anchor: HTMLAnchorElement, mouseEvent: MouseEvent) => {
    window.open(anchor.href, "_blank")
  }

  const { editor, editorDivRef } = useRoosterEditor({
    isDarkTheme,
    setContent,
    handleLink,
  })

  const { submitPost, loadingState } = usePostSubmission({
    addNewPost,
    onPostSubmit,
    clearImages,
    setContent,
    setIsCompactView,
    context,
    editorDivRef,
  })

  const { handleAIAction, isLoading } = useAITextActions({
    apiKey,
    apiEndpoint,
    deploymentName,
    content,
    setContent,
    editorDivRef,
  })

  useEffect(() => {
    if (editorDivRef.current) {
      editorDivRef.current.style.background = isDarkTheme
        ? "transparent"
        : "#fff"
      editorDivRef.current.style.color = isDarkTheme ? "#fff" : "#222"
    }
  }, [isDarkTheme])

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
          style={{
            display: isCompactView ? "none" : "block",
            pointerEvents: isLoading ? "none" : "auto",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {editor && (
            <RichTextEditorToolbar
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
            className={
              isLoading
                ? `${fluentStyles.textEditor} ${styles.textEditorLoading}`
                : fluentStyles.textEditor
            }
            contentEditable={!isLoading}
            aria-disabled={isLoading}
            suppressContentEditableWarning
          />
          <div className={fluentStyles.actionBtnWrapper}>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance='subtle' icon={<SparkleBundle />} />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  {AI_OPTIONS.map((item, index) => {
                    return (
                      <MenuItem
                        key={index}
                        onClick={() => {
                          handleAIAction(item)
                        }}
                      >
                        {item}
                      </MenuItem>
                    )
                  })}
                </MenuList>
              </MenuPopover>
            </Menu>
            <Fade visible={!isCompactView && isHovered}>
              <Button
                onClick={() => setIsCompactView(!isCompactView)}
                icon={<ChevronCircleUpIcon />}
                shape='circular'
                className={fluentStyles.collapseBtn}
              />
            </Fade>
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
