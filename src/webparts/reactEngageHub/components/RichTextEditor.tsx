import * as React from "react"
import { useState } from "react"
import { RichTextEditorToolbar } from "./toolbar/RichTextEditorToolbar"
import {
  Button,
  buttonClassNames,
  Card,
  makeStyles,
  Menu,
  MenuButtonProps,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
  SplitButton,
  tokens,
} from "@fluentui/react-components"
import {
  CollapseRelaxed,
  Fade,
} from "@fluentui/react-motion-components-preview"

import { usePostSubmission } from "../../hooks/usePostSubmission"
import { useImageUpload } from "../../hooks/useImageUpload"
import { useRoosterEditor } from "../../hooks/useRoosterEditor"

import { ImagePreview } from "./ImagePreview"

import { ArrowUpIcon, SendIcon, SparkleBundle } from "../../constants/icons"
import { WEBPARTCONTEXT } from "../../context/webPartContext"

import { addNewPost } from "../services/SPService"
import { IReactEngageHubProps } from "../IReactEngageHubProps"
import styles from "../ReactEngageHub.module.scss"
import { useAITextActions } from "../../hooks/useAITextActions"

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
    overflow: "unset",
    position: "relative",
    "&:hover .collapseBtn": {
      opacity: 1,
      pointerEvents: "auto",
    },
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

  const { editor, editorDivRef } = useRoosterEditor({
    isDarkTheme,
    setContent,
    handleLink,
  })

  const buttonIcon =
    loadingState === "loading" ? <Spinner size='tiny' /> : <SendIcon />

  const buttonClassName =
    loadingState === "initial" || loadingState === "loaded"
      ? fluentStyles.postBtn
      : fluentStyles.buttonNonInteractive

  const postButtonLabel = loadingState === "loading" ? "Posting..." : "Post"

  const { handleRewrite, handleGrammarFix } = useAITextActions({
    apiKey,
    apiEndpoint,
    deploymentName,
    content,
    setContent,
  })

  const primaryActionButtonProps = {
    onClick: handleRewrite,
  }

  return (
    <>
      <CollapseRelaxed visible={isCompactView === false ? true : false}>
        <Card
          className={fluentStyles.wrapper}
          style={{ display: isCompactView ? "none" : "block" }}
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
            className={fluentStyles.textEditor}
            contentEditable
          />
          <div className={fluentStyles.actionBtnWrapper}>
            <Menu positioning='below-end'>
              <MenuTrigger disableButtonEnhancement>
                {(triggerProps: MenuButtonProps) => (
                  <SplitButton
                    appearance='subtle'
                    menuButton={triggerProps}
                    primaryActionButton={primaryActionButtonProps}
                    icon={<SparkleBundle />}
                  >
                    AI Rewrite
                  </SplitButton>
                )}
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={handleGrammarFix}>Grammar fix</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
            <Fade visible={!isCompactView && isHovered}>
              <Button
                onClick={() => setIsCompactView(!isCompactView)}
                icon={<ArrowUpIcon />}
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
