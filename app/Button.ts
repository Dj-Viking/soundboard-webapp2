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

export function createButton(props: Partial<IButtonProps>): IButton {
    const button: IButton = {} as any;
    
    const id = props.id || getRandomId();
    const color = props.color || getRandomColor();
    let file = props.file || null;

    const el = document.createElement("button");
    el.id = id!;
    el.classList.add("soundboard-button");

    const btnAssignmentSpan = document.createElement("button");
    btnAssignmentSpan.id = getRandomId();

    const audioEl = document.createElement("audio");
    audioEl.id = getRandomId();

    const filenameSpan =  document.createElement("span");
    filenameSpan.id = getRandomId();

    const fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.style.display = "none";
    fileInputEl.accept = ".mp3,wav";
    fileInputEl.id = getRandomId();

    fileInputEl.addEventListener("change", () => {
        if (fileInputEl.files?.length === 1) {
            const file = fileInputEl.files?.item(0)!;
            addFileToButton(button, file)
        }
    });

    setButtonProps(button, {
        id,
        color,
        file
    });
    button.el = el;
    button.btnAssignmentSpan = btnAssignmentSpan;
    button.audioEl = audioEl;
    button.fileInputEl = fileInputEl;
    button.filenameSpan = filenameSpan;
    button.color = color;
    button.el.style.backgroundColor = color;
    button.hasAudioFile = false;

    return button;
}

export function setButtonProps(button: IButton, props: IButtonProps): void {
    if (props.file) {
        const file = props.file
        button.filenameSpan.textContent = file.name;
        button.el.prepend(button.filenameSpan);
        button.el.style.width = "auto";
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

export function addFileToButton(button: IButton, file: File): void {
    const src = URL.createObjectURL(file);
    button.file = file;
    button.hasAudioFile = true;
    button.audioEl.src = src;

    button.filenameSpan.textContent = file.name;
    button.el.style.width = "auto";
    button.el.prepend(button.filenameSpan);
    button.props = {
        ...button.props,
        file,
    }

    /**
     * update idb button collection
     * with the new button props as a new item in the collection
     */
    
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