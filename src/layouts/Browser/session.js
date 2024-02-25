import session from "$session";
import {isObj,extendObj,isValidUrl} from "$cutils";
import appConfig from "$capp/config";
import APP from "$capp";
import {ACTIVATE_SITE,UPDATE_SITE} from "./events";
import * as EVENTS from "./events";

export {EVENTS};

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
    const r = typeof s =="string" ? get(s)  : null;
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
    const active = getActive(name);
    if(!isValidUrl(active?.url) || !active?.name){
        return false;
    }
    session.set(activeSessionName,name);
    APP.trigger(ACTIVATE_SITE,active);
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
    APP.trigger(UPDATE_SITE,key,config);
    return s;
}
export const deleteSession = (key)=>{
    if(typeof key !=="string") return false;
    const s = get();
    delete s[key];
    session.set(sessionKey,s);
    APP.trigger(UPDATE_SITE,key);
    return true;
}

export default {
    sessionKey,
    get,
    set,
    delete : deleteSession,
    getActive,
    setActive,
    getActiveUrl,
}