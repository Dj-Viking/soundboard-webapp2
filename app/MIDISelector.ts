import { getRandomId } from "../common.js";
import { MIDIController, MIDIInputName } from "./MIDIController.js";
export interface IMIDISelector {
    selectEl: HTMLSelectElement
}

export function createMIDISelector(): IMIDISelector {
    const ret: IMIDISelector = {} as any;

    ret.selectEl = document.createElement("select");

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a MIDI Device";
    defaultOption.selected = true;
    defaultOption.disabled = true;
    defaultOption.style.margin = "0 auto";
    ret.selectEl.append(defaultOption);

    return ret;
}

export function appendMIDIDeviceNames(midiSelector: IMIDISelector, inputs: MIDIController["inputs"]): void {
    for (const input of inputs) {
        const option = document.createElement("option");
        option.textContent = MIDIController.stripNativeLabelFromMIDIInputName(input.name);
        option.value = input.name;
        option.id = getRandomId();
        midiSelector.selectEl.appendChild(option);
    }
}

export function selectDevice(midiSelector: IMIDISelector, inputName: MIDIInputName): void {
    midiSelector.selectEl.value = inputName;
}