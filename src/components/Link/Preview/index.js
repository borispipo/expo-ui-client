import React, { useState, useEffect } from "react";
import {StyleSheet } from "react-native";
import {isValidUrl} from "$cutils/uri";
import { ActivityIndicator } from "react-native-paper";
import View from "$components/View";
import theme from "$theme";
import { parseLink } from "./utils";
import LinkRender from "./LinkRender";

const LinkPreview = ({url,link,...props}) => {
  const [data, setData] = useState(null);
  url = isValidUrl(url)? url : isValidUrl(link)? link : undefined;
  const [isLoading,setIsLoading] = useState(false);//useState(!!url);
  useEffect(() => {
    if(url){
        if(!isLoading){
            setIsLoading(true);
        }
        parseLink(link, props).then(data => {
            setData(data);
        }).finally(()=>{
            setIsLoading(false);
        }).catch((e)=>{
            console.log(e," parsigng site name ",url)
        })
    }
  }, [url]);
  return (
    <>
      {isLoading?<View style={[styles.activity]}>
        <ActivityIndicator
            color = {theme.colors.primary}
            size = {"large"}
        />
      </View> : null}
      {data  ? <LinkRender
        {...props}
        data={data}
      /> : null}
    </>
  );
};

const styles = StyleSheet.create({
    activity : {
        justifyContent : "center",
        alignItems : "center",
    }
})
export default LinkPreview;