import type { UIInterfaceDeviceName } from "./MIDIController.js";
import { IMIDIDeviceDisplay } from "./MIDIDeviceDisplay.js";
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
    appModule: typeof import("./App.js"),
    buttonModule: typeof import("./Button.js"),
    stylesModule: typeof import("./Styles.js"),
    idbModule: typeof import("./IDB.js"),
    storageModule: typeof import("./Storage.js"),
    uiModule: typeof import("./UI.js"),
    midiDeviceDisplayModule: typeof import("./MIDIDeviceDisplay.js"),
    midiSelectorModule: typeof import("./MIDISelector.js"),
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js")
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
        uiModule.setupKeyListeners(appModule, fKeyMessageSpan, ctrlKeyMessageSpan);
    }
    // EVENTS //


    // RENDERING //
    document.body.innerHTML = "";
    const midiDeviceDisplay: IMIDIDeviceDisplay = midiDeviceDisplayModule.createMIDIDeviceDisplay(
        appModule,
        uiModule,
        midiDeviceDisplayModule,
        midiSelectorModule,
        svgModule,
        utilsModule
    )
    const volumeControlInput: HTMLInputElement = uiModule.setupVolumeControlInput(
        appModule,
    );
    const volumeInputText = uiModule.setupVolumeInputText(volumeControlInput);
    const stopButtonEl = document.createElement("button");
    
    const soundboardContainer = uiModule.setupSoundboardContainer(
        appModule,
        uiModule,
        buttonModule,
        storageModule,
        idbModule,
        volumeControlInput,
        volumeInputText,
        stopButtonEl,
    );
    
    const { 
        buttonControlContainer,
        trackTimeTextSpan,
        trackProgressBar
    } = uiModule.setupButtonControlContainer(
        appModule,
        uiModule,
        buttonModule, 
        idbModule, 
        storageModule, 
        soundboardContainer, 
        volumeControlInput,
        volumeInputText,
        stopButtonEl,
        fKeyMessageSpan,
        ctrlKeyMessageSpan,
    );
    // render into document body
    
    document.body.append(
        midiDeviceDisplay.container,
        midiDeviceDisplay.toggleMIDIEditModeButtonContainer,
        buttonControlContainer, 
        soundboardContainer
    );
    
    // RENDERING //

    // RAF
    function animate(_timestamp?: number) {
        uiModule.handleAnimate(
            appModule,
            uiModule,
            trackProgressBar,
            trackTimeTextSpan
        )
        window.requestAnimationFrame(animate);
    }
    window.requestAnimationFrame(animate);
    // RAF

}