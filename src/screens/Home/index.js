import * as React from 'react';
import { View, StyleSheet,TouchableWithoutFeedback } from 'react-native';
import Browser,{session,EVENTS} from "$layouts/Browser";
import {useState,useEffect} from "react";
import { useApp } from '../../hooks';
import {navigate} from "$cnavigation";
import { screenName as siteScreenName } from '../Sites/utils';

export default function HomeScreen(props) {
  const [active,setActive] = useState(session.getActive());
  const {updateTheme} = useApp();
  const cActive = session.getActive();
  useEffect(()=>{
    if(cActive?.name !== active?.name || cActive?.url !== active?.url){
      setActive(cActive);
    }
  },[JSON.stringify(cActive)]);
  return (<>
    <TouchableWithoutFeedback style={styles.container} 
      delayLongPress = {2000}
      onLongPress={(e)=>{
        return navigate(siteScreenName);
    }}>
      <Browser
        style = {[styles.browser1]}
        url = {active.url}
        onGetRemoteTheme = {(theme)=>{
          updateTheme(theme);
        }}
        name = {active.name}
      />
    </TouchableWithoutFeedback>
  </> );
}

const styles = StyleSheet.create({
  browser : {
    flex : 1,
  },
  container : { 
    flex: 1,
  },
})
HomeScreen.screenName = "Home";