import { useCallback, useState } from "react"
import { getPosts } from "../services/SPService"
import { useAtom } from "jotai"
import { postsAtom } from "../atoms/globalAtoms"

export const usePosts = (context: any) => {
  const [, setPosts] = useAtom(postsAtom)
  const [nextLink, setNextLink] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)
    const data = await getPosts(context)
    setPosts(data.items)
    console.log(data.items,'posts')
    setHasMore(data.hasMore)
    setNextLink(data.nextLink)
    setIsLoading(false)
  }, [context])

  const fetchMorePosts = useCallback(async () => {
    if (!nextLink || !hasMore) return
    try {
      const response = await getPosts(context, nextLink)
      if (response.items && response.items.length > 0) {
        setPosts((prev: any) => [...prev, ...response.items])
        setHasMore(response.hasMore)
        setNextLink(response.nextLink)
      } else {
        setHasMore(false)
        setNextLink(undefined)
      }
    } catch {
      setHasMore(false)
      setNextLink(undefined)
    }
  }, [context, nextLink, hasMore])

  return { fetchPosts, fetchMorePosts, hasMore, isLoading, nextLink }
}
