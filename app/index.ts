import { WS_PORT } from "../common.js";

console.log("hello world");


//main
(async () => {

    const ws = new WebSocket(`ws://localhost:${WS_PORT}`)
    
    let buttonModule = await import("./Button.js");
    let styleModule = await import("./Styles.js");
    let idbModule = await import("./IDB.js");
    let storageModule = await import("./Storage.js");
    let uiModule = await import("./UI.js");
    let appModule = await import("./App.js");
    
    // initialize indexed DB when the app starts
    idbModule.initButtonsIdb()
    
    ws.addEventListener("message", async (event) => {
        if (event.data.includes("hot")) {
            const timestamp = (Date.now()).toString();
            const browserCacheBust = "?date=" + timestamp;
            buttonModule = await import("./Button.js" + browserCacheBust);
            styleModule = await import ("./Styles.js" + browserCacheBust);
            idbModule = await import("./IDB.js" + browserCacheBust);
            storageModule = await import("./Storage.js" + browserCacheBust);
            uiModule = await import("./UI.js" + browserCacheBust);
            appModule = await import("./App.js" + browserCacheBust);
            // could just export all the functions used
            // in rendering the app so that everything happening there is dynamically
            // loaded
            appModule.renderApp(
                appModule,
                buttonModule,
                styleModule,
                idbModule,
                storageModule,
                uiModule
            );
        }
    });
    
    appModule.renderApp(
        appModule,
        buttonModule,
        styleModule,
        idbModule,
        storageModule,
        uiModule
    );

})();


