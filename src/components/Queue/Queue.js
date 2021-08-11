import React, { useState, useContext } from "react";
import styles from "./Queue.module.scss";
import Song from "./Song/Song";
import Modal from "../modal/Modal";

import { SongQueueContext } from "../../App";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { db } from "../../firebase/firebase";

const Queue = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [queueName, setQueueName] = useState("Queue");
  const {
    songQueue,
    setSongQueue,
    currentSongStatus,
    setCurrentSongStatus,
    userInfo,
  } = useContext(SongQueueContext);

  const onDragEnd = (result) => {
    const songs = Array.from(songQueue);
    const [reorderdItem] = songs.splice(result.source.index, 1);
    songs.splice(result.destination.index, 0, reorderdItem);

    setSongQueue(songs);

    db.ref("rooms/" + userInfo.roomId + "/songQueue").set(songs);
  };

  const play = () => {
    setCurrentSongStatus({ ...currentSongStatus, index: 0, isPlaying: true });

    db.ref("rooms/" + userInfo.roomId + "/currentSongStatus").set({
      ...currentSongStatus,
      index: 0,
      isPlaying: true,
    });
  };

  const shuffleSong = () => {
    let tempArray = songQueue;

    tempArray.sort(() => Math.random() - 0.5);
    setCurrentSongStatus({ ...currentSongStatus, isPlaying: false });
    setSongQueue(tempArray);
    setCurrentSongStatus({ ...currentSongStatus, isPlaying: true });

    db.ref("rooms/" + userInfo.roomId + "/songQueue").set(tempArray);
    db.ref("rooms/" + userInfo.roomId + "/currentSongStatus/isPlaying").set(
      true
    );
  };

  const modalHandler = () => {
    setModalOpen(false);
  };

  return (
    <>
      {modalOpen ? <Modal modalOpen={modalOpen} handler={modalHandler} /> : ""}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={styles.queue}>
          <input
            type="text"
            value={queueName}
            onInput={(e) => setQueueName(e.target.value)}
          />
          <div className={styles.buttons}>
            <button className={styles.play} onClick={play}>
              <i class="fa fa-play" aria-hidden="true"></i>
            </button>
            <button onClick={shuffleSong}>
              <i class="fa fa-random" aria-hidden="true"></i>
            </button>
            <button onClick={() => setModalOpen(true)}>
              <i class="fas fa-users"></i>
            </button>
          </div>
          <Droppable droppableId="queue">
            {(provided) => (
              <div
                className={styles.songs}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {songQueue.length > 0 ? (
                  songQueue.map((song, index) => {
                    return (
                      <Song video={song} key={song.videoId} index={index} />
                    );
                  })
                ) : (
                  <h1 className={styles.tut}>(Use search bar to add songs)</h1>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>
    </>
  );
};

export default Queue;
