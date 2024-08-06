import { IButton } from "./Button.js";
import { GenericControlName, MIDIInputName, UIInterfaceDeviceName } from "./MIDIController.js";
import { IMIDIMappingPreference, createMIDIMappingPreference, setMIDICallbackMapBasedOnControllerName } from "./MIDIMapping.js";
import * as idb from "./IDB.js";
import { idb_dbName, idb_storeName, idb_version } from "./Constants.js";

export function getMIDIMappingFromStorage(name: MIDIInputName): IMIDIMappingPreference<typeof name> | null {
    if (localStorage.getItem(name)) {
        const ret = createMIDIMappingPreference<typeof name>(JSON.parse(localStorage.getItem(name)!));
        setMIDICallbackMapBasedOnControllerName(ret);
        return ret;
    } else {
        return null;
    }
}

export function updateMIDIMappingInStorage<T extends MIDIInputName>(
    pref: IMIDIMappingPreference<T>,
    controlName: GenericControlName<T>,
    channel: number,
    uiName: UIInterfaceDeviceName
) {
    const storageMapping = createMIDIMappingPreference(
        (JSON.parse(localStorage.getItem(pref.name)!) as IMIDIMappingPreference<T>).name
    );

    // overwrite new mapping with the inputs to this function
    // somehow check which controls are mapped already and if they already have
    // a channel assigned to them which is the same as the one we're trying to assign
    // then unset it to the default un-set values
    if (
        storageMapping.mapping[controlName].channel === channel &&
        storageMapping.mapping[controlName].uiName === uiName
    ) {
        storageMapping.mapping[controlName].channel = 9999;
        storageMapping.mapping[controlName].uiName = "" as any;
        window.localStorage.setItem(pref.name, JSON.stringify(storageMapping));
    }

    // TODO-NOTE:
    // right now multiple channels could be mapped to the same ui control interface
    storageMapping.mapping = {
        ...storageMapping.mapping,
        [controlName]: {
            channel,
            uiName,
        },
    };

    localStorage.setItem(pref.name, JSON.stringify(storageMapping));
    return storageMapping;
}

export async function getStorageButtons(): Promise<Array<IButton["props"]>> {
    return new Promise<Array<IButton["props"]>>((res) => {
        (async () => {
            const result = await idb.idbContainsStoreName(idb_storeName, idb_dbName);
            if (result) {
                const buttons = await idb.idb_getAll(idb_storeName, idb_dbName, idb_version);
                res(buttons as IButton["props"][]);
            } else {
                res([]);
            }
        })();
    });
}

export function createStorage(name: MIDIInputName): IStorage {
    return {
        "getMIDIMappingFromStorage": () => getMIDIMappingFromStorage(name),
        "updateMIDIMappingInStorage": (pref, controlName, channel, uiName) => updateMIDIMappingInStorage(pref, controlName, channel, uiName),
        "getStorageButtons": () => getStorageButtons(),
    }
}

export interface IStorage {
    getMIDIMappingFromStorage(name: MIDIInputName): IMIDIMappingPreference<typeof name> | null;
    updateMIDIMappingInStorage<T extends MIDIInputName>(
        pref: IMIDIMappingPreference<T>,
        controlName: GenericControlName<T>,
        channel: number,
        uiName: UIInterfaceDeviceName
    ): IMIDIMappingPreference<T>;
    getStorageButtons(): Promise<Array<IButton["props"]>>
}