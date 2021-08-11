import React, { useState, useContext, useEffect } from "react";
import styles from "./Player.module.scss";
import { SongQueueContext } from "../../App";
import { db } from "../../firebase/firebase";

const Player = () => {
  const {
    songQueue,
    setSongQueue,
    currentSongStatus,
    setCurrentSongStatus,
    videoPlayer,
    userInfo,
    setUserInfo,
  } = useContext(SongQueueContext);
  const [seekerLength, setSeekerLength] = useState(0);
  const [volumeLength, setVolumeLength] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    //Update seeker every half a second
    const interval = setInterval(() => {
      if (
        videoPlayer.current !== undefined &&
        videoPlayer.current?.getCurrentTime() !== undefined
      ) {
        if (videoPlayer.current?.getCurrentTime() !== null) {
          setCurrentTime(videoPlayer.current?.getCurrentTime());
          setSeekerLength(
            (videoPlayer.current?.getCurrentTime() /
              videoPlayer.current?.getDuration()) *
              100
          );
        } else {
        }
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [videoPlayer]);

  useEffect(() => {
    if (userInfo.isInRoom) {
      //Seeker listener
      db.ref("rooms/" + userInfo.roomId + "/seekTo").on("value", (snap) => {
        videoPlayer.current?.seekTo(snap.val(), "seconds");
        setSeekerLength(
          (snap.val() * 100) / videoPlayer.current?.getDuration()
        );
      });

      //Song status listener
      db.ref("rooms/" + userInfo.roomId + "/currentSongStatus").on(
        "value",
        (snap) => {
          setCurrentSongStatus(snap.val());
        }
      );
    }
  }, [userInfo.isInRoom, setCurrentSongStatus, userInfo.roomId, videoPlayer]);

  const secondsToMinutes = (s) =>
    (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;

  const seekerStyle = {
    backgroundSize: seekerLength + "% 100%",
  };

  const volumeStyle = {
    backgroundSize: volumeLength * 100 + "% 100%",
  };

  const playPause = () => {
    setCurrentSongStatus({
      ...currentSongStatus,
      isPlaying: !currentSongStatus.isPlaying,
    });

    if (userInfo.isInRoom) {
      db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/isPlaying").set(
        !currentSongStatus.isPlaying
      );
    }
  };

  const loopIcon = (queueStatus) => {
    switch (queueStatus) {
      case "noRepeat":
        return (
          <i
            class="fas fa-redo"
            onClick={() => {
              setCurrentSongStatus({
                ...currentSongStatus,
                queueStatus: "repeat",
              });
              if (userInfo.isInRoom)
                db.ref(
                  "rooms/" + userInfo.roomId + "/currentSongStatus/queueStatus"
                ).set("repeat");
            }}
          ></i>
        );
      case "repeat":
        return (
          <i
            class="fas fa-redo"
            style={{ color: "#F6C90E" }}
            onClick={() => {
              setCurrentSongStatus({
                ...currentSongStatus,
                queueStatus: "loop",
              });
              if (userInfo.isInRoom)
                db.ref(
                  "rooms/" + userInfo.roomId + "/currentSongStatus/queueStatus"
                ).set("loop");
            }}
          ></i>
        );
      case "loop":
        return (
          <i
            class="fas fa-infinity"
            style={{ color: "#F6C90E" }}
            onClick={() => {
              setCurrentSongStatus({
                ...currentSongStatus,
                queueStatus: "noRepeat",
              });
              if (userInfo.isInRoom)
                db.ref(
                  "rooms/" + userInfo.roomId + "/currentSongStatus/queueStatus"
                ).set("noRepeat");
            }}
          ></i>
        );
      default:
        break;
    }
  };

  const nextSong = () => {
    switch (currentSongStatus.queueStatus) {
      case "noRepeat":
        if (currentSongStatus.index + 1 === songQueue.length) {
          console.log("no more songs");
        } else {
          setCurrentSongStatus({
            ...currentSongStatus,
            index: currentSongStatus.index + 1,
          });

          if (userInfo.isInRoom)
            db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(
              currentSongStatus.index + 1
            );
        }
        break;
      case "repeat":
        if (currentSongStatus.index + 1 === songQueue.length) {
          setCurrentSongStatus({ ...currentSongStatus, index: 0 });
          db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(
            0
          );
        } else {
          setCurrentSongStatus({
            ...currentSongStatus,
            index: currentSongStatus.index + 1,
          });

          if (userInfo.isInRoom)
            db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(
              currentSongStatus.index + 1
            );
        }
        break;
      default:
        break;
    }
  };

  const lastSong = () => {
    if (currentSongStatus.index - 1 === -1) {
    } else {
      setCurrentSongStatus({
        ...currentSongStatus,
        index: currentSongStatus.index - 1,
      });

      if (userInfo.isInRoom)
        db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(
          currentSongStatus.index - 1
        );
    }
  };

  const shuffleSong = () => {
    let tempArray = [...songQueue];
    let currentIndex = tempArray.length,
      randomIndex;

    //Fisher-Yates (aka Knuth) Shuffle
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [tempArray[currentIndex], tempArray[randomIndex]] = [
        tempArray[randomIndex],
        tempArray[currentIndex],
      ];
    }
    setCurrentSongStatus({ ...currentSongStatus, isPlaying: false });
    setSongQueue(tempArray);
    setCurrentSongStatus({ ...currentSongStatus, isPlaying: true });

    db.ref("rooms/" + userInfo.roomId).set({
      songQueue: tempArray,
      currentSongStatus: { ...currentSongStatus, isPlaying: true },
    });
  };

  return (
    <div className={styles.player}>
      <div className={styles.details}>
        {songQueue.length === 0 ? (
          <p>---</p>
        ) : (
          <>
            <img
              src={songQueue[currentSongStatus.index]?.thumbnail.url}
              alt="thumbnail"
            />
            <p className={styles.name}>
              {songQueue[currentSongStatus.index]?.title}
            </p>
          </>
        )}
      </div>
      <div className={styles.controls}>
        <i class="fa fa-random" aria-hidden="true" onClick={shuffleSong}></i>
        <i class="fa fa-backward" aria-hidden="true" onClick={lastSong}></i>
        <i
          class={currentSongStatus.isPlaying ? "fa fa-pause" : "fa fa-play"}
          aria-hidden="true"
          onClick={playPause}
        ></i>
        <i class="fas fa-forward" onClick={nextSong}></i>
        {loopIcon(currentSongStatus.queueStatus)}
      </div>
      <div className={styles.seeker}>
        <label htmlFor="seeker">
          {videoPlayer.current !== undefined
            ? secondsToMinutes(parseInt(currentTime))
            : ""}
        </label>
        <input
          type="range"
          name="seeker"
          min={0}
          max={99}
          step="0.02"
          style={seekerStyle}
          value={seekerLength}
          onInput={(e) => {
            videoPlayer.current?.seekTo(
              (e.target.value * videoPlayer.current.getDuration()) / 100,
              "seconds"
            );
            setSeekerLength(e.target.value);
            if (userInfo.isInRoom) {
              db.ref("rooms/" + userInfo.roomId + "/seekTo").set(
                (e.target.value * videoPlayer.current.getDuration()) / 100
              );
            }
          }}
        />
        <label htmlFor="seeker">
          {videoPlayer.current !== undefined
            ? secondsToMinutes(parseInt(videoPlayer.current?.getDuration()))
            : "0:00"}
        </label>
      </div>
      <div className={styles.volume}>
        <i class="fa fa-volume-up" aria-hidden="true"></i>
        <input
          type="range"
          name="seeker"
          min={0}
          max={0.999}
          step="any"
          style={volumeStyle}
          value={userInfo.volume}
          onInput={(e) => {
            setUserInfo({
              ...userInfo,
              volume: e.target.value,
            });
            setVolumeLength(e.target.value);
          }}
        />
      </div>
    </div>
  );
};

export default Player;
