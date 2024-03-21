import { Client } from "discord.js";
import { schedule } from "node-cron";
import logger from "@/utils/logger";
import { Publication } from "@/utils/types";
import FirestoreSource from "@/bdd/collections/source";
import { getRssPubs, getFilteredPubsByChannel, publish } from "@/utils/publisher";

const initCronJob = async (client: Client) => {
  logger.info("Initializing cron job");

  const checkAndPost = async () => {
    const sourceFullList = await FirestoreSource.getAll();
    if (sourceFullList.length === 0) return;

    // For now, only RSS sources are supported so it's safe to pass the full list.
    const publications: Publication[] = await getRssPubs(sourceFullList);
    const filteredPubsByChannel = await getFilteredPubsByChannel(publications, sourceFullList);
    await publish(client, filteredPubsByChannel);
  };

  checkAndPost();
  schedule("0 */1 * * *", () => checkAndPost());
};

export default initCronJob;
