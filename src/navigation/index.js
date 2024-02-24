import {setInitialRouteName,sanitizeName } from "$cnavigation";
import React from "$react";
import { MainNavigationProvider } from "./hooks";
import {isWeb,isAndroid} from "$cplatform";
import Stack  from "./Stack";
import { getAnimation } from "./animationTypes";
import {extendObj,defaultObj} from "$cutils";
import theme from "$theme";;
import * as Linking from 'expo-linking';
import { getStateFromPath } from "@react-navigation/native";

export * from "./hooks";

export * from "./utils";

export const initLinking = (containerProps)=>{
    containerProps = defaultObj(containerProps);
    ///linking inintialization for config
    const prefix = Linking.createURL('/');
    containerProps.linking = defaultObj(containerProps.linking);
    containerProps.linking.prefixes = Array.isArray(containerProps.linking.prefixes)? containerProps.linking.prefixes : [];
    containerProps.linking.prefixes.unshift(prefix);
    containerProps.linking.config = defaultObj(containerProps.linking.config);
    if(!containerProps.linking.prefixes.length){
        const appName = sanitizeName(appConfig.name);
        if(appName){
            containerProps.linking.prefixes.push(`${appName.rtrim("://")}://`);
        }
    }
    const {getStateFromPath:cGetStateFromPath} = containerProps.linking;
    containerProps.linking.getStateFromPath = (path,config)=>{
        const state = defaultObj(getStateFromPath(path,config));
        if(typeof cGetStateFromPath =="function"){
            extendObj(true,true,state,cGetStateFromPath(path,config));
        }
        const home = sanitizeName("Home");
        state.routeNames = Array.isArray(state.routeNames)? state.routeNames : [];
        state.routes = Array.isArray(state.routes)? state.routes : []
        if(!state.routeNames.length){
            state.routeNames.push(home);
            state.routes.unshift({
                key : home, name : home,
            })
        }
        return state;
    }
    return containerProps;
}

/**** la fonction onGetStart doit normalement être appélée lorsque l'application 
 *  lorsque hasGetStarted est à false, celle-ci rend l'écran Start permettant de rendre le contenu GetStarted
*/
export default function NavigationComponent ({state,hasGetStarted,isLoading,onGetStart,screens,screenOptions,initialRouteName,...rest}){
    const cardStyleInterpolator = null;//getAnimation();
    initialRouteName = sanitizeName(initialRouteName);
    setInitialRouteName(initialRouteName);
    const getScreenOptions = (options,opt2)=>{
        const sOptions = defaultObj(typeof screenOptions =='function'? screenOptions(options) : screenOptions);
        const {navigation} = options;
        return extendObj(true,{},{
            headerShown : false,
            header : ()=> null,
            headerStyle: { backgroundColor: theme.colors.primary},
            presentation : isAndroid() || isWeb()? "modal":"default",
            animationEnabled : !isWeb(),
            detachPreviousScreen: !navigation.isFocused(),
            cardStyleInterpolator,
            ...Object.assign({},getAnimation()),
            ...defaultObj(opt2),
        },sOptions);
    }
    const cardStyle = { backgroundColor: 'transparent' };
    if(isWeb()){
        cardStyle.flex = 1;
    }
    return <MainNavigationProvider {...initLinking(rest)} state={state} initialRouteName={initialRouteName}>
            <Stack.Navigator 
                initialRouteName={initialRouteName} 
                screenOptions={getScreenOptions}
            >
               {screens}
            </Stack.Navigator> 
    </MainNavigationProvider>
}

export * from "$cnavigation";

export * from "./animationTypes";