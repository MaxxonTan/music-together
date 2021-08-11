import React from "react";
import styles from "./Navbar.module.scss";
import { useState, useEffect } from "react";
import SearchResults from "../Landing/SearchResults/SearchResults";
import axios from "axios";

export const Navbar = () => {
  const API_KEY = process.env.REACT_APP_API_KEY;

  const [focus, setFocus] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasWords, setHasWords] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (inputValue) {
      setHasWords(true);
    } else {
      setHasWords(false);
      setSearchResults([]);
    }
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();

    setSearchResults([]);
    axios
      .get(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&videoCategoryId=10&q=${inputValue}&key=${API_KEY}`
      )
      .then((res) => {
        setSearchResults(
          res.data.items.map((video) => {
            return {
              title: video.snippet.title,
              artist: video.snippet.channelTitle,
              videoId: video.id.videoId,
              thumbnail: video.snippet.thumbnails.default,
            };
          })
        );
      })
      .catch((e) => console.log(e));
  };

  return (
    <div className={styles.navbar}>
      {searchResults.length !== 0 ? (
        <div className={styles.overlay} onClick={() => setInputValue("")}></div>
      ) : (
        ""
      )}

      <div className={styles.container}>
        <div className={`${styles.search} ${focus ? styles.focus : ""}`}>
          <i className="fas fa-search"></i>
          <form onSubmit={(e) => handleSubmit(e)} className={styles.form}>
            <input
              autoComplete="off"
              value={inputValue}
              type="text"
              id="search"
              placeholder="Search"
              onFocus={() => setFocus(true)}
              onBlur={() => {
                setFocus(false);
              }}
              onInput={(e) => setInputValue(e.target.value)}
            />
          </form>

          {hasWords ? (
            <i
              className="fas fa-times cancel"
              onClick={() => setInputValue("")}
            ></i>
          ) : (
            ""
          )}
          {searchResults.length !== 0 ? (
            <div className={styles.searchResults}>
              {searchResults.map((video) => {
                return <SearchResults video={video} key={video.videoId} />;
              })}
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};
