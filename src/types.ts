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

interface Publication {
  type: SourceType;
  name: string;
  title: string;
  link: string;
  contentSnippet: string;
  date: string;
  author?: string;
}

export { SourceList, Source, SourceTrackingData, Publication };
