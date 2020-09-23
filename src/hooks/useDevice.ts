import { useEffect, useState } from "react";
import AgoraRTC from "agora-rtc-sdk"
import { useDispatch } from "react-redux";

enum DeviceTypes {
  AUDIOINPUT = "audioinput",
  AUDIOOUTPUT = "audiooutput",
  VIDEOINPUT = "videoinput",
}

type IDevice = {
  deviceId: string,
  kind: DeviceTypes,
  label: string
}

export default function useDevice() {
  type IDeviceState = IDevice[] | null;
  const [audioInput, setAudioInput] = useState<IDeviceState>(null);
  const [audioOutput, setAudioOutput] = useState<IDeviceState>(null);
  const [videoInput, setVideoInput] = useState<IDeviceState>(null);

  useEffect(() => {
    AgoraRTC.getDevices(
      function (devices: IDevice[]) {
        const newDevices = {
          [DeviceTypes.AUDIOINPUT]: [] as IDevice[],
          [DeviceTypes.AUDIOOUTPUT]: [] as IDevice[],
          [DeviceTypes.VIDEOINPUT]: [] as IDevice[],
        }
        devices.forEach((device) => {
          newDevices[device.kind].push(device)
        })
        setAudioInput(newDevices[DeviceTypes.AUDIOINPUT])
        setAudioOutput(newDevices[DeviceTypes.AUDIOOUTPUT])
        setVideoInput(newDevices[DeviceTypes.VIDEOINPUT])
      },
      function (errStr: any) {
        console.error("Failed to getDevice", errStr);
      }
    )
  }, [])

  const dispatch = useDispatch()

  useEffect(() => {
    if (audioInput && audioInput.length) {
      dispatch({ type: "initAudioInput", audioInputId: audioInput[0].deviceId });
    }
  }, [audioInput, dispatch])

  useEffect(() => {
    if (audioOutput && audioOutput.length) {
      dispatch({ type: "initAudioOutput", audioInputId: audioOutput[0].deviceId });
    }
  }, [audioOutput, dispatch])

  useEffect(() => {
    if (videoInput && videoInput.length) {
      dispatch({ type: "initVideo", audioInputId: videoInput[0].deviceId });
    }
  }, [videoInput, dispatch])

  return [audioInput, audioOutput, videoInput];
}
