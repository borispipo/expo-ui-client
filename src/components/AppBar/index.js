import {defaultObj} from "$utils";
import BackAction from "./BackAction";
import { useNavigation } from '@react-navigation/native';
import { StyleSheet } from "react-native";
import {useGetThemeColors} from "./utils";
import View from "$components/View";
import Label from "$components/Label";
import Surface from "$components/Surface";
import React from "$react";

export default function AppbarComponent ({backActionProps,title,actions,...props}){
    backActionProps = defaultObj(backActionProps);
    const navigation = useNavigation();
    const {color,backgroundColor,onPrimary} = useGetThemeColors();
    actions = typeof actions =="function"? actions({color,backgroundColor,onPrimary}) : actions;
    return <Surface elevation={5} {...props} style={[styles.container,{backgroundColor},props.style]}>
        <BackAction
            {...backActionProps}
            color = {onPrimary}
            size = {30}
            onPress = {(e)=>{
                if(typeof backActionProps.onPress =="function" && backActionProps.onPress() === false) return;
                if(typeof navigation?.canGoBack =="function" && navigation?.canGoBack()){
                    return navigation.goBack();
                }
            }}
        />
        <Label style={[{color:onPrimary},styles.label]}>{title}</Label>
        {React.isValidElement(actions)? actions : null}
    </Surface>
}


const styles = StyleSheet.create({
    container : {
        flexDirection :"row",
        justifyContent : "flex-start",
        alignItems : "center",
        minHeight : 40,
    },
    label : {
        fontSize : 17,
        fontWeight : "bold",
    }
})