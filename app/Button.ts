import { getRandomColor, getRandomId } from "../common.js";

export type ButtonProps = {
    id: string;
    color: string;
    file?: File | null;
}
export interface Button {
    el: HTMLButtonElement,
    btnAssignmentSpan: HTMLSpanElement,
    audioEl: HTMLAudioElement,
    fileInputEl: HTMLInputElement,
    filenameSpan: HTMLSpanElement,
    color: string,
    hasAudioFile: boolean,
    isPlaying: boolean,
    file?: File | null,
    props: {
        id: string,
        color: string,
        file?: File | null,
    }
}

export function createButton(props: Partial<ButtonProps>): Button {
    const button: Button = {} as any;
    
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
    button.hasAudioFile = false;

    return button;
}

export function setButtonProps(button: Button, props: ButtonProps): void {
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

export function addFileToButton(button: Button, file: File): void {
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