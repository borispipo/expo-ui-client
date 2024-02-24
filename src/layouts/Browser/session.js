import session from "$session";
import {isObj,extendObj,isValidUrl} from "$cutils";
import appConfig from "$capp/config";
export const sessionKey = "web-browser-sessionskeys";

const activeSessionName = "activeSite";


export const defaultURL = isValidUrl (process.env.DEFAULT_URL)? process.env.DEFAULT_URL : "https://smart-eneo.fto-consulting.com";

export const get = (key)=>{
    const r = Object.assign({},session.get(sessionKey));
    if(typeof key =="string") return r[key];
    if(!r[appConfig.name]){
        r[appConfig.name] = getDefaultActive();
    }
    return r;
}

const getDefaultActive = ()=>{
    return {
        name : appConfig.name,
        url : defaultURL,
    };
}
export const getActive = ()=>{
    const s = session.get(activeSessionName);
    const r = typeof s =="string" ? get(activeSessionName)  : null;
    if(isObj(r) && isValidUrl(r.url)) return r;
    return getDefaultActive();
}

export const getActiveUrl = ()=>{
    const active = getActive();
    if(isValidUrl(active?.url)){
        return active.url;
    }
    return undefined;
}
export const setActive = (site)=>{
    const name = typeof site =="string"? site : isObj(site)? site.name : null;
    session.set(activeSessionName,name);
    return name;
}
export const set = (key,config)=>{
    const s = get();
    if(isObj(key)){
        extendObj(s,key);
    } else if(typeof key=="string" && isObj(config)){
        s[key] = config;
    }
    session.set(sessionKey,s);
    return s;
}

export default {
    sessionKey,
    get,
    set,
    getActive,
    setActive,
    getActiveUrl,
}