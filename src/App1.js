import React, { useRef } from "react";
import { getTokenOrRefresh } from "./token_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import ReactPlayer from "react-player";
import { useState } from "react";

import "./custom.css";

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");
let transcribedText = "";

async function startRecording(audioConfig, setRecognizer, language = "en-US") {
  const tokenObj = await getTokenOrRefresh();
  const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
    tokenObj.authToken,
    tokenObj.region
  );
  speechConfig.speechRecognitionLanguage = language;
  try {
    const recognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    setRecognizer(recognizer);
    recognizer.startContinuousRecognitionAsync();
    recognizer.recognized = function (s, e) {
      if (e.result.text) {
        if (transcribedText === "") {
          transcribedText = e.result.text;
        } else {
          transcribedText = transcribedText + " " + e.result.text;
        }
      }
    };
  } catch (err) {
    console.log(`Recognizer error: ${err.message}`);
  }
}

async function stopRecording(recognizer) {
  recognizer.stopContinuousRecognitionAsync();
}

function App() {
  const [myStream, setMyStream] = useState();
  const textBox = useRef("");
  const [recognizer, setRecognizer] = useState();

  const streamVideo = async () => {
    if (myStream && recognizer) {
      setMyStream(null);
      stopRecording(recognizer);
      setTimeout(() => {
        textBox.current.innerHTML = transcribedText;
      }, 1000);
    } else {
      setMyStream(
        await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        })
      );
      let audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioConfig = speechsdk.AudioConfig.fromStreamInput(audioStream);
      startRecording(audioConfig, setRecognizer);
    }
  };

  return (
    <div className="app">
      {myStream ? (
        <ReactPlayer playing width="35rem" height="25rem" url={myStream} />
      ) : (
        <div className="video-capture" />
      )}
      <FontAwesomeIcon size="2x" icon={faVideo} onClick={streamVideo} />
      <p ref={textBox}></p>
    </div>
  );
}

export default App;
