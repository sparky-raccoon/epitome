import { SourceType } from "./constants";

type SourceId = string;

type SourceList = {
  [type in SourceType]?: {
    [id: SourceId]: SourceTrackingData;
  };
};

interface SourceTrackingData {
  name: string;
  url: string;
  feed?: string;
  timestamp: string;
}

interface Source extends Omit<SourceTrackingData, "timestamp"> {
  id: SourceId;
  type: SourceType;
}

interface Publication {
  type: SourceType;
  name: string;
  title: string;
  link: string;
  contentSnippet: string;
  date: string;
  dateMs: number;
  author?: string;
}

export { SourceList, Source, SourceTrackingData, Publication };
