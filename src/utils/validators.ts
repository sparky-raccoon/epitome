import axios from "axios";
import { Source } from "@/types";
import {
  formatTwitterUserFeedToSource,
  formatYouTubeChannelToSource,
} from "@/utils/formatters";

const youTubeChannelUrlFormat =
  /https:\/\/www\.youtube\.com\/(c\/){0,1}([\w-]+)/;
const twitterUrlFormat = /https:\/\/twitter\.com\/(\w+)/;
const instagramUrlFormat = /https:\/\/www\.instagram\.com\/(\w+)/;

const youTubeApiBaseUrl = "https://www.googleapis.com/youtube/v3";
const twitterApiBaseUrl = "https://api.twitter.com";

const axiosOptions = { validateStatus: (status: number) => status === 200 };

const getSourceFromUrl = ({ url }: { url: string }): Promise<Source | void> => {
  // FIXME :
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Source | void>(async (resolve, reject) => {
    if (youTubeChannelUrlFormat.test(url)) {
      // Should result in [ youtube.com/c/something, c/, something ] OR
      // [ youtube.com/something, undefined, something ].
      const matches = youTubeChannelUrlFormat.exec(url);
      if (matches?.length && matches[2]) {
        try {
          const channelUrlName = matches[2];
          const { data } = await axios.get(
            `${youTubeApiBaseUrl}/search?part=snippet&q=${channelUrlName}&type=channel&key=${process.env.YOUTUBE_API_KEY}`,
            axiosOptions
          );

          if (data.items?.[0]) {
            // FIXME: sometimes channelUrlName != channelName, depending on how
            // channels arer configured. Consequently, search results might be irrelevant. For now,
            // we can't rely on other solutions than this one, or parse the entire page to
            // retrieve the source info (most importantly, the channelID).
            const channelData = data.items[0];
            resolve(formatYouTubeChannelToSource(channelData, url));
          } else {
            reject(
              "Aucune chaîne YouTube n'a pu être trouvée à partir de cette url."
            );
          }
        } catch (err) {
          reject(err);
        }
      } else reject();
    } else if (twitterUrlFormat.test(url)) {
      const matches = twitterUrlFormat.exec(url);
      if (matches?.length && matches[1]) {
        try {
          const userName = matches[1];
          const { data } = await axios.get(
            `${twitterApiBaseUrl}/2/users/by/username/${userName}`,
            {
              ...axiosOptions,
              headers: { Authorization: `Bearer ${process.env.TWITTER_TOKEN}` },
            }
          );
          if (data.data) {
            const twitterData = data.data;
            // FIXME: still need elevated access to call status/user_timeline later.
            // Check developer.twitter.com/en/docs/twitter-api/v1/tweets/timelines/api-reference/get-statuses-user_timeline
            resolve(formatTwitterUserFeedToSource(twitterData, url));
          } else {
            reject(
              "Aucun compte Twitter n'a pu être trouvé à partir de cette url."
            );
          }
        } catch (err) {
          reject(err);
        }
      } else reject();
    } else if (instagramUrlFormat.test(url)) {
      reject("Route non implémentée.");
    } else {
      reject("Route non implémentée.");
    }
  });
};

export { getSourceFromUrl };
