import * as React from 'react';
import { View, StyleSheet,TouchableWithoutFeedback } from 'react-native';
import Browser,{session,EVENTS} from "$layouts/Browser";
import {useState,useEffect} from "react";
import { useApp } from '../../hooks';
import APP from "$capp/instance";
import {useRef} from "react";
import {navigate} from "$cnavigation";
import { screenName as siteScreenName } from '../Sites/utils';
import AppBar from "$components/AppBar";

export default function HomeScreen(props) {
  const [active,setActive] = useState(session.getActive());
  const {updateTheme} = useApp();
  const pressCountRef = useRef(0);
  const timeoutRef = useRef(null);
  const timeRef = useRef(new Date().getTime());
  const cActive = session.getActive();
  useEffect(()=>{
    if(cActive?.name !== active?.name || cActive?.url !== active?.url){
      setActive(cActive);
    }
  },[JSON.stringify(cActive)]);
  return (<>
    <TouchableWithoutFeedback style={styles.container} onPress={(e)=>{
      if(new Date().getTime() - timeRef.current > 30000) {
        pressCountRef.current = 0;
        timeoutRef.current = new Date().getTime();
        return;
      }
      pressCountRef.current++;
      if(pressCountRef.current >= 5){
        pressCountRef.current = 0;
        timeoutRef.current = new Date().getTime();
        return navigate(siteScreenName);
      }
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