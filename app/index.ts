console.log("hello world");
import { WS_PORT } from "../common.js";

(async () => {

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)
    let buttonModule = await import("./Button.js");
    let styleModule = await import("./Styles.js");

    ws.addEventListener("message", async (event) => {
        if (event.data.includes("hot")) {
            const timestamp = (Date.now()).toString();
            // switch()
            buttonModule = await import("./Button.js" + "?date=" + timestamp);
            styleModule = await import ("./Styles.js" + "?date=" + timestamp);
            renderApp(buttonModule, styleModule);
        }
    });
    
    renderApp(buttonModule, styleModule);

})();


function renderApp(
    button: typeof import("./Button.js"),
    styles: typeof import("./Styles.js")
) {
    
    setupDocumentHead(styles);
    document.body.innerHTML = "";
    const container = setupSoundboardContainer(button);
    
    document.body.append(container);
}

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


function setupSoundboardContainer(button: typeof import("./Button.js")): HTMLDivElement {
    const soundboardContainer = document.createElement("div");
    soundboardContainer.classList.add("soundboard-container");

    // TODO: create button list from buttons inside
    // indexedDB and append to soundboardContainer
    soundboardContainer.append(button.createButton({}).el)
    return soundboardContainer;
}