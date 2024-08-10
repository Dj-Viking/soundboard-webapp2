// TODO: move all things that deal with
// DOM into here
// and just call them within the entrypoint "render" function

// buttonControlContainer, soundboardContainer

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
        const btns = strgeBtns.map((props) => buttonModule.createButton(props));

        btns.forEach((btn) => {
            btn.el.addEventListener("click", (_e) => {
                buttonModule.boardButtonClickHandler(
                    state.keyControl, 
                    btn, 
                    storageModule, 
                    idbModule, 
                    soundboardContainer, 
                    state.isPlaying, 
                    state.allButtons, 
                    state.currentlyPlayingButton, 
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
                buttonModule.boardButtonClickHandler(state.keyControl, 
                    btn, 
                    storage, 
                    idbModule, 
                    soundboardContainer, 
                    state.isPlaying, 
                    state.allButtons, 
                    state.currentlyPlayingButton, 
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

    /**
     * TODO
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