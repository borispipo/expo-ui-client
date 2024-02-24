import { isAssets } from "../Assets/utils";
import {isNonNullString} from "$cutils";
import {isElectron} from "$cplatform";

export const readBlob = (asset)=>{
    const uri = isAssets(asset)? asset.uri :isNonNullString(asset)? asset : undefined;
    if(!uri){
        return Promise.reject({
            message :"Vous devez spécifier une uri valide où un paramètre de type asset valide la lecture du fichier",
        });
    }
    return new Promise((resolve,reject)=>{
        fetch(uri).then((response)=>{
            response.blob().then(resolve).catch(reject);
        }).catch(reject);
    })
}
const readAs = async (asset,fn)=>{
    return await new Promise((resole,reject)=>{
        readBlob(asset).then((response)=>{
            const fileReader = new FileReader();
            fn = typeof fn =="string" && fn && typeof fileReader[fn] =="function"? fileReader[fn] : "readAsText";
            fileReader[fn](response)
            fileReader.onload = function () {
                resole(fileReader.result);
            }; 
            fileReader.onerror = reject;
        }).catch(reject);
    })
}
export const readAsStringAsync = async (asset)=>{
    return readAs(asset);
}

export const Directories = {};

export const deleteFile = (filePath,...options)=>{
    if(!isNonNullString(filePath)){
        return Promise.reject({message:`Impossible de supprimer le fichier de chemin invalide!! veuillez spécifier une chaine de caractère comme chemin de fichier à supprimer`,filePath})
    }
    if(!isElectron() || !window?.ELECTRON || !window.ELECTRON?.FILE || typeof ELECTRON.FILE?.deleteFile !=="function"){
        return Promise.reject({message:`Impossible de supprimer le fichier dans cet environnement, cet environnement ne supporte  pas la supression des fichier`});
    }
    return new Promise((resolve,reject)=>{
        try {
            ELECTRON.FILE.deleteFile(filePath,...options);
            resolve(true);
        } catch(e){
            reject(e);
        }
    });
}

export {deleteFile as delete};