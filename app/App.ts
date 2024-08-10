import type { UIInterfaceDeviceName } from "./MIDIController.js";
import { createMIDIMappingPreference } from "./MIDIMapping.js";

// application state (global)
export const state: State = {
    keyControl: {
        m: false,
        M: false,
        Alt: false,
        f: false,
        Control: false,
        Shift: false,
    },
    isPlaying: false,
    currentlyPlayingButton: null,
    allButtons: {},
    midiController: {} as any,
    isListeningForMIDIMappingEdits: false,
    mappingEditOptions: { uiName: "" as any as UIInterfaceDeviceName },
    usingFader: false,
    usingKnob: false,
    isMIDIEdit: false,
    MidiMappingPreference: createMIDIMappingPreference("Not Found"),
};


export function renderApp(
    buttonModule: typeof import("./Button.js"),
    stylesModule: typeof import("./Styles.js"),
    idbModule: typeof import("./IDB.js"),
    storageModule: typeof import("./Storage.js"),
    uiModule: typeof import("./UI.js")
) {
    // HEAD //
    {
        uiModule.setupDocumentHead(stylesModule);
    }
    // HEAD //

    // TXT //
    const ctrlKeyMessageSpan = uiModule.createCtrlKeyMessageSpan();
    const fKeyMessageSpan = uiModule.createFKeyMessageSpan();
    // TXT //
    

    // EVENTS //
    {
        uiModule.setupKeyListeners(fKeyMessageSpan, ctrlKeyMessageSpan, state);
    }
    // EVENTS //


    // RENDERING //
    {
        document.body.innerHTML = "";
        const volumeControlInput: HTMLInputElement = uiModule.setupVolumeControlInput(state);
        const stopButtonEl = document.createElement("button");
        
        const soundboardContainer = uiModule.setupSoundboardContainer(buttonModule, storageModule, idbModule, volumeControlInput, stopButtonEl, state);
        
        const buttonControlContainer = uiModule.setupButtonControlContainer(
            buttonModule, 
            idbModule, 
            storageModule, 
            soundboardContainer, 
            volumeControlInput, 
            stopButtonEl,
            fKeyMessageSpan,
            ctrlKeyMessageSpan,
            state
        );
        // render into document body
        document.body.append(buttonControlContainer, soundboardContainer);
    }
    // RENDERING //
}