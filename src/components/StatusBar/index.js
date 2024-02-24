import Component from "./Component";
import React from "$react";
import {Colors} from "$theme";
import { useApp } from "../../hooks";


export default function StatusBarMainComponent(props){
    const {theme} = useApp();
    const statusBarStyle = {
        animated: true
    }
    statusBarStyle.backgroundColor = theme.colors.statusBar;
    statusBarStyle.style = (Colors.isLight(theme.colors.statusBar)? "dark" : "light");
    return <Component {...statusBarStyle} {...props}/>
}