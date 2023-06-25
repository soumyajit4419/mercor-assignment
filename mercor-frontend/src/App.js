import React, { useState, useEffect, useRef } from "react";
import { useSpeechRecognition } from "react-speech-kit";
import axios from "axios";
import "./App.css";

function App() {
  const BASE_URL = "https://mercor-assignment-chi.vercel.app/";
  const [value, setValue] = useState("");
  const [allMessage, setAllMessage] = useState([]);
  const [prog, setProg] = useState(false);
  const chatContainerRef = useRef(null);
  const synth = window.speechSynthesis;

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setValue(result);
    },
  });

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
    utterance.onend = () => {
      listen();
    };
  };

  const stopSpeaking = () => {
    if (synth && synth.speaking) {
      synth.cancel();
      listen();
    }
  };

  useEffect(() => {
    if (value === "") {
      return;
    }
    const timer = setTimeout(() => {
      callGpt(value);
      stop();
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const scrollToBottom = () => {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };

  const callGpt = async (value) => {
    console.log(value, "my val");

    const updatedArr = [...allMessage, { role: "user", content: value }];
    setAllMessage(updatedArr);
    scrollToBottom();

    setProg(true);

    try {
      const response = await axios.post(BASE_URL + "getGTPText", {
        message: updatedArr,
      });

      console.log("Response:", response.data.value);

      if (response.data.status === 200) {
        const resMsg = response.data.value.choices[0].message;
        speak(resMsg.content);

        const tempArr = [...updatedArr, resMsg];
        console.log(tempArr, "my sms2");
        setAllMessage(tempArr);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error:-", error);
    }

    setProg(false);
  };

  return (
    <div className="App">
      <div className="chat-container" ref={chatContainerRef}>
        {allMessage.length === 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              height: "100%",
              justifyContent: "center",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: "40px" }}>
              Welcome to VoiceGPT
            </div>
          </div>
        )}
        {allMessage.map((msg, index) => (
          <div style={{ display: "flex", padding: "10px" }} key={index}>
            <div style={{ minWidth: "100px" }}>{msg.role} : </div>
            <div style={{ marginLeft: "8px", textAlign: "left" }}>
              {msg.content}
            </div>
            <br />
          </div>
        ))}
        {prog && <p style={{ paddingTop: "10px" }}> Processing... </p>}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            style={{ width: "70%" }}
          />
          <button onClick={listen} style={{ margin: "0 10px" }}>
            🎤 Start Speaking
          </button>
          <button onClick={stop} style={{ margin: "0 10px" }}>
            🛑 Stop Recording
          </button>
        </div>
        {listening && (
          <div style={{ marginTop: "8px" }}>Go ahead I'm listening</div>
        )}

        {synth.speaking && (
          <div style={{ marginTop: "8px" }}>
            <button onClick={stopSpeaking}> 🛑 Stop Speaking</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
