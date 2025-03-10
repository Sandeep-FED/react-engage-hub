import { SPFI } from "@pnp/sp"
import { getSP } from "../utils/spUtility"
import { AdvancedTextAreaType } from "../components/AdvancedTextArea"
import { IComments, Comment, Comments } from "@pnp/sp/comments"

export const addNewPost = async (
  post: AdvancedTextAreaType,
  pageContext: any
) => {
  let sp: SPFI = getSP()

  let userInfo = await getCurrentUserDetails()

  let postUUID = crypto.randomUUID()
  console.log(post.imageUrl)

  let imageResult: any
  if (post.imageUrl.name != "" && post.imageUrl.size !== 0) {
    imageResult = await uploadImage(
      post.imageUrl,
      pageContext,
      userInfo,
      postUUID
    )
  }

  let image: any
  if (imageResult) {
    image = {
      serverRelativeUrl: imageResult.ServerRelativeUrl,
      fileName: imageResult.Name,
    }
  }

  await sp.web.lists.getByTitle("Discussion Point").items.add({
    Description: post.postDescription,
    UserID: userInfo.UserId.NameId,
    PostID: postUUID,
    Image: image
      ? image.serverRelativeUrl !== ""
        ? JSON.stringify(image)
        : ""
      : "",
    AuthorName: userInfo.Title,
    AuthorMailID: userInfo.UserPrincipalName,
  })
}

export const getCurrentUserDetails = async () => {
  let sp: SPFI = getSP()
  return await sp.web.currentUser()
}

export const createFolder = async (folderPath: any) => {
  let sp: SPFI = getSP()

  // creates a new folder for web with specified server relative url
  await sp.web.folders.addUsingPath(folderPath)
}

export const ensureFolder = async (uploadPath: string) => {
  let sp: SPFI = getSP()
  const folder = await sp.web
    .getFolderByServerRelativePath(uploadPath)
    .select("Exists")()
  if (!folder.Exists) {
    await createFolder(uploadPath)
  }
}

export const uploadImage = async (
  image: File,
  pageContext: any,
  userInfo: any,
  postUUID: string
) => {
  let sp: SPFI = getSP()

  const fileNamePath = encodeURI(image.name)

  let path = `${pageContext._site.serverRelativeUrl}/Discussion Point Gallery/${userInfo.UserId.NameId}`

  let result: any

  if (image.size <= 10485760) {
    // small upload
    result = await sp.web
      .getFolderByServerRelativePath(path)
      .files.addUsingPath(fileNamePath, image, { Overwrite: true })

    if (result) {
      let fileInfo = await sp.web
        .getFileByServerRelativePath(result.ServerRelativeUrl)
        .getItem()

      await fileInfo.update({
        PostID: postUUID,
      })
    }
  } else {
    // large upload
    result = await sp.web
      .getFolderByServerRelativePath(path)
      .files.addChunked(fileNamePath, image, {
        progress: (data) => {
          console.log(`progress`)
        },
        Overwrite: true,
      })

    if (result) {
      let fileInfo = await sp.web
        .getFileByServerRelativePath(result.ServerRelativeUrl)
        .getItem()

      await fileInfo.update({
        PostID: postUUID,
      })
    }
  }
  return result
}

export const getPosts = async () => {
  let sp: SPFI = getSP()

  let results = await sp.web.lists
    .getByTitle("Discussion Point")
    .items.orderBy("Created", false)()

  const itemsWithComments = await Promise.all(
    results.map(async (item: any) => {
      const comments: IComments = await sp.web.lists
        .getByTitle("Discussion Point")
        .items.getById(item.ID)
        .comments()
      return {
        ...item,
        comments,
      }
    })
  )

  return itemsWithComments
}

export const updateLikeDislike = async (
  postID: number,
  commentID: string,
  like: boolean
) => {
  let sp: SPFI = getSP()

  const commentInst = Comment(
    sp.web.lists
      .getByTitle("Discussion Point")
      .items.getById(postID)
      .comments.getById(commentID)
  )

  // Like or unlike the comment using the factory instance
  if (like) {
    await commentInst.like()
  } else {
    await commentInst.unlike()
  }
}

export const addNewComment = async (postID: number, newComment: string) => {
  let sp: SPFI = getSP()

  await Comments(
    sp.web.lists.getByTitle("Discussion Point").items.getById(postID)
  ).add(newComment)
}

export const deleteComment = async (postID: number, commentID: string) => {
  let sp: SPFI = getSP()

  const commentInst = Comment(
    sp.web.lists
      .getByTitle("Discussion Point")
      .items.getById(postID)
      .comments.getById(commentID)
  )
  await commentInst.delete()
}
