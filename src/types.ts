import { SourceType } from "./constants";

type SourceList = {
  [type in SourceType]?: {
    [name: string]: SourceTrackingData;
  };
};

interface SourceTrackingData {
  url: string;
  feed?: string;
  timestamp: string;
}

interface Source extends Omit<SourceTrackingData, "timestamp"> {
  type: SourceType;
  name: string;
}

export { SourceList, Source, SourceTrackingData };
