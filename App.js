import { StatusBar } from 'expo-status-bar';
import Navigation from "$src/navigation";
import screens from "$screens";
import { StyleSheet,View } from 'react-native';
import { SafeAreaProvider,useSafeAreaInsets } from 'react-native-safe-area-context';
import {Provider as PaperProvider,Portal } from 'react-native-paper';
import  mainTheme, {updateTheme,defaultTheme} from "$theme";
import { loadFonts } from './src/components/Icon';
import { useState,useEffect} from '$react';
import FontIcon from "./src/components/Icon/Font";
import { ActivityIndicator } from 'react-native-paper';

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
          <StatusBar style="auto" />
        </View>
      </Portal.Host>
    </PaperProvider>
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
