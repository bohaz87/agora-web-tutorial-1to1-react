import React, { useCallback, useContext, useEffect, useState } from "react";
import useDevices from "../hooks/useDevice";
import AgoraRTC, { Stream } from "agora-rtc-sdk";
import StreamPlayer from "agora-stream-player";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux/reducer";

type IClient = any;

export default function Onboard() {
  const location = useLocation();
  const channel = location.hash.substr(1); // read channle from locaiton.hash
  const dispatch = useDispatch();

  const [AIes, AOes, VIes] = useDevices();
  const [localStream, setLocaleStream] = useLocaleStream();
  const [remoteStream, setRemoteStream]= useState<null | Stream>();
  const [joined, setJoined] = useState(false)

  const [client, setClient] = useState<IClient>(null);

 
  const join = async (options: any) => {
    const _client = AgoraRTC.createClient({
      mode: "live",
      codec: "vp8",
      ...options,
    });

    _client.init(process.env.REACT_APP_AGORA_APPID, function () {
      setClient(_client);
    });

    await new Promise((resolve, reject) => {
      _client.join(
        process.env.REACT_APP_AGORA_TOKEN,
        channel,
        null,
        resolve,
        reject
      );
    });

    _client.publish(localStream);

    _client.on("stream-added", (evt: any) => {
      _client.subscribe(evt.stream);
      setRemoteStream(evt.stream);
    });

    _client.on("peer-leave", (evt: any) => {
      const remoteStream = evt.stream
      if (remoteStream && remoteStream.isPlaying()) {
        remoteStream.stop()
      }
      setRemoteStream(null);
    });
    setJoined(true)
  };

  const leave = function () {
    client && client.leave(function() {
      // if (localStream.isPlaying()) {
      //   localStream.stop()
      // }
      // setLocaleStream(null)
      if (remoteStream.isPlaying()) {
        remoteStream.stop()
      }
      setRemoteStream(null)
      setJoined(false)
    });
  };

  // use state to drive mute 
  const [muteVideo, setMuteVideo] = useState(false);
  function toggleMuteVideo() {
    setMuteVideo(!muteVideo);
  }

  useEffect(() => {
    if (localStream) {
      if (muteVideo) {
        localStream.muteVideo();
      } else {
        localStream.unmuteVideo();
      }
    }
  }, [localStream, muteVideo]);

  return (
    <div>
      <div>
        <label>audio input: </label>
        <select>
          {AIes?.map((device) => (
            <option key={device.deviceId}>{device.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label>audio output: </label>
        <select
          onChange={(e) =>
            dispatch({
              type: "updateAudioInput",
              audioInputId: e.target.value,
            })
          }
        >
          {AOes?.map((device) => (
            <option key={device.deviceId}>{device.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label>video input: </label>
        <select
          onChange={(e) =>
            dispatch({ type: "updateCamera", cameraId: e.target.value })
          }
        >
          {VIes?.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>

      {localStream && (
        <StreamPlayer stream={localStream} fit="contain" label="local" />
      )}

      {remoteStream && (
        <StreamPlayer
          stream={remoteStream}
          fit="contain"
          label={remoteStream.getId()}
        />
      )}

      <button onClick={toggleMuteVideo}>{muteVideo ? 'unmute Video' : 'mute Video'}</button>
      {!joined ? (
        <button onClick={join}>join the meeting</button>
      ) : (
        <button onClick={leave}>leave the meeting</button>
      )}
    </div>
  );
}

function useLocaleStream() {
  const [localStream, setLocaStream] = useState<undefined | Stream>();
  const audioInputId = useSelector((state: RootState) => state.audioInputId);
  const cameraId = useSelector((state: RootState) => state.cameraId);

  // init local stream
  useEffect(() => {
    if (!localStream && (audioInputId || cameraId)) {
      const stream = AgoraRTC.createStream({
        streamID: 12345,
        video: true,
        audio: true,
        screen: false,
        microphoneId: audioInputId,
        cameraId: cameraId,
      });

      stream.init(() => {
        setLocaStream(stream);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputId, cameraId]);

  // switch device
  useEffect(() => {
    if (localStream && audioInputId) {
      localStream.switchDevice("audio", audioInputId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioInputId]);

  // switch device
  useEffect(() => {
    if (localStream && cameraId) {
      localStream.switchDevice("video", cameraId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraId]);

  return [localStream, setLocaStream];
}
