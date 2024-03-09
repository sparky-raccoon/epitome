interface Source {
  type: string;
  name: string;
  url: string;
}

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

const isSource = (source: unknown): source is Source => {
  if (!source || typeof source !== "object") {
    return false;
  }

  return (
    source &&
    "type" in source &&
    "name" in source &&
    "url" in source
  );
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
    "dateMs" in publication &&
    "sourceId" in publication
  );
};

export {
  Source,
  isSource,
  Publication,
  isPublication,
};
