import { 
    ControllerControlNamesLookup,
    getControllerTableFromName, 
    MIDIController, 
    SUPPORTED_CONTROLLERS, 
    XONEK2_MIDI_CHANNEL_TABLE, 
    type MIDIInputName, 
    type MIDIMessageEvent, 
    type UIInterfaceDeviceName
} from "./MIDIController.js";
import { IMIDIDeviceDisplay } from "./MIDIDeviceDisplay.js";
import { CallbackMapping, createMIDIMappingPreference, IMIDIMappingPreference } from "./MIDIMapping.js";

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

export function handleSvgMovement(
    appModule: typeof import("./App.js"),
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js"),
    midiSelectorModule: typeof import("./MIDISelector.js"),
    midiDeviceDisplayModule: typeof import("./MIDIDeviceDisplay.js"),
    midiDeviceDisplay: IMIDIDeviceDisplay,
    name: MIDIInputName,
    intensity: number,
    controlName: ControllerControlNamesLookup<typeof name>
): void {
    appModule.state.usingFader = /fader/g.test(controlName);
    appModule.state.usingKnob = /knob/g.test(controlName);

    svgModule.handleShow(midiDeviceDisplay.fader, appModule.state.usingFader);
    if (appModule.state.usingFader) {
        svgModule.moveFaderSvgFromMessage(midiDeviceDisplay.fader, intensity, utilsModule);
    }
    svgModule.handleShow(midiDeviceDisplay.knob, appModule.state.usingKnob);
    if (appModule.state.usingKnob) {
        svgModule.moveKnobSvgFromMessage(
            svgModule, utilsModule, intensity, midiDeviceDisplay.knob
        );
    }
    appModule.state.midiController.recentlyUsed = name;
    midiSelectorModule.selectDevice(midiDeviceDisplay.midiSelector, name);
    midiDeviceDisplayModule.updateInput(midiDeviceDisplay, name);
}

export function setupMIDIMessageCallback(
    appModule: typeof import("./App.js"),
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js"),
    midiSelectorModule: typeof import("./MIDISelector.js"),
    midiDeviceDisplayModule: typeof import("./MIDIDeviceDisplay.js"),
    storageModule: typeof import("./Storage.js"),
    midiDeviceDisplay: IMIDIDeviceDisplay
): void {
    const midicb = (e: MIDIMessageEvent) => {
        const channel = e.data[1];
        const intensity = e.data[2];
        const name = e.currentTarget.name;
        const strippedName = MIDIController.stripNativeLabelFromMIDIInputName(e.currentTarget.name);

        const controlName: ControllerControlNamesLookup<typeof strippedName> =
            SUPPORTED_CONTROLLERS[strippedName][channel];

        // move displayed svg rects
        appModule.handleSvgMovement(
            appModule,
            svgModule,
            utilsModule,
            midiSelectorModule,
            midiDeviceDisplayModule,
            midiDeviceDisplay,
            name, intensity, controlName
        );
        midiDeviceDisplay.channelSpan.textContent = "Channel: " + channel.toString();
        midiDeviceDisplay.controlNameSpan.textContent = controlName;
        midiDeviceDisplay.intensitySpan.textContent = "Intensity: " + intensity.toString();

        if (storageModule.getMIDIMappingFromStorage(strippedName)) {
            if (appModule.state.MidiMappingPreference.name === "Not Found") {
                // currently using not found in app state
                // set up local state for using the one we are currently sending messages for
                const ret = storageModule.getMIDIMappingFromStorage(strippedName)!;
                // @ts-ignore local storage is getting all really fucking FUCKED UP THE ENTIRE STRUCTURE IS PLACED INTO .id AND .mapping1!!! FUCK1!
                appModule.state.MidiMappingPreference = ret.id;
                // AND HAVE TO MAKE THE CALLBACK MAPPING HERE!!!!!!!!!!!! WHAT THE FUCK!!!!!!
                // WHY IS INTERACTING WITH LOCAL STORAGE SO FUCKED UP!~!!!!!
                appModule.state.MidiMappingPreference.callbackMap = ret.callbackMap;
            }
        } else if (!storageModule.getMIDIMappingFromStorage(strippedName)) {
            // isnt in storage yet so set it up in local before setting it up in storage while listening
            appModule.state.MidiMappingPreference = createMIDIMappingPreference<typeof strippedName>(strippedName);
        }

        if (appModule.state.isListeningForMIDIMappingEdits) {
            appModule.state.isListeningForMIDIMappingEdits = false;
            // TODO: don't use the fucking IDB for storing the midi mappings. just use local storage for fuck's sake
            // IDB is so goddamn slow to create a new store after an upgrade is needed on the idb itself
            appModule.state.MidiMappingPreference.mapping[controlName] = {
                channel,
                uiName: appModule.state.mappingEditOptions.uiName as UIInterfaceDeviceName,
            };

            appModule.state.midiController.allMIDIMappingPreferences[strippedName] = appModule.state.MidiMappingPreference;

            // add to local storage here if it doesn't exist yet
            if (!localStorage.getItem(strippedName)) {
                localStorage.setItem(strippedName, JSON.stringify(appModule.state.MidiMappingPreference));
            } else {
                // otherwise update it
                const ret = storageModule.updateMIDIMappingInStorage(
                    appModule.state.MidiMappingPreference,
                    controlName,
                    channel,
                    appModule.state.mappingEditOptions.uiName as UIInterfaceDeviceName
                );
                appModule.state.MidiMappingPreference = ret;
            }

            console.log("midi mapping preference currently", appModule.state.MidiMappingPreference, "\n", appModule.state.midiController);
        }

        appModule.handleMIDIMessage(appModule, strippedName, e);
    };

    appModule.state.midiController.setInputCbs(midicb, () => {});
};

// TODO: this works - just need to store the mapping in storage somewhere
export function handleMIDIMessage(
    appModule: typeof import("./App.js"), 
    name: MIDIInputName, 
    midiMessageEvent: MIDIMessageEvent
) {
    appModule.invokeCallbackOrWarn(appModule, name, midiMessageEvent);
}

export function invokeCallbackOrWarn (
    appModule: typeof import("./App.js"),
    name: MIDIInputName, 
    midiMessageEvent: MIDIMessageEvent
): void {
    const channel = midiMessageEvent.data[1];
    const intensity = midiMessageEvent.data[2];

    switch (name) {
        case "XONE:K2 MIDI":
            {
                const callbackMap = appModule.state.MidiMappingPreference.callbackMap;
                const mapping = appModule.state.MidiMappingPreference.mapping;
                // optional chain here to just let it warn that we haven't set up any mappings yet
                const callback = callbackMap[mapping[XONEK2_MIDI_CHANNEL_TABLE[channel]]?.uiName];

                if (appModule.warnCallbackIfError(callback, mapping, channel, name)) {
                    callback(intensity);
                }
            }
            break;
        default: {
            console.warn("unhandled midi controller mapping", name);
        }
    }
};

export function warnCallbackIfError<P extends keyof CallbackMapping>(
    callback: CallbackMapping[P],
    mapping: IMIDIMappingPreference<typeof name>["mapping"],
    channel: number,
    name: MIDIInputName
): boolean {
    if (typeof callback !== "function") {
        console.warn(
            "callback was not a function, cannot proceed to call the callback",
            "\ncallback was => ",
            callback,
            "\n mapping was => ",
            mapping,
            "\n control name was => ",
            getControllerTableFromName(name)[channel],
            "\n input name was => ",
            name
        );
        console.warn("did you assign a ui control to that midi control?");
        return false;
    }
    return true;
}


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

    // MIDI //
    (async function () {
        return new Promise<MIDIController>(async (res, rej) => {
            try {
                const midiAccess = await MIDIController.requestMIDIAccess();
                if (midiAccess) {
                    appModule.state.midiController = new MIDIController(midiAccess);
                    console.log("got midi stuff", appModule.state.midiController);
                    res(appModule.state.midiController);
                }
            } catch (error) {
                rej(error);
            }
        });
    // MIDI //
    })().then((midiController: MIDIController) => {

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
        );

        if (midiController.inputs.length > 0) {
            midiSelectorModule.appendMIDIDeviceNames(midiDeviceDisplay.midiSelector, midiController.inputs);
            appModule.setupMIDIMessageCallback(
                appModule,
                svgModule,
                utilsModule,
                midiSelectorModule,
                midiDeviceDisplayModule,
                storageModule,
                midiDeviceDisplay
            )
        }

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

        midiDeviceDisplay.midiSelectorContainer.append(midiDeviceDisplay.midiSelector.selectEl);
        
        document.body.append(
            midiDeviceDisplay.container,
            midiDeviceDisplay.midiSelectorContainer,
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
    });



}