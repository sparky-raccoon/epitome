import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { firestore as db } from "@/bdd/firestore";
import { Source, isSource } from "@/utils/types";
import FirestoreChannel from "@/bdd/collections/channel";

interface FSource extends Source {
    id: string;
    channels: string[];
    lastParsedAt?: string;
}

const isFSource = (source: unknown): source is FSource => {
    return isSource(source) && "id" in source && "channels" in source;
}

export { FSource }
export default class FirestoreSource {
    static add = async (source: Source | FSource, channelId: string): Promise<FSource> => {
        let newSource: FSource;
        if (isFSource(source)) {
            const channels = [...source.channels, channelId];
            newSource = { ...source, channels }
            await setDoc(doc(db, "sources", source.id), newSource);
        } else {
            const id = uuidv4();
            newSource = {
                ...source,
                id,
                channels: [channelId]
            }
            await setDoc(doc(db, "sources", id), newSource);
        }
        return newSource;
    }

    static getWithUrl = async (url :string): Promise<FSource | null> => {
        const q = query(collection(db, "sources"), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const source = querySnapshot.docs[0].data() as FSource;
        return source;
    }

    static getWithName = async (name :string): Promise<FSource | null> => {
        const q = query(collection(db, "sources"), where("name", "==", name));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const source = querySnapshot.docs[0].data() as FSource;
        return source;
    }

    static getWithChannelId = async (channelId: string): Promise<FSource[]> => {
        const q = query(collection(db, "sources"), where("channels", "array-contains", channelId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const sources = querySnapshot.docs.map((doc) => doc.data()) as FSource[];
        return sources;
    }

    static getAll = async (): Promise<FSource[]> => {
        const q = query(collection(db, "sources"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const sources = querySnapshot.docs.map((doc) => doc.data()) as FSource[];
        return sources;
    }

    static delete = async (id?: string): Promise<void> => {
        if (!id) throw new Error("No id provided for source deletion.");
        await deleteDoc(doc(db, "sources", id));
    }

    static removeChannelFromList = async (channelId: string, sourceId?: string): Promise<void> => {
        const q = query(collection(db, "sources"), where("channels", "array-contains", channelId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return;

        const removals: Promise<void>[] = [];
        querySnapshot.forEach((s) => {
            if (sourceId && s.id !== sourceId) return;

            const source = s.data() as FSource;
            const channels = source.channels.filter((c: string) => c !== channelId);

            if (channels.length === 0) removals.push(FirestoreSource.delete(source.id));
            else removals.push(setDoc(doc(db, "sources", source.id), { ...source, channels }));
        });

        await Promise.all(removals);
        if (!sourceId || removals.length === querySnapshot.size) {
            await FirestoreChannel.delete(channelId);
        }
    }

    static updateLastParsedAt = async (id: string): Promise<void> => {
        await setDoc(doc(db, "sources", id), {
            lastParsedAt: new Date().toISOString()
        }, { merge: true });
    }
}