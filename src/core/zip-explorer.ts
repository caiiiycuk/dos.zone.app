import { DosConfig } from "emulators/dist/types/dos/bundle/dos-conf";

declare const zip: any;

export interface JsDosZipData {
    executables: string[];
    dosboxConf?: string;
    config?: DosConfig;
}

export function ZipExecutables(zipBlob: Blob): Promise<JsDosZipData> {
    return new Promise<JsDosZipData>((resolve, reject) => {
        const zipData: JsDosZipData = {
            executables: [],
        };
        zip.createReader(new zip.BlobReader(zipBlob), (reader: any) => {
            reader.getEntries((entries: any) => {
                let configPromise: Promise<string> = Promise.resolve("");
                let dosboxPromise: Promise<string> = Promise.resolve("");
                for (const entry of entries) {
                    const filename: string = entry.filename;
                    if (filename.toLocaleLowerCase().endsWith(".com") ||
                        filename.toLocaleLowerCase().endsWith(".exe") ||
                        filename.toLocaleLowerCase().endsWith(".bat")) {
                        zipData.executables.push(filename);
                    }

                    if (filename === ".jsdos/jsdos.json") {
                        configPromise = new Promise<string>((resolveConfig) => {
                            entry.getData(new zip.TextWriter(), (text: any) => {
                                resolveConfig(text);
                            });
                        });
                    }

                    if (filename === ".jsdos/dosbox.conf") {
                        dosboxPromise = new Promise<string>((resolveConfig) => {
                            entry.getData(new zip.TextWriter(), (text: any) => {
                                resolveConfig(text);
                            });
                        });
                    }
                }

                dosboxPromise = dosboxPromise.then((config) => {
                    zipData.dosboxConf = config;
                    return config;
                });

                configPromise = configPromise.then((config) => {
                    if (config.length > 0) {
                        zipData.config = JSON.parse(config);
                    }
                    return config;
                });

                Promise.all([dosboxPromise, configPromise])
                    .then(() => {
                        reader.close();
                        resolve(zipData);
                    })
                    .catch((e) => reject(e));
            });
        }, (e: any) => {
            reject(e);
        });
    });

}
