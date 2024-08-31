import { MIDIController, type MIDIInputName } from "./MIDIController.js";
import { type IMIDISelector } from "./MIDISelector.js";
import type { IFader, IKnob } from "./SVG.js";

export interface IMIDIDeviceDisplay {
    deviceNameSpan: HTMLSpanElement,
    channelSpan: HTMLSpanElement,
    controlNameSpan: HTMLSpanElement,
    faderUiControlAssignmentSpan: HTMLSpanElement,
    intensitySpan: HTMLSpanElement,
    intensityDiv: HTMLDivElement,
    container: HTMLDivElement,
    controlDisplayContainer: HTMLDivElement,
    toggleMIDIEditModeButton: HTMLButtonElement,
    toggleMIDIEditModeButtonContainer: HTMLDivElement,
    midiSelectorContainer: HTMLDivElement,
    midiSelector: IMIDISelector,
    fader: IFader,
    knob: IKnob
}

export function createMIDIDeviceDisplay(
    appModule: typeof import("./App.js"),
    uiModule: typeof import("./UI.js"),
    midiDeviceDisplayModule: typeof import("./MIDIDeviceDisplay.js"),
    midiSelectorModule: typeof import("./MIDISelector.js"),
    svgModule: typeof import("./SVG.js"),
    utilsModule: typeof import("./Utils.js"),
    inputName?: MIDIInputName,
): IMIDIDeviceDisplay {
    const ret: IMIDIDeviceDisplay = {} as any;

    ret.fader = svgModule.createFader();
    ret.knob = svgModule.createKnob(
        svgModule,
        utilsModule
    );

    ret.midiSelectorContainer = document.createElement("div");
    ret.midiSelector = midiSelectorModule.createMIDISelector();

    ret.toggleMIDIEditModeButton = document.createElement("button");
    ret.toggleMIDIEditModeButtonContainer = document.createElement("div");

    ret.toggleMIDIEditModeButtonContainer.style.display = "flex";
    ret.toggleMIDIEditModeButtonContainer.style.justifyContent = "center";
    ret.toggleMIDIEditModeButtonContainer.style.alignItems = "center";
    ret.toggleMIDIEditModeButtonContainer.style.marginBottom = "10px";
    ret.toggleMIDIEditModeButton.style.backgroundColor = "grey";
    ret.toggleMIDIEditModeButton.style.color = "white";
    ret.toggleMIDIEditModeButton.style.borderRadius = "5px";
    ret.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode ON"
    ret.toggleMIDIEditModeButton.onclick = 
        () => uiModule.handleMIDIEditModeButtonClick(
            appModule,
            midiDeviceDisplayModule,
            ret
        );
    ret.toggleMIDIEditModeButtonContainer.append(ret.toggleMIDIEditModeButton);

    ret.deviceNameSpan = document.createElement("span");
    ret.deviceNameSpan.style.margin = "0 auto";
    ret.deviceNameSpan.style.color = "white";
    ret.deviceNameSpan.textContent =
        MIDIController.stripNativeLabelFromMIDIInputName(
            inputName as MIDIInputName) || null;
    
    ret.channelSpan = document.createElement("span");
    ret.channelSpan.style.color = "white";
    ret.channelSpan.style.margin = "0 auto";
    ret.channelSpan.textContent = "";
    
    // appended into svg container
    ret.controlNameSpan = document.createElement("span");
    ret.controlNameSpan.style.color = "white";
    ret.controlNameSpan.textContent = "";
    
    // uinames to be appended to their respective ui
    // elements
    ret.faderUiControlAssignmentSpan = document.createElement("span");
    ret.faderUiControlAssignmentSpan.textContent = "()";
    ret.faderUiControlAssignmentSpan.style.visibility = "hidden";
    ret.faderUiControlAssignmentSpan.style.color = "white";
    
    ret.intensityDiv = document.createElement("div");
    ret.intensitySpan = document.createElement("span");
    // appended to svg container
    ret.intensitySpan.style.color = "white";
    ret.intensitySpan.textContent = "";
    ret.intensityDiv.style.display = "flex";
    ret.intensityDiv.style.justifyContent = "center";
    ret.intensityDiv.appendChild(ret.intensitySpan);
    
    ret.container = document.createElement("div");
    ret.container.classList.add("control-device-display-container");

    ret.controlDisplayContainer = document.createElement("div");
    ret.controlDisplayContainer.style.display = "block";

    const controlSVGContainer = document.createElement("div");
    controlSVGContainer.classList.add("control-svg-container");

    controlSVGContainer.append(ret.fader.el, ret.knob.el, ret.controlNameSpan);

    ret.controlDisplayContainer.append(controlSVGContainer, ret.intensityDiv);

    ret.container.append(
        ret.toggleMIDIEditModeButtonContainer,
        ret.deviceNameSpan,
        ret.channelSpan,
        ret.controlDisplayContainer
    );


    return ret;
}

export function showAssignmentSpans(midiDevDisplay: IMIDIDeviceDisplay): void {
    midiDevDisplay.faderUiControlAssignmentSpan.style.visibility = "visible";
}

export function hideAssignmentSpans(midiDevDisplay: IMIDIDeviceDisplay): void {
    midiDevDisplay.faderUiControlAssignmentSpan.style.visibility = "hidden";
}

export function updateInput(midiDevDisplay: IMIDIDeviceDisplay, inputName: MIDIInputName) {
    midiDevDisplay.deviceNameSpan.textContent = MIDIController.stripNativeLabelFromMIDIInputName(inputName);
}