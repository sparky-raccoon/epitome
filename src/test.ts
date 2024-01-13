import {
  initDatabase,
  listChannelIds,
  listChannelSources,
  updateSourceTimestamp,
} from "./bdd/operator";

const resetFirstTimestampSource = async () => {
  await initDatabase();
  const channels = await listChannelIds();
  for (const channelId of channels) {
    const sources = await listChannelSources(channelId);
    const { id } = sources[0];
    const newTimestamp = "0";
    console.log(`Updating source ${id} with timestamp ${newTimestamp}`);
    await updateSourceTimestamp(id, newTimestamp);
  }
};

(async () => {
  try {
    await resetFirstTimestampSource();
  } catch (err) {
    console.error(err);
  }
})();
