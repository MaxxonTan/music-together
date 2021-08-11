import React, { useContext } from "react";
import styles from "./SearchResults.module.scss";
import { SongQueueContext } from "../../../App";
import { db } from "../../../firebase/firebase";
import axios from "axios";

const SearchResults = (props) => {
  const { songQueue, setSongQueue, userInfo } = useContext(SongQueueContext);

  //Gets video duration and add them to queue
  const getVideoDuration = () => {
    axios
      .get(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${props.video.videoId}&key=AIzaSyCd9R94NO8BnSE5xx0kqKAp_Br_OVo6RI4`
      )
      .then((res) => {
        let videoDuration = res.data.items[0].contentDetails.duration;
        let videoDurationMatch = videoDuration.match(/\d[HMS]+/g);
        let artist = props.video.artist;

        if (artist.includes("- Topic")) {
          artist = artist.replace("- Topic", "");
        }

        let hours = 0;
        let hasHours = false;
        let minutes = 0;
        let seconds = 0;
        let isInQueue = false;

        videoDurationMatch.forEach((element) => {
          if (element.includes("H")) {
            hasHours = true;
            hours = element.substr(0, element.indexOf("H"));
          }
          if (element.includes("M"))
            minutes = element.substr(0, element.indexOf("M"));
          if (element.includes("S"))
            seconds = element.substr(0, element.indexOf("S"));
        });

        if (hours < 10 && hasHours === true) {
          hours = "0" + hours;
        }
        if (minutes < 10 && hasHours === true) {
          minutes = "0" + minutes;
        }
        if (seconds < 10) {
          seconds = "0" + seconds;
        }

        videoDuration = `${
          hasHours
            ? hours + ":" + minutes + ":" + seconds
            : minutes + ":" + seconds
        }`;

        const song = {
          title: props.video.title,
          artist: artist,
          videoId: props.video.videoId,
          thumbnail: props.video.thumbnail,
          duration: videoDuration,
        };

        //Check if song is in queue
        songQueue.forEach((element) => {
          if (element.title === song.title) {
            isInQueue = true;
          }
        });

        if (isInQueue === false) {
          setSongQueue([...songQueue, song]);
          if (userInfo.isInRoom) {
            db.ref("rooms/" + userInfo.roomId + "/songQueue").set([
              ...songQueue,
              song,
            ]);
          }
        }
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className={styles.searchResults} onClick={getVideoDuration}>
      <div className={styles.container}>
        <p>{props.video.title}</p>
        <p>{props.video.artist}</p>
      </div>
      <img src={props.video.thumbnail.url} alt="thumbnail" />
    </div>
  );
};

export default SearchResults;
