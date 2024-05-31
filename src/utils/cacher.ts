import NodeCache from "node-cache";
import slugify from "slugify";

class CacheManager {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache();
  }

  _calculateKey(channelId: string, publicationTitle: string): string {
    const slugifiedId = slugify(channelId, { lower: true });
    const slugifiedTitle = slugify(publicationTitle, { lower: true });
    return `${slugifiedId}-${slugifiedTitle}`;
  }

  set(channelId: string, publicationTitle: string): void {
    this.cache.set(
      this._calculateKey(channelId, publicationTitle),
      true,
      60 * 60 * 24 * 3
    );
  }

  has(channelId: string, publicationTitle: string): boolean {
    return this.cache.has(this._calculateKey(channelId, publicationTitle));
  }
}

const cacheManager = new CacheManager();
export default cacheManager;
