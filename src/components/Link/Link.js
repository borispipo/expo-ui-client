import { navigate } from "$cnavigation";
import PropTypes from "prop-types";
import {defaultStr,isValidUrl,isValidEmail,defaultNumber} from "$cutils";
import React from "$react";
import Browser from "./Browser";
import {TouchableOpacity} from "react-native";

const LinkComponent= React.forwardRef(({Component,navigation,children,params,stopEventPropagation,timeout,delay,source,onPress,routeParams,routeName,href,routeSource,routeType, ...rest},ref)=>{
    routeName = defaultStr(routeName,href);
    const isB = isValidUrl(routeName);
    const onRoutePress = (e)=>{
        if(stopEventPropagation !== false){
            React.stopEventPropagation(e);
        }
        if(onPress && onPress(e) === false){
            return;
        }
        if(isB){
            return Browser.openURL(routeName);
        }
        setTimeout(()=>{
            navigate({routeName,previousRoute:undefined,routeParams,params,type:routeType,source:defaultStr(routeSource,source)},navigation);
        },defaultNumber(timeout,delay));
    };
    if(typeof children =='function'){
        return children ({...rest,onPress:onRoutePress},ref);
    }
    Component = React.isComponent(Component)? Component : TouchableOpacity;
    return <Component ref={ref} {...rest} onPress={onRoutePress}>
        {children}
    </Component>
});

LinkComponent.propTypes = {
    stopEventPropagation : PropTypes.bool, //si la propagation d'évènement sera effective une fois qu'on ait cliqué sur le lien
    onPress : PropTypes.func,
    timeout : PropTypes.number,
    delay : PropTypes.number,//le delay d'attente lorsqu'on clique sur l'élément avant de faire la navigation
    routeName : PropTypes.string,
    href : PropTypes.string, //alias à routeName
    routeParams : PropTypes.object, //les paramètres à passer à la route
    routeType : PropTypes.string, //le type de route : stack ou drawer
    routeFrom : PropTypes.string, //le type de route source : stack ou drawer
    Component : PropTypes.any
}

LinkComponent.displayName = "LinkComponent";

export default LinkComponent;