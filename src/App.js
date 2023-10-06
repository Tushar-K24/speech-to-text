import React, { useEffect, useRef } from 'react';
import { getTokenOrRefresh } from './token_util';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import ReactPlayer from 'react-player';
import { useState } from 'react';

import './custom.css'

const speechsdk = require('microsoft-cognitiveservices-speech-sdk');

async function startRecording(setRecognizer, displayText, combinedText){
  const tokenObj = await getTokenOrRefresh();
  const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
  speechConfig.speechRecognitionLanguage = 'en-US';
  
  const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);
  setRecognizer(recognizer);
  recognizer.startContinuousRecognitionAsync();
  recognizer.recognizing = function(s, e){
    displayText.current.innerHTML = combinedText + ' ' + e.result.text;
  };
  recognizer.recognized = function(s,e){
    if(e.result.text){
      combinedText = combinedText + ' ' + e.result.text;
      displayText.current.innerHTML = combinedText;
    }
  }
}

async function stopRecording(recognizer, setRecognizer){
  recognizer.stopContinuousRecognitionAsync();
  setRecognizer(null);
}

function App() {
    const [myStream, setMyStream] = useState();
    const [recognizer, setRecognizer] = useState({});
    const textBox = useRef('');
    let combinedText = '';
    const handleClick = async ()=>{
      if(myStream){
        setMyStream(null);
        stopRecording(recognizer, setRecognizer);
      }else{
        let stream = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        setMyStream(stream);
        startRecording(setRecognizer, textBox, combinedText);
      }
    };

    return (
      <div className='app'>
        {myStream ?
        <ReactPlayer playing width="35rem" height="25rem" url={myStream}/>
        :<div className='video-capture' />}
        <FontAwesomeIcon size='2x' icon={faVideo} onClick={handleClick}/>
        <p ref={textBox}></p>
      </div>
    );
  }
  
export default App;
  