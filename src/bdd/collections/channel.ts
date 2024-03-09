import { setDoc, getDoc, deleteDoc, doc } from "firebase/firestore";
import { firestore as db } from "@/bdd/firestore";

interface FChannel {
    id: string;
    guildId: string;
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

    static getFilters = async (id: string) => {
        const channel = await Channel.findWithId(id);
        if (!channel) return [];

        return channel.filters;
    }

    static addFilters = async (id: string, newFilters: string[]) => {
        const channel = await Channel.findWithId(id);
        if (!channel) return;

        const filters = [...channel.filters, ...newFilters];
        await setDoc(doc(db, "channels", id), { ...channel, filters });
    }

    static deleteFilter = async (id: string, filter: string) => {
        const channel = await Channel.findWithId(id);
        if (!channel) return;

        const filters = channel.filters.filter((f) => f !== filter);
        await setDoc(doc(db, "channels", id), { ...channel, filters });
    }

    static delete = async (id: string, failSilently = false) => {
        try {
            await deleteDoc(doc(db, "channels", id));
        } catch (err) {
            if (!failSilently) throw err;
        }
    }
}