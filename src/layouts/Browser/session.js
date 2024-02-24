import session from "$session";
import {isObj,extendObj} from "$cutils";

export const sessionKey = "web-browser-sessionskeys";

export const get = (key)=>{
    const r = Object.assign({},session.get(sessionKey));
    if(typeof key =="string") return r[key];
    return r;
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
}