console.log("hello world");
import { WS_PORT } from "../common.js";
import type { UIInterfaceDeviceName } from "./MIDIController.js";
import { createMIDIMappingPreference } from "./MIDIMapping.js";

// application state (global)
const state: State = {
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


(async () => {

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)
    let buttonModule = await import("./Button.js");
    let styleModule = await import("./Styles.js");
    let idbModule = await import("./IDB.js");
    let storageModule = await import("./Storage.js");
    let uiModule = await import("./UI.js");
    
    // initialize indexed DB when the app starts
    idbModule.initButtonsIdb()
    
    ws.addEventListener("message", async (event) => {
        if (event.data.includes("hot")) {
            const timestamp = (Date.now()).toString();
            const browserCacheBust = "?date=" + timestamp;
            buttonModule = await import("./Button.js" + browserCacheBust);
            styleModule = await import ("./Styles.js" + browserCacheBust);
            idbModule = await import("./IDB.js" + browserCacheBust);
            storageModule = await import("./Storage.js" + browserCacheBust);
            uiModule = await import("./UI.js" + browserCacheBust);
            // could just export all the functions used
            // in rendering the app so that everything happening there is dynamically
            // loaded
            renderApp(buttonModule, styleModule, idbModule, storageModule, uiModule);
        }
    });
    
    renderApp(buttonModule, styleModule, idbModule, storageModule, uiModule);

})();


function renderApp(
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
    
    
    // TODO: 
    // private handleMIDIEditModeButtonClick = (): void => {
    //     this.isMIDIEdit = !this.isMIDIEdit;
    //     if (this.isMIDIEdit) {
    //         this.midiDeviceDisplay.showAssignmentSpans();
    //         this.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode ON";
    //         this.toggleMIDIEditModeButton.style.backgroundColor = "green";
    //     } else {
    //         this.midiDeviceDisplay.hideAssignmentSpans();
    //         this.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode OFF";
    //         this.toggleMIDIEditModeButton.style.backgroundColor = "grey";
    //     }
    // };

    }    
    // function refreshTrackProgress(audioEl: Button["audioEl"]): void {


// TODO: 
//     this.trackTimeTextSpan.textContent = `${this.convertTime(audioEl.currentTime)} -- ${this.convertTime(
//         audioEl.duration
//     )}`;

//     this.trackProgressBar.max = audioEl.duration;
//     this.trackProgressBar.value = audioEl.currentTime;
// }




