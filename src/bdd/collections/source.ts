import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { firestore as db } from "@/bdd/firestore";

interface FSource {
    id?: string;
    name: string;
    url: string;
    channels: string[];
}

export { FSource }

export default class Source {
    static add = async (source: FSource) => {
        if (!source.id) source.id = uuidv4()

        const sourceId = uuidv4()
        await setDoc(doc(db, "sources", sourceId), source);
    }

    static findWithUrl = async (url :string) => {
        const q = query(collection(db, "sources"), where("url", "==", url));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const source = querySnapshot.docs[0].data() as FSource;
        return source;
    }
}