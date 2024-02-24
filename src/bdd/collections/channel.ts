import { setDoc, getDoc, doc } from "firebase/firestore";
import { firestore as db } from "@/bdd/firestore";

interface FChannel {
    id: string;
    filters: string[];
}

export { FChannel }

export default class Channel {
    static add = async (channel: FChannel) => {
        const existingChannel = await Channel.findWithId(channel.id);
        if (existingChannel) return;

        await setDoc(doc(db, "channels", channel.id), channel);
    }

    static findWithId = async (id: string) => {
        const channelDoc = doc(db, "channels", id);
        const channelSnap = await getDoc(channelDoc);
        if (!channelSnap.exists()) return null;

        const channel = channelSnap.data() as FChannel;
        return channel;
    }
}