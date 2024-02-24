import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import Browser,{session} from "$layouts/Browser";
import {useState} from "react";

export default function HomeScreen() {
  const [url,setUrl] = useState("https://smart-eneo.fto-consulting.com")
  return (
    <View style={styles.container}>
      <Browser
        style = {[styles.browser]}
        url = {url}
      />
    </View>
  );
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