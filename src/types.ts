import { SourceType } from "./constants";

type SourceList = {
  [type in SourceType]?: {
    [name: string]: {
      id: string;
      url: string;
      feed?: string;
      timestamp: string;
    };
  };
};

interface Source {
  id: string;
  type: SourceType;
  name: string;
  url: string;
  feed?: string;
}

export { SourceList, Source };
