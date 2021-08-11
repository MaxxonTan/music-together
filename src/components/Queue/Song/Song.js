import React, { useContext } from "react";
import styles from "./Song.module.scss";
import { SongQueueContext } from "../../../App";
import { Draggable } from "react-beautiful-dnd";
import { db } from "../../../firebase/firebase";

const Song = (props) => {
  const {
    songQueue,
    setSongQueue,
    currentSongStatus,
    setCurrentSongStatus,
    userInfo,
  } = useContext(SongQueueContext);

  const deleteSong = () => {
    const songs = Array.from(songQueue);
    songs.splice(props.index, 1);

    if (props.index === songQueue.length - 1) {
      setCurrentSongStatus({ ...currentSongStatus, index: props.index - 1 });
      db.ref("rooms/" + userInfo.roomId + "/songQueue").set(songs);
      db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(
        props.index - 1
      );
    } else if (songQueue.length === 0)
      setCurrentSongStatus({ ...currentSongStatus, index: 0 });
    db.ref("rooms/" + userInfo.roomId + "/songQueue").set(songs);
    db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/index").set(0);
    setSongQueue(songs);
  };

  const playSong = () => {
    setCurrentSongStatus({
      ...currentSongStatus,
      index: props.index,
      isPlaying: true,
    });

    if (userInfo.isInRoom)
      db.ref("rooms/" + userInfo.roomId + "/currentSongStatus").set({
        ...currentSongStatus,
        index: props.index,
        isPlaying: true,
      });
  };

  return (
    <Draggable draggableId={props.video.title} index={props.index}>
      {(provided) => (
        <div
          className={styles.song}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <i class="fas fa-play" onClick={playSong}></i>
          <div className={styles.content}>
            <p>{props.video.title}</p>
            <p>{props.video.artist}</p>
          </div>
          <p>{props.video.duration}</p>
          <i class="fas fa-trash-alt" onClick={deleteSong}></i>
          <i class="fa fa-bars" aria-hidden="true"></i>
        </div>
      )}
    </Draggable>
  );
};

export default Song;
