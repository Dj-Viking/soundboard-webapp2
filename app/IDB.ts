/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createButton } from "./Button.js";
import { idb_dbName, idb_storeName, idb_version } from "./Constants.js";
import { MIDIInputName } from "./MIDIController.js";
import { MIDIMapping, MIDIMappingPreference } from "./MIDIMapping.js";
import { Storage } from "./Storage.js";
// make this the abstract class to make new idb helpers based on their type

export function initButtonsIdb(): void {
    openConnection(idb_dbName, idb_version).then((request) => {
        request.onupgradeneeded = (_event: IDBVersionChangeEvent) => {
            // console.info("on upgrade needed called with new version change", event);

            let tempDb = request!.result;
            if (!request.result.objectStoreNames.contains("buttons")) {
                tempDb.createObjectStore("buttons", { keyPath: "id" });
            }
        };
        request.onerror = (_event: Event) => {
            console.error("an error occurred during the open request", event);
        };
    });
}

export function idbContainsStoreName(storeName: string, dbName: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        let res = window.indexedDB.open(dbName);
        res.onsuccess = () => {
            const isPresent = res.result.objectStoreNames.contains(storeName);
            resolve(isPresent);
        };
        res.onerror = (e) => {
            console.error("failed to validate object store name is in idb", e);
            reject();
        };
    });
}

export function openStore(
    reqResult: IDBRequest,
    storeName: string
): Promise<[IDBDatabase, IDBObjectStore, IDBTransaction]> {
    // console.info("indexed db open request succeeded");
    return new Promise((res) => {
        // start saving references to the database to the `db` variable
        const tempDb = reqResult.result;

        // open a transaction to whatever we pass into `storeName`
        // must match one of the object store names in this promise
        const tempTransaction = tempDb.transaction(storeName, "readwrite");

        // save a reference to that object store that we passed as
        // the storename string
        const store = tempTransaction.objectStore(storeName);

        res([tempDb, store, tempTransaction]);
    });
}

export function openConnection(dbName: string, version: number): Promise<IDBOpenDBRequest> {
    // console.info("opening connection for a transaction to idb");
    return new Promise((res) => {
        (async () => {
            res(window.indexedDB.open(dbName, version));
        })();
    });
}

export function idb_put(item: any) {
    return new Promise<void>((res) => {
        openConnection(idb_dbName, idb_version).then((req) => {
            req.onsuccess = () => {
                openStore(req, idb_storeName).then(([db, store, transaction]) => {
                    store.put(item);
                    transaction.oncomplete = () => {
                        db.close();
                        res();
                    };
                });
            };
        });
    });
}
export function idb_update(item: any) {
    return new Promise<void>((res) => {
        openConnection(idb_dbName, idb_version).then((req) => {
            req.onsuccess = () => {
                openStore(req, idb_storeName).then(([db, store, transaction]) => {
                    const itemsReq: IDBRequest<any[]> = store.getAll();

                    itemsReq.onsuccess = () => {
                        if (itemsReq.result.length > 0) {
                            const filtered = itemsReq.result
                                .filter((props) => props.id === item.id)
                                .map((props) => createButton(props));

                            const btnToUpdate = filtered.find((btn) => btn.el.id === item.id)!;

                            btnToUpdate.props = { ...btnToUpdate.props, file: item.file };

                            store.delete(item.id);
                            store.put(btnToUpdate.props);
                        }
                    };

                    transaction.oncomplete = () => {
                        // console.info("transaction complete closing connection");
                        db.close();
                        res();
                    };
                });
            };
        });
    });
}
export function idb_getAll<T = any>(storeName: "buttons", dbName: string, version: number): Promise<T[]> {
    return new Promise<any[]>((res) => {
        openConnection(dbName, version).then((req) => {
            req.onsuccess = () => {
                openStore(req, storeName).then(([db, store, transaction]) => {
                    const itemsReq = store.getAll();

                    itemsReq.onsuccess = () => {
                        transaction.oncomplete = () => {
                            db.close();
                        };
                        res(itemsReq.result);
                    };
                });
            };
            req.onerror = (e: any) => {
                console.error("error during idb getall requests", e);
            };
        });
    });
}
export function idb_delete(item: any, dbName: string, version: number): Promise<void> {
    return new Promise<void>((res) => {
        openConnection(dbName, version).then((req) => {
            req.onsuccess = () => {
                openStore(req, "buttons").then(([db, store, transaction]) => {
                    store.delete((item as any).id);
                    transaction.oncomplete = () => {
                        db.close();
                    };
                    res();
                });
            };
        });
    });
}
