enum DeviceTypes {
  AUDIOINPUT = "audioinput",
  AUDIOOUTPUT = "audiooutput",
  VIDEOINPUT = "videoinput",
}

type IDevice = {
  deviceId: string;
  kind: DeviceTypes;
  label: string;
};

export type RootState = {
  audioInputId?: string,
  cameraId?: string
};

const rootReducer = (state: RootState, action: any): RootState => {
  const { type, ...data } = action;
  return {
    ...state,
    ...data,
  };
};


export default rootReducer
