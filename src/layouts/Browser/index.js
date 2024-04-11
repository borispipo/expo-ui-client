import WebView from "$components/WebView";
import session from "./session";
import {isNonNullString,defaultStr,isLoading,isValidUrl,isJSON,isObj,logRNWebview,WEBVIEW_SAVE_FILE_EVENT,WEBVIEW_LOG_EVENT} from "$cutils";
import { Text } from "react-native";
import theme from "$theme";
import { forwardRef,useRef,useState,useEffect,useMergeRefs,usePrevious} from "$react";
import { ActivityIndicator,Portal,Button} from "react-native-paper";
import { useApp } from "../../hooks";
import View from "$components/View";
import {isValid} from "$theme";
import * as EVENTS from "./events";
import {save} from "$media/FileSaver";
import {BackHandler, Platform,StyleSheet,Alert,useWindowDimensions} from "react-native";
export {EVENTS};
import Label from "$components/Label";
import notify from "$notify";
import Surface from "$components/Surface";
import {navigate} from "$cnavigation";
import { screenName as siteScreenName } from '$screens/Sites/utils';

let MAX_BACK_COUNT = 1;
let countBack = 0;
let isBackConfirmShowing = false;  

const resetExitCounter = ()=>{
  countBack = 0
  isBackConfirmShowing = false;
};

export {default as session} from "./session";

const flexStyle = [theme.styles.w100,theme.styles.justifyContentCenter,theme.styles.h100,theme.styles.alignItemsCenter,theme.styles.flex1];

const getErrorString = (nativeEvent)=>{
    let error = "";
    if(isNonNullString(nativeEvent?.title)){
        error+= `title : ${nativeEvent?.title}`;
    }
    if(isNonNullString(nativeEvent.description)){
        error +=`${error && ', '||''}description : ${nativeEvent.description}`;
    }
    if(nativeEvent?.url){
        error +=`${error && ', '||''}url : ${nativeEvent.url}`;
    }
    if(nativeEvent?.code){
        error +=`${error && ', '||''}code : ${nativeEvent.code}`;
    }
    if(nativeEvent?.statusCode){
        error +=`${error && ', '||''}status code : ${nativeEvent.statusCode}`;
    }
    return error;
}

const  WebBrowser = forwardRef(({sessionName,onMessage,name,onLoad,onUpdateRemoteTheme,onGetRemoteTheme,title,url,...props},ref)=>{
    url = isValidUrl(url)? url : undefined;
    const prevUrl = usePrevious(url);
    const isInitializedRef = useRef(false);
    const {theme:appTheme} = useApp();
    const [isLoading,setIsLoading] = useState(url && isInitializedRef.current ? url !== prevUrl : true || false);
    const [error,setError] = useState(null);
    const canGoBackRef = useRef(false);
    const innerRef = useRef(null);
    useEffect(()=>{
        if(!isInitializedRef.current && url){
            isInitializedRef.current = true;
        }
    },[url])
    useEffect(() => {
        if (Platform.OS === 'android') {
          const onAndroidBackPress = () => {
            if(canGoBackRef.current){
                resetExitCounter();
            }
            if (innerRef.current) {
                innerRef.current.goBack();
                //return true; // prevent default behavior (exit app)
            }
            if(isBackConfirmShowing) {
                return true;
            }
            if(countBack < MAX_BACK_COUNT){
                countBack++;
                isBackConfirmShowing = false;
                if(countBack === MAX_BACK_COUNT){
                    notify.toast({text:'Cliquez à nouveau pour quiiter l\'application'});
                }
                return true;
            }
            isBackConfirmShowing = true;
            Alert.alert('Quittez l\'application', 'Voulez vous vraiment quitter l\'application?', [
                {
                  text: 'Quitter',
                  onPress: () => {
                    BackHandler.exitApp();
                  },
                },
                {
                  text: 'Annuler',
                  style: 'cancel',
                  onPress : ()=>{
                    resetExitCounter();
                  }
                },
            ]);
            return true;
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
        { isLoading? <Loading name={name}/>:null}
        <WebView.Url
            url = {url}
            {...props}
            onError={(syntheticEvent) => {
                if(typeof props.onError ==="function"){
                    props.onError(syntheticEvent);
                }
                const { nativeEvent } = syntheticEvent;
                setError(`Error :  ${getErrorString(nativeEvent)}`);
            }}
            onHttpError={(syntheticEvent) => {
                if(typeof props.onHttpError =='function'){
                    props.onHttpError(syntheticEvent);
                }
                const { nativeEvent } = syntheticEvent;
                setError(`Http error : ${getErrorString(nativeEvent)}`)
            }}
            onNavigationStateChange={(navState) => {
                canGoBackRef.current = navState.canGoBack;
                if(typeof props.onNavigationStateChange =="function"){
                    props.onNavigationStateChange(navState);
                }
            }}
            onMessage = {(event)=>{
                let data = event?.nativeEvent?.data;
                if(isJSON(data)){
                    data = JSON.parse(data);
                }
                if(isObj(data) && data.event === WEBVIEW_LOG_EVENT && isObj(data.data) ){
                    return console.log(data.event,data.data.message);
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
                    } else if(data.event === WEBVIEW_SAVE_FILE_EVENT && data?.data?.content){
                        return save(data.data);
                    }
                }
            }}
            onLoadEnd={(event) => {
                setIsLoading(false);
                setError(null);
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
            renderLoading = {()=><Loading name={name}/>}
            ref = {useMergeRefs(ref,innerRef)}
        />
        {error || isLoading ? <Surface elevation={5} style={[theme.styles.row,{bottom:0,height:50,position:"absolute",left:0},theme.styles.justifyContentCenter,theme.styles.alignItemsCenter,theme.styles.w100,{bottom:0,backgroundColor:appTheme.colors.surface}]} testID={"RN_LayoutBrowerErrorContainer"} >
                {!isLoading ? <Button onPress={(e)=>{
                    if(innerRef.current?.reload){
                        innerRef.current?.reload();
                    }
                }} icon={"web-refresh"} textColor={appTheme.colors.onSurface}>
                    Rafraichir
                </Button>:null}
                <Button style={{fontSize:15}} onPress={(e)=>{
                    setIsLoading(false);
                    setTimeout(()=>{
                        navigate(siteScreenName);
                    },100);
                }} icon={"apps"} textColor={appTheme.colors.onSurface}>
                    Applications
                </Button>
            </Surface> : null}
    </View>
});


export const Loading = ({name})=>{
    const {theme:appTheme} = useApp();
    const {width,height} = useWindowDimensions();
    return <Portal>
        <View style={[flexStyle,StyleSheet.absoluteFill,{width,height}]}>
            <View>
                <ActivityIndicator
                    testID="RN_ActivityIndicatorComponent"
                    color={appTheme.colors.primary}
                    size = "medium"
                />
                {isNonNullString(name)?<Label style={theme.styles.p1}>{name}</Label> : null}
            </View>
        </View>
    </Portal>;
}

WebBrowser.diplayName = "WebBrowser";

export default WebBrowser;