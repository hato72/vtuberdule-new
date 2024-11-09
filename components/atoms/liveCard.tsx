import dayjs from "dayjs"
import React,{ useContext, useEffect, useRef, useState } from "react"
import { isCorrectLiveHoloUrl } from "../../utils/util"
import { GlobalChangeCardContext } from "../../utils/globalChangeCardObserver"
import { GroupContext } from "./groupContext"
import { useAuth } from "../auth/AuthContext"

export type Api = {
  available_at: string
  channel: {
    english_name: string
    id: string
    name: string
    org?: "Hololive" | "Nijisanji" | "Aogiri Highschool" | "VSpo" | "774inc" | "Neo-Porte"
    photo: string
    type: string
  }
  duration: number
  id: string
  live_viewres: number
  published_at: string
  start_actual: string
  start_scheduled: string
  status: "live" | "upcoming"
  title: string
  topic_id: string
  type: string
  sort: string
}

interface Props {
  isFixedVideo: boolean
  searchQuery: string
}

const LiveCard = ({ isFixedVideo, searchQuery}: Props) => {
  const youtube_jpeg = "https://img.youtube.com/vi/"
  const youtube_jpeg_size = {
    large: "/maxresdefault.jpg",
    midium: "/sddefault.jpg",
  }
  const holoVideo = "https://www.youtube.com/watch?v="
  const holoUrl = "https://holodex.net/api/v2/live/"
  const [isHovering, setIsHovering] = useState<number>(-1)
  const [holoData, setHoloData] = useState<Api[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isHidden, setIsHidden] = useState(false)
  const [fixedVideo, setFixedVideo] = useState(false)
  const { isChangeLiveCardSize } = useContext(GlobalChangeCardContext)
  const ref = useRef<HTMLDivElement>(null)
  const { user, userPreferences, updateUserPreferences } = useAuth()

  const handleFixed = () => {
    setFixedVideo(!fixedVideo)
  }

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        if (window.innerWidth < 639) {
          ref.current.style.display = "none"
          setIsHidden(true)
        } else {
          ref.current.style.display = "block"
          setIsHidden(false)
        }
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [ref])

  useEffect(() => {
    setIsLoading(true)
    ;(async () => {
      try {
        const res = await fetch(holoUrl, {
          headers: {
            "X-APIKEY": process.env.NEXT_PUBLIC_HOLODEX_API_KEY || "",
          },
        })
        const users = await res.json()
        setHoloData(users)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const getFilteredData = (org: string) => {
    return holoData.filter((data) => data.channel.org === org)
  }

  const {selectedGroup} = useContext(GroupContext)

  const Groupfilter = () => {
    if(selectedGroup === null || selectedGroup === "All Group"){
      return holoData
    }
    return getFilteredData(selectedGroup)
  }

  const sortStreamsByPreference = (streams: Api[]) => {
    if (!user || !userPreferences) return streams

    return streams.sort((a, b) => {
      const aScore = calculateRelevanceScore(a)
      const bScore = calculateRelevanceScore(b)
      return bScore - aScore
    })
  }

  const calculateRelevanceScore = (stream: Api) => {
    if (!userPreferences) return 0
    let score = 0

    if (userPreferences.selectedGroups.includes(stream.channel.org || '')) {
      score += 3
    }

    const searchTerms = userPreferences.searchHistory.slice(-5)
    for (const term of searchTerms) {
      if (stream.title.toLowerCase().includes(term.toLowerCase())) {
        score += 2
      }
    }

    if (userPreferences.lastVisited.includes(stream.channel.id)) {
      score += 1
    }

    return score
  }

  const handleStreamClick = async (channelId: string) => {
    if (user && userPreferences) {
      const updatedVisited = [
        channelId,
        ...userPreferences.lastVisited.slice(0, 9)
      ]
      await updateUserPreferences({
        lastVisited: updatedVisited
      })
    }
  }

  const filterSearchResults = () => {
    if (!searchQuery) {
      return holoData
    }

    const searchQuery_ = searchQuery.toLowerCase()

    if (selectedGroup === null || selectedGroup === "All Group"){
      return holoData.filter((holoData) =>{
        const channel_ = holoData.channel.name.toLowerCase().includes(searchQuery_)
        const title_ = holoData.title.toLowerCase().includes(searchQuery_)
        return (
          channel_ || title_
        )
      })
    }
    return holoData.filter((holoData) =>{
      const channel_ = holoData.channel.name.toLowerCase().includes(searchQuery_)
      const title_ = holoData.title.toLowerCase().includes(searchQuery_)
      return (
        holoData.channel.org === selectedGroup && (channel_ || title_)
      )
    })
  }

  const renderStreams = (streams: Api[]) => {
    const sortedStreams = sortStreamsByPreference(streams)
    return sortedStreams.map((holoDatas: Api, index) => {
      if (!isCorrectLiveHoloUrl(holoDatas)) return null
      
      return (
        <div
          key={holoDatas.id}
          className={`relative ${
            isChangeLiveCardSize ? "w-[23.5vw]" : "w-[19vw]"
          } max-xl:w-[24%] max-lg:w-[32%] max-mm:w-[48.5%] max-md:w-[48.5%] max-sm:w-[48.5%] max-xs:w-[48.5%] h-full flex flex-col border shadow-sm rounded-xl bg-gray-800 border-gray-700 shadow-slate-700/[.7]`}
          onMouseEnter={!fixedVideo ? () => setIsHovering(index) : undefined}
          onMouseLeave={!fixedVideo ? () => setIsHovering(-1) : undefined}
        >
          <div className="absolute text-xs font-bold text-center text-red-500 bottom-1 right-2 opacity-90 max-sm:text-[10px]">
            <span className="mr-[1px]">●</span>REC
          </div>
          <a 
            href={`${holoVideo}${holoDatas.id}`} 
            target="_blank"
            onClick={() => handleStreamClick(holoDatas.channel.id)}
          >
            <img
              className="w-full h-auto rounded-t-xl"
              src={youtube_jpeg + holoDatas.id + youtube_jpeg_size.large}
              alt="Image Description"
            />
            <div className="p-2 md:p-3">
              <div className="text-gray-400 max-sm:text-[14px]">
                {dayjs(holoDatas.start_scheduled).format("HH:mm")}
              </div>
              <h3 className="flex font-bold text-md text-white max-sm:text-[12px]">
                {holoDatas.title}
              </h3>
            </div>
          </a>
        </div>
      )
    })
  }

  return (
    <>
      {isLoading ? (
        <div className="fixed z-[2] top-[40%] animate-spin inline-block w-10 h-10 border-[3px] border-current border-t-transparent text-[#F3F4F6] rounded-full">
          <span className="sr-only">Loading...</span>
        </div>
      ) : null}

      {searchQuery ? 
        renderStreams(filterSearchResults()) :
        renderStreams(Groupfilter())}
    </>
  )
}

export default LiveCard