import { ADD_BUTTON_DIM, BUTTON_DIM, SOUNDBOARD_DIM } from "../common.js";
export function createStyles(): HTMLStyleElement {
    const style = document.createElement("style");
    style.innerHTML = `
        html {
            background-color: grey;
        }

        .control-device-display-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: auto;
            width: auto;
            border-radius: 10px;
            margin-bottom: 10px;
            border: solid green 3px;
        }
    
        .control-svg-container {
            height: auto;
            width: auto;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
        }

        .soundboard-container {
            display: flex;
            flex-wrap: wrap;
            margin: 0 auto;
            height: ${SOUNDBOARD_DIM}px;
            width: ${SOUNDBOARD_DIM}px;
            background-color: white;
            border-radius: 10px;
        }

        .volume-container {
            display: flex;
            margin: 0 auto;
            height: auto;
            width: auto;
            flex-direction: column;
            align-items: center;
            margin-bottom: 10px;
        }

        .header {
            color: blue;
            text-align: center;
        }

        .track-progress {
            width: 70%;
        }

        .midi-selector-container {
            width: 70%;
            margin: 0 auto;
        }

        .midi-selector {
            width: 100%;
        }

        .btn-control-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .board-button {
            color: white;
            height: ${ADD_BUTTON_DIM}px;
            width: auto;
            background-color: blue;
            margin-bottom: 20px;
            border-radius: 10px;
        }

        .soundboard-button {
            height: ${BUTTON_DIM}px;
            width: ${BUTTON_DIM}px;
        }
    `;
    return style;
}