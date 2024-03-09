import { collection, where, setDoc, getDoc, getDocs, deleteDoc, doc, query } from "firebase/firestore";
import { firestore as db } from "@/bdd/firestore";

interface FChannel {
    id: string;
    guildId: string;
    filters: string[];
}

export { FChannel }
export default class FirestoreChannel {
    static add = async (channel: FChannel): Promise<void> => {
        const existingChannel = await FirestoreChannel.getWithId(channel.id);
        if (existingChannel) return;

        await setDoc(doc(db, "channels", channel.id), channel);
    }

    static getWithId = async (id: string): Promise<FChannel | null> => {
        const channelDoc = doc(db, "channels", id);
        const channelSnap = await getDoc(channelDoc);
        if (!channelSnap.exists()) return null;

        const channel = channelSnap.data() as FChannel;
        return channel;
    }

    static getWithGuildId = async (guildId: string): Promise<FChannel[]> => {
        const q = query(collection(db, "channels"), where("guildId", "==", guildId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const channels = querySnapshot.docs.map((doc) => doc.data()) as FChannel[];
        return channels;
    }

    static delete = async (id: string, failSilently = false): Promise<void> => {
        try {
            await deleteDoc(doc(db, "channels", id));
        } catch (err) {
            if (!failSilently) throw err;
        }
    }

    static addFilters = async (id: string, newFilters: string[]): Promise<void> => {
        const channel = await FirestoreChannel.getWithId(id);
        if (!channel) return;

        const filters = [...channel.filters, ...newFilters];
        await setDoc(doc(db, "channels", id), { ...channel, filters });
    }

    static getFilters = async (id: string): Promise<string[]> => {
        const channel = await FirestoreChannel.getWithId(id);
        if (!channel) return [];

        return channel.filters;
    }

    static deleteFilter = async (id: string, filter: string): Promise<void> => {
        const channel = await FirestoreChannel.getWithId(id);
        if (!channel) return;

        const filters = channel.filters.filter((f) => f !== filter);
        await setDoc(doc(db, "channels", id), { ...channel, filters });
    }
}