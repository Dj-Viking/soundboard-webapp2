import { IButton } from "./Button.js";
import type { IMIDIDeviceDisplay } from "./MIDIDeviceDisplay.js";

export function setupDocumentHead(styles: typeof import("./Styles.js")): void {
    const title = document.createElement("title");
    title.textContent = "Soundboard App";
    document.head.innerHTML = "";
    document.head.innerHTML = `
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    `;
    document.head.append(title, styles.createStyles());
}

export function setupVolumeInputText(
    volumeControlInput: HTMLInputElement
): HTMLSpanElement {
    const span = document.createElement("span");

    span.textContent = `Volume: ${volumeControlInput.value}`;
    span.style.fontSize = "20px";
    span.style.color = "white";

    return span;
}

export function setupSoundboardContainer(
    appModule: typeof import("./App.js"),
    uiModule: typeof import("./UI.js"),
    buttonModule: typeof import("./Button.js"),
    storageModule: typeof import("./Storage.js"),
    idbModule: typeof import("./IDB.js"),
    volumeControlInput: HTMLInputElement,
    volumeInputText: HTMLSpanElement,
    stopButtonEl: HTMLButtonElement,
): HTMLDivElement {
    const soundboardContainer = document.createElement("div");
    soundboardContainer.classList.add("soundboard-container");

    // TODO: create button list from buttons inside
    // indexedDB and append to soundboardContainer
    storageModule.getStorageButtons().then((strgeBtns) => {
        const btns = strgeBtns.map((props) => buttonModule.createButton(props, idbModule));

        btns.forEach((btn) => {
            btn.el.addEventListener("click", (_e) => {
                buttonModule.boardButtonClickHandler(
                    appModule,
                    uiModule,
                    storageModule, 
                    idbModule, 
                    btn, 
                    soundboardContainer, 
                    volumeControlInput,
                    volumeInputText
                );
            });
            appModule.state.allButtons[btn.el.id] = btn;
            soundboardContainer.appendChild(btn.el);
        });

        stopButtonEl.onclick = () => {
            btns.forEach((b) => {
                b.audioEl.currentTime = 0;
                b.audioEl.pause();
                b.isPlaying = false;
                appModule.state.isPlaying = false;
                appModule.state.currentlyPlayingButton = null;
            });
        };
    });
    return soundboardContainer;
}

export function setupButtonControlContainer(
    appModule: typeof import("./App.js"),
    uiModule: typeof import("./UI.js"),
    buttonModule: typeof import("./Button.js"),
    idbModule: typeof import("./IDB.js"),
    storage: typeof import("./Storage.js"),
    soundboardContainer: HTMLDivElement,
    volumeControlInput: HTMLInputElement,
    volumeInputText: HTMLSpanElement,
    stopButtonEl: HTMLButtonElement,
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement,
): {
    buttonControlContainer: HTMLDivElement,
    trackProgressBar: HTMLProgressElement,
    trackTimeTextSpan: HTMLSpanElement,
} {
    const buttonControlContainer = document.createElement("div");
    buttonControlContainer.classList.add("btn-control-container");

    stopButtonEl.innerText = "Stop All Sound 🛑";

    const trackProgressBar = document.createElement("progress");
    trackProgressBar.classList.add("track-progress");
    
    const trackTimeTextSpan = document.createElement("span");
    trackTimeTextSpan.textContent = "00:00:00 -- 00:00:00";
    trackTimeTextSpan.style.color = "white";

    const addButtonEl = document.createElement("button");
    addButtonEl.classList.add("board-button");
    addButtonEl.innerText = "Add A New Button +";
    addButtonEl.onclick = (_event: MouseEvent) => {
        storage.getStorageButtons().then((storageButtons): void => {
            const btn = buttonModule.createButton(buttonModule.initialButton({}), idbModule);
            idbModule.idb_put(btn.props);
            storageButtons.push(btn.props);
            btn.el.onclick = () => {
                buttonModule.boardButtonClickHandler(
                    appModule,
                    uiModule,
                    storage, 
                    idbModule, 
                    btn, 
                    soundboardContainer, 
                    volumeControlInput,
                    volumeInputText
                );
            };
            appModule.state.allButtons[btn.el.id] = btn;
            stopButtonEl.onclick = () => {
                Object.values(appModule.state.allButtons).forEach((b) => {
                    b.audioEl.currentTime = 0;
                    b.audioEl.pause();
                    b.isPlaying = false;
                    appModule.state.isPlaying = false;
                    appModule.state.currentlyPlayingButton = null;
                });
            };
            soundboardContainer.appendChild(btn.el);
        });
    }

    buttonControlContainer.append(
        volumeControlInput,
        volumeInputText,
        addButtonEl,
        stopButtonEl,
        trackProgressBar,
        trackTimeTextSpan,
        fKeyMessageSpan,
        ctrlKeyMessageSpan
    );
    return { 
        buttonControlContainer,
        trackProgressBar,
        trackTimeTextSpan
    };
}


export function setupKeyListeners(
    appModule: typeof import("./App.js"),
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement,
) {
    
    document.onkeyup = () => {
        appModule.state.keyControl = {
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
        appModule.state.keyControl = {
            ...appModule.state.keyControl,
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

export function handleVolumeChange(
    e: MyEvent, 
    volumeInputText: HTMLSpanElement,
    audioEl: HTMLAudioElement
) {
    volumeInputText.textContent = `Volume: ${e.target.value}`;
    audioEl.volume = e.target.value;
}

export function setupVolumeControlInput(
    appModule: typeof import("./App.js"),
): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = ".5";
    input.step = ".001";
    input.value = ".5";
    input.onclick = () => {
        if (appModule.state.isMIDIEdit) {
            appModule.state.isListeningForMIDIMappingEdits = true;
            console.log("listening for edits on volume input");
            appModule.state.mappingEditOptions = {
                uiName: "volume_fader",
            };
        }
    }
    return input;
}

export function createCtrlKeyMessageSpan () {
    const span = document.createElement("span");
    span.innerText = "Control is pressed! - click a button to delete it";
    span.style.color = "red";
    span.style.visibility = "hidden";
    span.style.fontWeight = "bold";

    return span;
}
export function createFKeyMessageSpan () {
    const span = document.createElement("span");

    span.innerText = "F is Pressed! - click a button to upload an audio file onto it!";
    span.style.color = "blue";
    span.style.visibility = "hidden";
    span.style.fontWeight = "bold";

    return span;
}

export function handleMIDIEditModeButtonClick(
    appModule: typeof import("./App.js"),
    midiDeviceDisplayModule: typeof import("./MIDIDeviceDisplay.js"),
    midiDeviceDisplay: IMIDIDeviceDisplay
): void {
    appModule.state.isMIDIEdit = !appModule.state.isMIDIEdit;
    if (appModule.state.isMIDIEdit) {
        midiDeviceDisplayModule.showAssignmentSpans(midiDeviceDisplay);
        midiDeviceDisplay.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode ON";
        midiDeviceDisplay.toggleMIDIEditModeButton.style.backgroundColor = "green";
    } else {
        midiDeviceDisplayModule.hideAssignmentSpans(
            midiDeviceDisplay
        );
        midiDeviceDisplay.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode OFF";
        midiDeviceDisplay.toggleMIDIEditModeButton.style.backgroundColor = "grey";
    }
};

export function refreshTrackProgress(
    trackProgressBar: HTMLProgressElement, 
    audioEl: IButton["audioEl"],
    trackTimeTextSpan: HTMLSpanElement
): void {
    trackTimeTextSpan.textContent = `\
    ${convertTime(audioEl.currentTime)} \
    -- \
    ${convertTime(audioEl.duration)}`;

    trackProgressBar.max = audioEl.duration;
    trackProgressBar.value = audioEl.currentTime;
}

export function convertTime(secs: number = 0): string {
    const date = new Date(0);
    date.setSeconds(secs);
    const timeString = date.toISOString().substring(11, 19);
    return timeString;
}

export function handleAnimate(
    appModule: typeof import("./App.js"),
    uiModule: typeof import("./UI.js"),
    trackProgressBar: HTMLProgressElement,
    trackTimeTextSpan: HTMLSpanElement
) {
    if (appModule.state.isPlaying) {
        uiModule.refreshTrackProgress(
            trackProgressBar,
            appModule.state.currentlyPlayingButton!.audioEl,
            trackTimeTextSpan
        )
    }
}


