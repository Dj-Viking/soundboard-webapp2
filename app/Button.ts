import { getRandomColor, getRandomId } from "../common.js";
import { idb_dbName, idb_version } from "./Constants.js";

export interface IButtonProps {
    id: string;
    color: string;
    file?: File | null;
}
export interface IButton {
    el: HTMLButtonElement,
    btnAssignmentSpan: HTMLSpanElement,
    audioEl: HTMLAudioElement,
    fileInputEl: HTMLInputElement,
    filenameSpan: HTMLSpanElement,
    color: string,
    hasAudioFile: boolean,
    isPlaying: boolean,
    file?: File | null,
    props: IButtonProps
}

export function initialButton(props: Partial<IButton["props"]>): IButton {
    const btn: IButton = {} as any;
    
    btn.el = document.createElement("button");
    btn.el.id = props.id ?? getRandomId();
    btn.el.classList.add("soundboard-button");
    
    btn.btnAssignmentSpan = document.createElement("span");
    
    btn.audioEl = document.createElement("audio");
    
    btn.fileInputEl = document.createElement("input");
    btn.fileInputEl.type = "file";
    btn.fileInputEl.style.display = "none";
    btn.fileInputEl.accept = ".mp3,wav";
    btn.fileInputEl.id = getRandomId();
    
    btn.filenameSpan = document.createElement("span");
    btn.filenameSpan.textContent = props.file ? props.file.name : "";

    btn.color = props.color ?? getRandomColor();
    
    btn.hasAudioFile = props.file ? true : false;
    
    btn.isPlaying = false;
    
    btn.file = props.file ?? null;
    
    setButtonProps(btn, {
        "color": btn.color,
        "id": btn.el.id,
        "file": btn.file
    })

    return btn;
}

export function createButton(props: Partial<IButtonProps>, idbModule: typeof import("./IDB.js")): IButton {
    const button: IButton = initialButton(props);
    
    button.btnAssignmentSpan.id = getRandomId();

    button.audioEl.id = getRandomId();
    button.audioEl.style.display = "none";
    button.el.appendChild(button.audioEl);

    button.filenameSpan.id = getRandomId();

    button.fileInputEl.type = "file";
    button.fileInputEl.style.display = "none";
    button.fileInputEl.accept = ".mp3,wav";
    button.fileInputEl.id = getRandomId();
    button.el.append(button.fileInputEl);

    button.fileInputEl.addEventListener("change", () => {
        if (button.fileInputEl.files?.length === 1) {
            const file = button.fileInputEl.files?.item(0)!;
            addAudioSrcToButton(button, file, idbModule);
        }
    });

    setButtonProps(button, {
        id: button.el.id,
        color: button.color,
        file: button.file
    });

    button.el.style.backgroundColor = button.color;

    return button;
}

export function setButtonProps(button: IButton, props: IButtonProps): void {
    if (props.file) {
        const file = props.file
        button.filenameSpan.textContent = file.name;

        // could be calling this function several times.
        // don't want to keep prepending children if we don't have to
        if (button.el.children.length === 0) {
            button.el.prepend(button.filenameSpan);
            button.el.style.width = "auto";
        }
        
        button.hasAudioFile = true;
        button.audioEl.src = URL.createObjectURL(file);
    }
    button.props = {
        ...button.props,
        id: props.id,
        color: props.color,
        file: props.file || null
    };
}

export function addAudioSrcToButton(button: IButton, file: File, idbModule: typeof import("./IDB.js")): void {
    const src = window.URL.createObjectURL(file); // temporary base 64 string
    
    button.filenameSpan.textContent = file.name;
    button.el.style.width = "auto";
    button.el.prepend(button.filenameSpan);

    button.file = file;

    button.audioEl.src = src;
    button.hasAudioFile = true;

    setButtonProps(button, {
        ...button.props,
        file
    });

    idbModule.idb_update(button.props, idbModule);
}

export function clickInput (_this: IButton, keyCtrl: KeyControlMap): void {
    _this.fileInputEl.click();
    keyCtrl.f = false;
};

export function boardButtonClickHandler(
    keyControl: KeyControlMap, 
    btn: IButton, 
    storageModule: typeof import("./Storage.js"), 
    idbModule: typeof import("./IDB.js"),
    soundboardContainer: HTMLDivElement,
    isPlaying: boolean,
    allButtons: Record<IButton["el"]["id"], IButton>,
    currentlyPlayingButton: IButton | null,
    volumeControlInput: HTMLInputElement
): void {
    switch (true) {
        case keyControl.f:
            {
                (async () => {
                    if (!btn.hasAudioFile) {
                        clickInput(btn, keyControl);
                    } else {
                        await btn.audioEl.play();
                    }
                })();
            }
            break;
        case keyControl.Control:
            {
                storageModule.getStorageButtons().then((btns) => {
                    const toDelete = btns.find((sb) => sb.id === btn.el.id);
                    idbModule.idb_delete(toDelete, idb_dbName, idb_version);
                    soundboardContainer.removeChild(document.getElementById(btn.el.id)!);
                });
            }
            break;
        case Object.values(keyControl).every((pressedKey) => pressedKey === false):
            {
                if (btn.hasAudioFile) {
                    (async () => {
                        if (isPlaying) {
                            Object.values(allButtons).forEach((_btn) => {
                                if (_btn.audioEl.id !== btn.audioEl.id) {
                                    _btn.audioEl.pause();
                                    _btn.isPlaying = false;
                                    _btn.audioEl.currentTime = 0;
                                }
                            });
                        }
                        if (!btn.isPlaying) {
                            btn.isPlaying = true;
                            isPlaying = true;
                            currentlyPlayingButton = btn;
                            btn.audioEl.volume = Number(volumeControlInput.value);
                            setTimeout(async () => {
                                volumeControlInput.oninput = (e) => {
                                    // TODO: 
                                    // this.handleVolumeChange(e, btn.audioEl);
                                };
                            }, 1);
                            await btn.audioEl.play();
                        } else {
                            btn.audioEl.pause();
                            // restart the track to the beginning
                            btn.audioEl.currentTime = 0;
                            setTimeout(async () => {
                                await btn.audioEl.play();
                            }, 1);
                        }
                    })();
                }
            }
            break;
        default:
            {
            }
            break;
    }
};