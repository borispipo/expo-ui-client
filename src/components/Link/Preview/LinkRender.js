import React from "react";
import {StyleSheet, Image as RNImage } from "react-native";
import View from "$components/View";
import {useApp} from "$src/hooks";
import {isValidUrl} from "$cutils/uri";
import {defaultObj,isNonNullString,defaultStr} from "$cutils";
import Label from "$components/Label";
import {HStack} from "$components/Stack";
import Image from "../../AutoHeightImage";
import Link from "../Link";

const LinkPreview = ({data,onPress,disabled,...otherProps}) => {
  data = defaultObj(data);
  const {theme} = useApp();
  const {url,favicons,title,siteName,description,mediaType,contentType,images} = data;
  const label = defaultStr(title,siteName);
    const favicon = Array.isArray(favicons) && isValidUrl(favicons[0]) ? <RNImage
     style={{
       flex: 1,
       position: "relative",
       width : 70,
       height : 70,
     }}
     source={{ uri: favicons[0] }}
   /> : null;
   const image = Array.isArray(images) && isValidUrl(images[0]) ? <RNImage
   style={{
     flex: 1,
     position: "relative",
     width : "100%",
     minWidth : 200,
     height : 100,
   }}
   source={{ uri: images[0] }}
 />  : null;
 const style = [{with:"100%"}];
 return <View {...otherProps} style={[otherProps.style]}>
  <Link disabled={disabled} href={url}>
    {label ? <Label textBold style={{color:theme.colors.primary}} fontSize={18}>{label}</Label>:null}
    {isNonNullString(description) ? <Label>{description}</Label> : null}
    {isValidUrl(url)? <Label fontSize={9}>{url}</Label> : null}
  </Link>
  <HStack>
    {image?<View style={style}>{image}</View> : favicon?<View style={style}>{favicon}</View> : null}
  </HStack>
 </View>
};

const styles = StyleSheet.create({
  container: {
  
  },
});

export default LinkPreview;