import { Source, SourceCreation } from "@/bdd/models/source";

interface Publication {
  type: string;
  name: string;
  title: string;
  link: string;
  contentSnippet: string;
  date: string;
  dateMs: number;
  author?: string;
}

const isPublication = (publication: unknown): publication is Publication => {
  if (!publication || typeof publication !== "object") {
    return false;
  }

  return (
    publication &&
    "type" in publication &&
    "name" in publication &&
    "title" in publication &&
    "link" in publication &&
    "contentSnippet" in publication &&
    "date" in publication &&
    "dateMs" in publication
  );
};

const isSourceCreation = (sourceCreation: unknown): sourceCreation is SourceCreation => {
  if (!sourceCreation || typeof sourceCreation !== "object") {
    return false;
  }

  return sourceCreation && "name" in sourceCreation && "url" in sourceCreation;
};

const isSource = (source: unknown): source is Source => {
  return isSourceCreation(source) && "id" in source;
};

const isSourceList = (sourceList: unknown): sourceList is Source[] => {
  if (!sourceList || !Array.isArray(sourceList)) {
    return false;
  }

  return sourceList.every(isSource);
};

export { Publication, isPublication, isSource, isSourceCreation, isSourceList };
