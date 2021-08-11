import React, { useState, createContext, useRef, useEffect } from "react";
import styles from "./App.module.scss";
import "./App.css";

import Player from "./components/Player/Player";
import Queue from "./components/Queue/Queue";

import ReactPlayer from "react-player/youtube";
import solenolyrics from "solenolyrics";
import { Toaster } from "react-hot-toast";
import { Navbar } from "./components/Navbar/Navbar";

export const SongQueueContext = createContext(null);

function App() {
  const videoPlayer = useRef();

  const [userInfo, setUserInfo] = useState({
    name: "",
    userId: 0,
    isInRoom: false,
    volume: 0,
    roomId: 0,
  });

  const [songQueue, setSongQueue] = useState([]);
  const [lyrics, setLyrics] = useState("");
  const [currentSongStatus, setCurrentSongStatus] = useState({
    index: 0,
    isPlaying: false,
    queueStatus: "noRepeat",
  });

  async function getLyrics(withArtist) {
    try {
      if (videoPlayer !== undefined) {
        let lyrics = "";
        if (withArtist) {
          lyrics = await solenolyrics.requestLyricsFor(
            songQueue[currentSongStatus.index]?.title +
              songQueue[currentSongStatus.index]?.artist
          );
        } else {
          lyrics = await solenolyrics.requestLyricsFor(
            songQueue[currentSongStatus.index]?.title
          );
        }

        //Request for lyrics again if failed the first time
        if (lyrics === undefined) {
          lyrics = await solenolyrics.requestLyricsFor(
            songQueue[currentSongStatus.index]?.title
          );
        }

        setLyrics(lyrics);
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (songQueue.length > 0) getLyrics(false);
  }, [songQueue[currentSongStatus.index]?.title, songQueue.length]);

  return (
    <SongQueueContext.Provider
      value={{
        songQueue,
        setSongQueue,
        currentSongStatus,
        setCurrentSongStatus,
        userInfo,
        setUserInfo,
        videoPlayer,
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "2px solid #F6C90E",
            background: "#303841",
            color: "#EEEEEE",
            fontFamily: "Lato, sans-serif",
          },
        }}
      />
      <div className={styles.app}>
        <Navbar />
        <section className={styles.main}>
          <div className={styles.lyrics}>
            {songQueue.length !== 0 ? (
              <ReactPlayer
                url={`https://www.youtube-nocookie.com/watch?v=${
                  songQueue[currentSongStatus.index]?.videoId
                }`}
                volume={userInfo.volume}
                className={styles.player}
                ref={videoPlayer}
                playing={currentSongStatus.isPlaying}
                loop={currentSongStatus.queueStatus === "loop" ? true : false}
                onEnded={() => {
                  switch (currentSongStatus.queueStatus) {
                    case "noRepeat":
                      if (currentSongStatus.index + 1 === songQueue.length) {
                        console.log("no more songs");
                      } else {
                        setCurrentSongStatus({
                          ...currentSongStatus,
                          index: currentSongStatus.index + 1,
                        });
                      }
                      break;
                    case "repeat":
                      if (currentSongStatus.index + 1 === songQueue.length) {
                        setCurrentSongStatus({
                          ...currentSongStatus,
                          index: 0,
                        });
                      } else {
                        setCurrentSongStatus({
                          ...currentSongStatus,
                          index: currentSongStatus.index + 1,
                        });
                      }
                      break;
                    default:
                      break;
                  }
                }}
              />
            ) : (
              ""
            )}
            <h1>Lyrics</h1>
            <p className={styles.lyric}>{lyrics}</p>
            <button
              onClick={() => getLyrics(true)}
              className={styles.wrongLyrics}
            >
              Wrong lyrics?
            </button>
            <p className={styles.desc}>(Use this if lyrics are wrong)</p>
          </div>
          <div className={styles.queue}>
            <Queue />
          </div>
          <Player />
        </section>
      </div>
    </SongQueueContext.Provider>
  );
}

export default App;
