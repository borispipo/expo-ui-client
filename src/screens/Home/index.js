import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Browser,{session} from "$layouts/Browser";
import {useState} from "react";
import { useApp } from '../../hooks';

export default function HomeScreen() {
  const activeUrl = session.getActiveUrl();
  const [url,setUrl] = useState(activeUrl);
  const {updateTheme} = useApp();
  return (<>
    <View style={styles.container}>
      <Browser
        style = {[styles.browser1]}
        url = {url}
        onGetRemoteTheme = {(theme)=>{
          updateTheme(theme);
        }}
      />
    </View>
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