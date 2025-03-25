import * as React from "react"
import {
  Button,
  Card,
  Textarea,
  ToolbarButton,
  ToolbarDivider,
  makeStyles,
  Toolbar,
} from "@fluentui/react-components"
import {
  bundleIcon,
  Image24Regular,
  Send20Color,
  Send24Regular,
} from "@fluentui/react-icons"
import { addNewPost } from "../services/SPService"
import { ImagePreview } from "./ImagePreview"

const useStyles = makeStyles({
  textArea: {
    width: "inherit",
    height: "120px",
  },
  postBtn: {
    width: "fit-content",
    alignSelf: "flex-end",
  },
})

export type AdvancedTextAreaType = {
  postDescription: string
  imageUrl: File
}

const SendIcon = bundleIcon(Send20Color, Send24Regular)

export const AdvancedTextArea: React.FunctionComponent<any> = (
  props: React.PropsWithChildren<any>
) => {
  const [post, setPost] = React.useState<AdvancedTextAreaType>({
    postDescription: "",
    imageUrl: new File([], ""),
  })
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [previewImage, setPreviewImage] = React.useState<any>()

  const fluentStyles = useStyles()

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPost({ ...post, imageUrl: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handlePostSubmit = async () => {
    // Call addNewPost with the updated post inside the state update
    await addNewPost(post, props.context.pageContext)

    setPost({ postDescription: "", imageUrl: new File([], "") })
  }

  const removeImageFromPreview = () => {
    setPost({ ...post, imageUrl: new File([], "") })
    setPreviewImage("")
  }

  return (
    <Card>
      <Toolbar aria-label='Default' {...props}>
        <input
          type='file'
          accept='image/*'
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <ToolbarButton icon={<Image24Regular />} onClick={handleImageClick} />
        <ToolbarDivider vertical />
      </Toolbar>
      {post.imageUrl.name !== "" && (
        <ImagePreview
          preview={previewImage}
          handleRemoveImageFromPreview={removeImageFromPreview}
        />
      )}
      <Textarea
        className={fluentStyles.textArea}
        value={post.postDescription}
        onChange={(e) =>
          setPost({
            ...post,
            postDescription: e.target.value,
          })
        }
        placeholder="What's on your mind?"
      />
      <Button
        icon={<SendIcon />}
        appearance='primary'
        onClick={handlePostSubmit}
        disabled={!post.postDescription}
        className={fluentStyles.postBtn}
      >
        Post
      </Button>
    </Card>
  )
}
