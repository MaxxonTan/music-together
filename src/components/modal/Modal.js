import React, { useState, useContext, useEffect } from "react";
import styles from "./Modal.module.scss";
import { db } from "../../firebase/firebase";
import { SongQueueContext } from "../../App";
import toast from "react-hot-toast";

const Modal = (props) => {
  const {
    songQueue,
    setSongQueue,
    currentSongStatus,
    setCurrentSongStatus,
    userInfo,
    setUserInfo,
  } = useContext(SongQueueContext);
  const [roomId, setRoomId] = useState("");
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [invalidRoom, setInvalidRoom] = useState(false);

  useEffect(() => {
    if (userInfo.isInRoom) {
      db.ref("rooms/" + userInfo.roomId + "/users").on("value", (snap) => {
        setUsers(Object.values(snap.val()));
      });
    }
  }, [userInfo.isInRoom, userInfo.roomId]);

  const generateId = () => {
    return (Math.random() + 1).toString(36).substring(7);
  };

  const addListeners = (id) => {
    //Song queue listener
    db.ref("rooms/" + id + "/songQueue").on("value", (snap) => {
      if (snap.val()) {
        setSongQueue(snap.val());
      } else {
        setSongQueue([]);
      }
    });
  };

  const handleSubmit = () => {
    let tempUserId = generateId();

    if (roomId !== "") {
      //Join room

      db.ref("rooms/" + roomId).once("value", (snap) => {
        if (snap.exists()) {
          setUserInfo({
            name: name,
            userId: tempUserId,
            isInRoom: true,
            roomId: roomId,
          });
          db.ref("rooms/" + roomId + "/users").set({
            ...snap.val().users,
            [tempUserId]: name,
          });

          db.ref("rooms/" + roomId + "/users").once("value", (snap) => {
            setUsers(Object.values(snap.val()));
          });

          db.ref("rooms/" + roomId + "/users").on("child_added", (snap) => {
            toast(snap.val() + " joined the room");
          });

          db.ref("rooms/" + roomId + "/users").on("child_removed", (snap) => {
            toast(snap.val() + " left the room");
          });

          if (snap.child("songQueue").exists())
            setSongQueue(snap.val().songQueue);
          setCurrentSongStatus(snap.val().currentSongStatus);

          //Set duration to 0 to get everyone in sync when someone joins
          db.ref("rooms/" + roomId + "/currentSongStatus/isPlaying").set(false);
          db.ref("rooms/" + roomId + "/seekTo").set(0.001);
        } else setInvalidRoom(true);
      });

      addListeners(roomId);
    } else {
      //create room
      let tempRoomId = generateId();

      setUserInfo({
        name: name,
        userId: tempUserId,
        isInRoom: true,
        roomId: tempRoomId,
      });

      db.ref("rooms/" + tempRoomId).set({
        users: {
          [tempUserId]: name,
        },
        seekTo: 0,
        songQueue: songQueue,
        currentSongStatus: currentSongStatus,
      });

      db.ref("rooms/" + tempRoomId + "/users").once("value", (snap) => {
        setUsers(Object.values(snap.val()));
      });

      db.ref("rooms/" + tempRoomId + "/users").on("child_added", (snap) => {
        toast(snap.val() + " joined the room");
      });

      db.ref("rooms/" + tempRoomId + "/users").on("child_removed", (snap) => {
        toast(snap.val() + " left the room");
      });

      addListeners(tempRoomId);
      setRoomId(tempRoomId);
    }
  };

  //Update db when user disconnects
  useEffect(() => {
    if (userInfo.isInRoom === true) {
      db.ref("rooms/" + userInfo.roomId + "/users/" + userInfo.userId)
        .onDisconnect()
        .remove();
    }
  }, [userInfo]);

  return (
    <>
      <div className={styles.overlay} onClick={() => props.handler()}></div>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h1>Listen with others</h1>
          <i
            class="fa fa-times"
            aria-hidden="true"
            onClick={() => props.handler()}
          ></i>
        </div>

        {!userInfo.isInRoom ? (
          <>
            <div className={styles.field}>
              <label htmlFor="name">
                <i className="fa fa-user" aria-hidden="true"></i>
              </label>
              <input
                type="text"
                id="name"
                autoComplete="off"
                placeholder="Name"
                value={name}
                onInput={(e) => setName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="roomId">
                <i className="fas fa-id-card-alt"></i>
              </label>
              <input
                type="text"
                id="roomId"
                autoComplete="off"
                placeholder="Room ID"
                value={roomId}
                onInput={(e) => setRoomId(e.target.value)}
              />
            </div>
            <button
              className={styles.submit}
              onClick={handleSubmit}
              disabled={name === ""}
            >
              {roomId ? "Join" : "Create"} room
            </button>
            {invalidRoom ? (
              <p className={styles.invalid}>Invalid room id</p>
            ) : (
              <p>*Leave room Id blank to create room</p>
            )}
          </>
        ) : (
          <div className={styles.roomInfo}>
            <div
              className={styles.roomId}
              onClick={(e) => {
                navigator.clipboard.writeText(userInfo.roomId);
                toast("Copied to clipboard");
              }}
            >
              <h1>Room : {userInfo.roomId}</h1>
              <i class="far fa-clone"></i>
            </div>

            <h2>Users</h2>
            <div className={styles.users}>
              {users.map((user) => {
                return <p className={styles.user}>{user}</p>;
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Modal;
