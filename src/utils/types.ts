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

export {
  Publication,
  isPublication,
};
