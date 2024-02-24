import WebView from "$components/WebView";
import session from "./session";
import {isNonNullString,defaultStr,isValidUrl} from "$cutils";
import { Text,View } from "react-native";
import theme from "$theme";

export {default as session} from "./session";

export default function WebBrowser({sessionName,title,url,...props}){
    url = isValidUrl(url)? url : undefined;
    if(!url && isNonNullString(sessionName)){
        const d = session.get(sessionName);
        if(isObj(d)){
            if(isValidUrl(d.url)){
                url = d.url;
            }
            title = defaultStr(title,d.title);
        }
    }
    if(!url){
        return <View style = {[theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.alignItemsCenter,theme.styles.flex1]}>
            <Text style={{color:theme.colors.error,fontSize:18,fontWeight:"bold"}}>Url ou adresse du site non valide</Text>
        </View>
    }
    return <WebView.Url
        url = {url}
        {...props}
    />
}