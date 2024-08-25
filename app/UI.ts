import { state } from "./App.js";
import { IButton } from "./Button.js";

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

export function setupSoundboardContainer(
    buttonModule: typeof import("./Button.js"),
    storageModule: typeof import("./Storage.js"),
    idbModule: typeof import("./IDB.js"),
    volumeControlInput: HTMLInputElement,
    stopButtonEl: HTMLButtonElement,
    state: State
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
                    state, 
                    btn, 
                    storageModule, 
                    idbModule, 
                    soundboardContainer, 
                    volumeControlInput
                );
            });
            state.allButtons[btn.el.id] = btn;
            soundboardContainer.appendChild(btn.el);
        });

        stopButtonEl.onclick = () => {
            btns.forEach((b) => {
                b.audioEl.currentTime = 0;
                b.audioEl.pause();
                b.isPlaying = false;
                state.isPlaying = false;
                state.currentlyPlayingButton = null;
            });
        };
    });
    return soundboardContainer;
}

export function setupButtonControlContainer(
    buttonModule: typeof import("./Button.js"),
    idbModule: typeof import("./IDB.js"),
    storage: typeof import("./Storage.js"),
    soundboardContainer: HTMLDivElement,
    volumeControlInput: HTMLInputElement, 
    stopButtonEl: HTMLButtonElement,
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement,
    state: State
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
                    state, 
                    btn, 
                    storage, 
                    idbModule, 
                    soundboardContainer, 
                    volumeControlInput
                );
            };
            state.allButtons[btn.el.id] = btn;
            stopButtonEl.onclick = () => {
                Object.values(state.allButtons).forEach((b) => {
                    b.audioEl.currentTime = 0;
                    b.audioEl.pause();
                    b.isPlaying = false;
                    state.isPlaying = false;
                    state.currentlyPlayingButton = null;
                });
            };
            soundboardContainer.appendChild(btn.el);
        });
    }

    buttonControlContainer.append(
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
    fKeyMessageSpan: HTMLSpanElement,
    ctrlKeyMessageSpan: HTMLSpanElement,
    state: State
) {
    
    document.onkeyup = () => {
        state.keyControl = {
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
        state.keyControl = {
            ...state.keyControl,
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

export function setupVolumeControlInput(
    state: State
): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = ".5";
    input.step = ".001";
    input.value = ".5";
    input.onclick = () => {
        if (state.isMIDIEdit) {
            state.isListeningForMIDIMappingEdits = true;
            console.log("listening for edits on volume input");
            state.mappingEditOptions = {
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
    trackProgressBar: HTMLProgressElement,
    state: State,
    trackTimeTextSpan: HTMLSpanElement
) {
    if (state.isPlaying) {
        refreshTrackProgress(
            trackProgressBar, state.currentlyPlayingButton!.audioEl, trackTimeTextSpan
        )
    }
}


