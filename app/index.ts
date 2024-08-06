console.log("hello world");
import { WS_PORT } from "../common.js";
import type { IButton } from "./Button.js";
import type { MIDIController } from "./MIDIController.js";
import type { UIInterfaceDeviceName, MIDIInputName } from "./MIDIController.js";
import { createMIDIMappingPreference, type IMIDIMappingPreference } from "./MIDIMapping.js";

// application state for now
let keyControl: KeyControlMap = {
    m: false,
    M: false,
    Alt: false,
    f: false,
    Control: false,
    Shift: false,
};
let isPlaying: boolean = false;
let currentlyPlayingButton: IButton | null = null;
let allButtons: Record<IButton["el"]["id"], IButton> = {};
let midiController: MIDIController = {} as any;
let isListeningForMIDIMappingEdits: boolean = false;
let mappingEditOptions = {
    uiName: "" as any as UIInterfaceDeviceName,
};
let usingFader: boolean = false;
let usingKnob: boolean = false;
let isMIDIEdit: boolean = false;
let MidiMappingPreference: IMIDIMappingPreference<MIDIInputName> = createMIDIMappingPreference("Not Found");

(async () => {

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)
    let buttonModule = await import("./Button.js");
    let styleModule = await import("./Styles.js");
    let idbModule = await import("./IDB.js");
    let storageModule = await import("./Storage.js");
    
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
            renderApp(buttonModule, styleModule, idbModule, storageModule);
        }
    });
    
    renderApp(buttonModule, styleModule, idbModule, storageModule);

})();


function renderApp(
    buttonModule: typeof import("./Button.js"),
    stylesModule: typeof import("./Styles.js"),
    idbModule: typeof import("./IDB.js"),
    storageModule: typeof import("./Storage.js")
) {
    
    setupDocumentHead(stylesModule);
    const ctrlKeyMessageSpan = document.createElement("span");
    ctrlKeyMessageSpan.innerText = "Control is pressed! - click a button to delete it";
    ctrlKeyMessageSpan.style.color = "red";
    ctrlKeyMessageSpan.style.visibility = "hidden";
    ctrlKeyMessageSpan.style.fontWeight = "bold";

    const fKeyMessageSpan = document.createElement("span");
    fKeyMessageSpan.innerText = "F is Pressed! - click a button to upload an audio file onto it!";
    fKeyMessageSpan.style.color = "blue";
    fKeyMessageSpan.style.visibility = "hidden";
    fKeyMessageSpan.style.fontWeight = "bold";
    setupKeyListeners(fKeyMessageSpan, ctrlKeyMessageSpan);
    document.body.innerHTML = "";
    const volumeControlInput: HTMLInputElement = setupVolumeControlInput();
    const stopButtonEl = document.createElement("button");

    const soundboardContainer = setupSoundboardContainer(buttonModule, storageModule, idbModule, volumeControlInput, stopButtonEl);

    const buttonControlContainer = setupButtonControlContainer(
        buttonModule, 
        idbModule, 
        storageModule, 
        soundboardContainer, 
        volumeControlInput, 
        stopButtonEl,
        fKeyMessageSpan,
        ctrlKeyMessageSpan
    );
    
    // render into document body
    document.body.append(buttonControlContainer, soundboardContainer);
}

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

function setupKeyListeners(
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement
) {
    
    document.onkeyup = () => {
        keyControl = {
            m: false,
            M: false,
            Alt: false,
            f: false,
            Control: false,
            Shift: false,
        };
        ctrlKeyMessageSpan.style.visibility = "hidden";
        fKeyMessageSpan.style.visibility = "hidden";
    }

    document.onkeydown = (event) => {
        keyControl = {
            ...keyControl,
            [event.key]: true,
        };
        switch (true) {
            case event.key === "m" || event.key === "M":
                {
                    // this.handleMIDIEditModeButtonClick();
                }
                break;
            case event.key === "f":
                {
                    fKeyMessageSpan.style.visibility = "visible";
                }
                break;
            case event.key === "Control":
                {
                    ctrlKeyMessageSpan.style.visibility = "visible";
                }
                break;
            default:
                {
                    console.log("unhandled key", event.key);
                }
                break;
        }
    }
}

function setupVolumeControlInput(): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = ".5";
    input.step = ".001";
    input.value = ".5";
    input.onclick = () => {
        if (isMIDIEdit) {
            isListeningForMIDIMappingEdits = true;
            console.log("listening for edits on volume input");
            mappingEditOptions = {
                uiName: "volume_fader",
            };
        }
    }
    return input;
}

function setupButtonControlContainer(
    buttonModule: typeof import("./Button.js"),
    idbModule: typeof import("./IDB.js"),
    storage: typeof import("./Storage.js"),
    soundboardContainer: HTMLDivElement,
    volumeControlInput: HTMLInputElement, 
    stopButtonEl: HTMLButtonElement,
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement
) {
    const buttonControlContainer = document.createElement("div");
    buttonControlContainer.classList.add("btn-control-container");

    stopButtonEl.innerText = "Stop All Sound 🛑";

    const trackProgressBar = document.createElement("progress");
    trackProgressBar.classList.add("track-progress");
    trackProgressBar.textContent = "00:00:00 -- 00:00:00";
    trackProgressBar.style.color = "white";


    const addButtonEl = document.createElement("button");
    addButtonEl.classList.add("board-button");
    addButtonEl.innerText = "Add A New Button +";
    addButtonEl.onclick = (_event: MouseEvent) => {
        storage.getStorageButtons().then((storageButtons): void => {
            const btn = buttonModule.createButton({});
            idbModule.idb_put(btn.props);
            storageButtons.push(btn.props);
            btn.el.onclick = () => {
                buttonModule.boardButtonClickHandler(keyControl, btn, storage, idbModule, soundboardContainer, isPlaying, allButtons, currentlyPlayingButton, volumeControlInput);
            };
            allButtons[btn.el.id] = btn;
            stopButtonEl.onclick = () => {
                Object.values(allButtons).forEach((b) => {
                    b.audioEl.currentTime = 0;
                    b.audioEl.pause();
                    b.isPlaying = false;
                    isPlaying = false;
                    currentlyPlayingButton = null;
                });
            };
            soundboardContainer.appendChild(btn.el);
        });
    }

    /**
     * 
        this.btnControlContainer.append(
            this.addButtonEl,
            this.stopButtonEl,
            this.trackProgressBar,
            this.trackTimeTextSpan,
            this.ctrlKeyMessageSpan,
            this.fKeyMessageSpan
        );
     */
    buttonControlContainer.append(
        addButtonEl,
        stopButtonEl,
        trackProgressBar,
        fKeyMessageSpan,
        ctrlKeyMessageSpan
    );
    return buttonControlContainer;
}

// TODO: 
// function refreshTrackProgress(audioEl: Button["audioEl"]): void {
//     this.trackTimeTextSpan.textContent = `${this.convertTime(audioEl.currentTime)} -- ${this.convertTime(
//         audioEl.duration
//     )}`;

//     this.trackProgressBar.max = audioEl.duration;
//     this.trackProgressBar.value = audioEl.currentTime;
// }

function setupDocumentHead(styles: typeof import("./Styles.js")): void {
    const title = document.createElement("title");
    title.textContent = "Soundboard App";
    document.head.innerHTML = "";
    document.head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    `;
    document.head.append(title, styles.createStyles());
}


function setupSoundboardContainer(
    buttonModule: typeof import("./Button.js"),
    storageModule: typeof import("./Storage.js"),
    idbModule: typeof import("./IDB.js"),
    volumeControlInput: HTMLInputElement,
    stopButtonEl: HTMLButtonElement
): HTMLDivElement {
    const soundboardContainer = document.createElement("div");
    soundboardContainer.classList.add("soundboard-container");

    // TODO: create button list from buttons inside
    // indexedDB and append to soundboardContainer
    storageModule.getStorageButtons().then((strgeBtns) => {
        const btns = strgeBtns.map((props) => buttonModule.createButton(props));

        btns.forEach((btn) => {
            btn.el.addEventListener("click", (_e) => {
                buttonModule.boardButtonClickHandler(keyControl, btn, storageModule, idbModule, soundboardContainer, isPlaying, allButtons, currentlyPlayingButton, volumeControlInput);
            });
            allButtons[btn.el.id] = btn;
            soundboardContainer.appendChild(btn.el);
        });

        stopButtonEl.onclick = () => {
            btns.forEach((b) => {
                b.audioEl.currentTime = 0;
                b.audioEl.pause();
                b.isPlaying = false;
                isPlaying = false;
                currentlyPlayingButton = null;
            });
        };
    });
    return soundboardContainer;
}