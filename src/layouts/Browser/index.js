import WebView from "$components/WebView";
import session from "./session";
import {isNonNullString,defaultStr,isLoading,isValidUrl,isJSON,isObj} from "$cutils";
import { Text } from "react-native";
import theme from "$theme";
import { forwardRef,useRef,useState,useEffect,useMergeRefs,usePrevious} from "$react";
import { ActivityIndicator } from "react-native-paper";
import { useApp } from "../../hooks";
import View from "$components/View";
import {isValid} from "$theme";
import * as EVENTS from "./events";
import {save} from "$media/FileSaver";
import {BackHandler, Platform } from "react-native";
export {EVENTS};
import Label from "$components/Label";

export {default as session} from "./session";

const flexStyle = [theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.alignItemsCenter,theme.styles.flex1];

const  WebBrowser = forwardRef(({sessionName,onMessage,name,onLoad,onUpdateRemoteTheme,onGetRemoteTheme,title,url,...props},ref)=>{
    url = isValidUrl(url)? url : undefined;
    const prevUrl = usePrevious(url);
    const isInitializedRef = useRef(false);
    const {theme:appTheme} = useApp();
    const [isLoading,setIsLoading] = useState(url && isInitializedRef.current ? url !== prevUrl : true || false);
    const innerRef = useRef(null);
    useEffect(()=>{
        if(!isInitializedRef.current && url){
            isInitializedRef.current = true;
        }
    },[url])
    useEffect(() => {
        if (Platform.OS === 'android') {
          const onAndroidBackPress = () => {
            if (innerRef.current) {
              return true; // prevent default behavior (exit app)
            }
            return false;
          };
          BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);
          return () => {
            BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
          };
        }
      }, []);
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
        return <View style = {flexStyle}>
            <Text style={{color:theme.colors.error,fontSize:18,fontWeight:"bold"}}>Url ou adresse du site non valide</Text>
        </View>
    }
    return <View style = {[theme.styles.flex1]}>
        {isLoading ? <View style={flexStyle}>
            <View>
                <ActivityIndicator
                    testID="RN_ActivityIndicatorComponent"
                    color={appTheme.colors.primary}
                    size = "medium"
                />
                {isNonNullString(name)?<Label style={theme.styles.p1}>{name}</Label> : null}
            </View>
        </View> : null}
        <WebView.Url
            url = {url}
            {...props}
            onMessage = {(event)=>{
                let data = event?.nativeEvent?.data;
                if(isJSON(data)){
                    data = JSON.parse(data);
                }
                if(typeof onMessage =="function"){
                    onMessage({event,data});
                }
                if(isObj(data)){
                    if(data.isTheme && isValid(data.theme)){
                        if(data.isUpdateEvent && typeof onUpdateRemoteTheme =="function"){
                            onUpdateRemoteTheme(data.theme);
                        } else if(typeof onGetRemoteTheme =="function"){
                            onGetRemoteTheme(data.theme);
                        }
                    } else if(data.event ==="FILE_SAVER_SAVE_FILE" && isObj(data.data) && data?.data?.content){
                        return save(data.data);
                    }
                }
            }}
            onLoadEnd={(event) => {
                setIsLoading(false);
                if(typeof onLoadEnd =='function'){
                    onLoadEnd({event,innerRef,chartContext});
                }
                if(!innerRef.current || !innerRef.current?.injectJavaScript || !url) return ()=>{};
                innerRef.current?.injectJavaScript(`
                    if(typeof window !=="undefined" && window && typeof window?.getCurrentAppTheme ==="function"){
                        const theme = getCurrentAppTheme();
                        window.ReactNativeWebView.postMessage(JSON.stringify({isTheme : true, theme:theme}));
                    }
                    if(typeof window?.APP =="object" && typeof window?.APP?.on =="function" && typeof APP?.EVENTS?.UPDATE_THEME =="string" && APP?.EVENTS?.UPDATE_THEME){
                        const onUpdateTheme = (theme)=>{
                            window.ReactNativeWebView.postMessage(JSON.stringify({isTheme : true, theme:theme,isUpdateEvent : true}));
                        }
                        APP.on(APP.EVENTS.UPDATE_THEME,onUpdateTheme);
                    }
                `);
            }}
            ref = {useMergeRefs(ref,innerRef)}
        />
    </View>
});

WebBrowser.diplayName = "WebBrowser";

export default WebBrowser;

