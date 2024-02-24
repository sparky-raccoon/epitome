import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { firestore as db } from "@/bdd/firestore";

interface FSource {
    id?: string;
    type?: string;
    name: string;
    url: string;
    channels: string[];
}

const isFSource = (source: unknown): source is FSource => {
    if (!source || typeof source !== "object") {
        return false;
    }

    return source && "name" in source && "url" in source && "channels" in source;
}

export { FSource, isFSource }

export default class Source {
    static add = async (source: FSource) => {
        if (!source.id) source.id = uuidv4()
        if (!source.type) source.type = "rss"

        await setDoc(doc(db, "sources", source.id), source);
    }

    static findWithUrl = async (url :string) => {
        const q = query(collection(db, "sources"), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const source = querySnapshot.docs[0].data() as FSource;
        return source;
    }

    static findWithName = async (name :string) => {
        const q = query(collection(db, "sources"), where("name", "==", name));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const source = querySnapshot.docs[0].data() as FSource;
        return source;
    }

    static delete = async (id?: string) => {
        if (!id) throw new Error("No id provided for source deletion.");
        await deleteDoc(doc(db, "sources", id));
    }

    static findWithChannelId = async (channelId: string) => {
        const q = query(collection(db, "sources"), where("channels", "array-contains", channelId));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const sources = querySnapshot.docs.map((doc) => doc.data() as FSource);
        return sources;
    }
}