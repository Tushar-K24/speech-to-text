import React, { useRef } from "react";
import { getTokenOrRefresh } from "./token_util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faVideo } from "@fortawesome/free-solid-svg-icons";
import ReactPlayer from "react-player";
import { useState } from "react";

import "./custom.css";

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

async function startRecording(
  audioConfig,
  setRecognizer,
  displayText,
  combinedText
) {
  const tokenObj = await getTokenOrRefresh();
  const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
    tokenObj.authToken,
    tokenObj.region
  );
  speechConfig.speechRecognitionLanguage = "en-US";
  const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
  setRecognizer(recognizer);
  recognizer.startContinuousRecognitionAsync();
  recognizer.recognizing = function (s, e) {
    displayText.current.innerHTML = combinedText + " " + e.result.text;
  };
  recognizer.recognized = function (s, e) {
    if (e.result.text) {
      combinedText = combinedText + " " + e.result.text;
      displayText.current.innerHTML = combinedText;
    }
  };
}

async function stopRecording(recognizer, setRecognizer) {
  recognizer.stopContinuousRecognitionAsync();
  setRecognizer(null);
}

function App() {
  const [myStream, setMyStream] = useState();
  const [recognizer, setRecognizer] = useState({});
  const textBox = useRef("");
  let combinedText = "";

  const streamVideo = async () => {
    if (myStream) {
      setMyStream(null);
      stopRecording(recognizer, setRecognizer);
    } else {
      let stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      });
      let audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      console.log(audioStream.getTracks());
      setMyStream(stream);
      const audioConfig = speechsdk.AudioConfig.fromStreamInput(audioStream);

      startRecording(audioConfig, setRecognizer, textBox, combinedText);
    }
  };

  const uploadAudio = async (e) => {
    const audioFile = e.target.files[0];
    const audio = convert2wav(audioFile);
    // const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audio);
    // startRecording(audioConfig, setRecognizer, textBox, combinedText);
    // stopRecording(recognizer, setRecognizer);
  };

  return (
    <div className="app">
      {myStream ? (
        <ReactPlayer playing width="35rem" height="25rem" url={myStream} />
      ) : (
        <div className="video-capture" />
      )}
      <FontAwesomeIcon size="2x" icon={faVideo} onClick={streamVideo} />
      <label htmlFor="audio-file">
        <FontAwesomeIcon size="2x" icon={faMicrophone} />
      </label>
      <input
        type="file"
        id="audio-file"
        onChange={(e) => uploadAudio(e)}
        style={{ display: "none" }}
      />
      <p ref={textBox}></p>
    </div>
  );
}

export default App;
