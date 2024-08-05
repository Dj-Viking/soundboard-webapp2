import type { MIDIAccessRecord } from "./app/MIDIController";

declare global {
    interface ObjectConstructor {
        keys<T extends object, K extends keyof T = keyof T>(o: T): Array<K>; 
    }
    interface Navigator {
        requestMIDIAccess(): Promise<MIDIAccessRecord>;
    }
}
export {}