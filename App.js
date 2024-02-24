import StatusBar from "$components/StatusBar"; 
import Navigation from "$src/navigation";
import screens from "$screens";
import { StyleSheet,View } from 'react-native';
import { SafeAreaProvider,useSafeAreaInsets } from 'react-native-safe-area-context';
import {Provider as PaperProvider,Portal } from 'react-native-paper';
import  mainTheme, {Colors,isValid,updateTheme,defaultTheme} from "$theme";
import { loadFonts } from './src/components/Icon';
import { useState,useEffect} from '$react';
import FontIcon from "./src/components/Icon/Font";
import { ActivityIndicator } from 'react-native-paper';
import {AppContext} from "./src/hooks";
import {isObj} from "$cutils";

export default function App() {
  return <SafeAreaProvider>
    <AppChildrenComponent/>
  </SafeAreaProvider>
}

const AppChildrenComponent = (props)=>{
  const insets = useSafeAreaInsets();
  const [resourcesLoaded,setResourcesLoaded] = useState(false); 
  const loadResources = ()=>{
      return new Promise((resolve)=>{
         loadFonts().then(()=>{
          setResourcesLoaded(true);
         }).catch((e)=>{
           console.warn(e," ierror loading app resources fonts");
         }).finally(()=>{
           resolve(true);
         });
      })
   }
  useEffect(()=>{
    loadResources();
  },[])
  const [theme,setTheme] = useState(updateTheme(defaultTheme));
  if(!resourcesLoaded){
    return <View style={styles.activityIndicator}>
        <ActivityIndicator
          size = {"large"}
          color = {mainTheme.colors.primary}
        />
    </View>
  }
  return (
    <AppContext.Provider value={{theme,updateTheme:(nTheme)=>{
      if(!isValid(nTheme)  || !isObj(nTheme) || !isObj(nTheme?.colors) || !Colors.isValid(nTheme?.colors?.primary) || !Colors.isValid(nTheme?.colors?.secondary)) return null;
      let isEquals = nTheme.name === theme.name;
      if(isEquals){
        const cols = ["primary","secondary","error","info"];
        for(let i in cols){
          if(nTheme.colors[i] !== theme.colors[i]){
            isEquals = false;
            break;
          }
        }
      }
      if(isEquals) return;
      setTheme({...updateTheme(nTheme)});
    }}}>
        <PaperProvider 
          theme={theme}
            settings={{
              icon: (props) => {
                return <FontIcon {...props}/>
              },
            }}
        >
        <Portal.Host testID="RN_NativePaperPortalHost">
          <View style={StyleSheet.flatten([
            {
                paddingBottom: insets.bottom,
                paddingTop : insets.top,
                paddingLeft: insets.left,
                paddingRight: insets.right,
              },
            props.style,styles.container])} testID="RN_MainExpoUIClientComponent">
            <Navigation
              screens ={screens}
            />
            <StatusBar/>
          </View>
        </Portal.Host>
      </PaperProvider>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activityIndicator : {
    flex : 1,
    alignItems : "center",
    justifyContent : "center",
  }
});
