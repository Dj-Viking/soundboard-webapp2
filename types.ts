import type { MIDIAccessRecord, MIDIController, MIDIInputName, UIInterfaceDeviceName } from "./app/MIDIController.js";
import type { IButton } from "./app/Button.js"
import type { IMIDIMappingPreference } from "./app/MIDIMapping.js";
declare global {
    interface ObjectConstructor {
        keys<T extends object, K extends keyof T = keyof T>(o: T): Array<K>; 
    }
    interface Navigator {
        requestMIDIAccess(): Promise<MIDIAccessRecord>;
    }

    type KeyboardKey = "m" | "M" | "Alt" | "f" | "Control" | "Shift"

    type KeyControlMap = Record<KeyboardKey, boolean>;

    interface State {
        keyControl: KeyControlMap,
        isPlaying: boolean,
        currentlyPlayingButton: IButton | null,
        allButtons: Record<IButton["el"]["id"], IButton>,
        midiController: MIDIController,
        isListeningForMIDIMappingEdits: boolean,
        mappingEditOptions: { uiName: "" | UIInterfaceDeviceName, }
        usingFader: boolean,
        usingKnob: boolean,
        isMIDIEdit: boolean,
        MidiMappingPreference: IMIDIMappingPreference<MIDIInputName>,
    }
}