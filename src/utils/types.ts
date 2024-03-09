import { Source, SourceCreation } from "@/bdd/models/source";
import { Tag, TagCreation } from "@/bdd/models/tag";

interface Publication {
  type: string;
  name: string;
  title: string;
  link: string;
  contentSnippet: string;
  date: string;
  dateMs: number;
  author?: string;
  sourceId: string;
  duplicateSources?: string[];
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

const isTagCreation = (tagCreation: unknown): tagCreation is TagCreation => {
  if (!tagCreation || typeof tagCreation !== "object") {
    return false;
  }

  return tagCreation && "name" in tagCreation;
};

const isTagCreationList = (tagCreationList: unknown): tagCreationList is TagCreation[] => {
  if (!tagCreationList || !Array.isArray(tagCreationList)) {
    return false;
  }

  return tagCreationList.every(isTagCreation);
};

const isTag = (tag: unknown): tag is Tag => {
  return isTagCreation(tag) && "id" in tag;
};

const isTagList = (tagList: unknown): tagList is Tag[] => {
  if (!tagList || !Array.isArray(tagList)) {
    return false;
  }

  return tagList.every(isTag);
};

const isSourceAndTagList = (sourceAndTagList: unknown): sourceAndTagList is (Source | Tag)[] => {
  if (!sourceAndTagList || !Array.isArray(sourceAndTagList)) {
    return false;
  }

  return sourceAndTagList.every((item) => isSource(item) || isTag(item));
};

export {
  Publication,
  isPublication,
  isSource,
  isSourceCreation,
  isTag,
  isTagCreation,
  isTagCreationList,
  isTagList,
  isSourceAndTagList,
};
