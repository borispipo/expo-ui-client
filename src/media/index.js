import { readAsStringAsync } from "./utils";
import { loadAsset } from "./Assets/utils";
import Asset from "./Assets";

export * from "./Assets";


export * from "./utils";

export {Asset};

export const readFileAsText = async (asset)=>{
    return await new Promise((resolve,reject)=>{
        loadAsset(asset).then((a)=>{
            readAsStringAsync(a.localUri).then((data) => {
                resolve(data);
            }).catch(reject);
        }).catch(reject);
    })
}
export const readFile = readFileAsText;