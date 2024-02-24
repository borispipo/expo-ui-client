import {View,StyleSheet} from "react-native";
import PropTypes from "prop-types";
import React from "$react";
import {isMobileNative} from "$cplatform";
import {debounce,isNumber,isNonNullString} from "$cutils";
import useStableMemo  from "$react/useStableMemo";
import Dimensions,{ useWindowDimensions } from "$cdimensions";


const ViewComponent = React.forwardRef(({onRender,onLayoutTimeout,pointerEvents,onLayout,autoHeight,autoWidth,elevation,...props},ref)=>{
    const style = useMediaQueryUpdateStyle(props);
    ref = ref ? ref: x=>x;
    const autoSize = autoHeight||autoWidth ? true : false;
    const [state,setState] = autoSize ? React.useState({}) : [{}];
    const {width,height} = state;
    const onL = (e)=>{
        if(!e || !e.nativeEvent || !e.nativeEvent.layout) return;
        const h = e.nativeEvent.layout.height,w = e.nativeEvent.layout.width;
        if(onLayout && onLayout(e) === false) return;
        if(autoSize && typeof h =='number' && typeof w ==='number'){
            if(isObj(state)){
                if(autoWidth && typeof state.width == 'number' && Math.abs(state.width-w) < 50) return;
                if(autoHeight && typeof state.height =='number' && Math.abs(state.height-h) < 50) return;
            }
            setState({height:h,width:w});
        }
    };
    React.useOnRender(onRender);
    return <View
         {...props} 
         style = {[isNonNullString(pointerEvents) && pointerEventsStyles[pointerEvents] ||null,
         style,
            autoSize && [
                autoHeight && isNumber(height) && height > 10 && {height},
                autoWidth && isNumber(width) && width > 10 && {width}
            ]
         ]}
         onLayout = {isMobileNative()? onL : debounce(onL,typeof onLayoutTimeout =='number'? onLayoutTimeout : 100)}
         ref={ref}
    />
});

export default ViewComponent;

ViewComponent.displayName = "ViewComponent";

ViewComponent.propTypes = {
    mediaQueryUpdateStyle : PropTypes.func,
    autoWidth : PropTypes.bool,//si la taille de la vue est calculée automatiquement
    autoHeight : PropTypes.bool,//si la taille de 
    onLayout : PropTypes.func,
    ///si useCurrentMedia est à true, alors la mise à jour sera opérée uniquement lorsque le current media change
}

const pointerEventsStyles = StyleSheet.create({
    auto : {
        pointerEvents : "auto",
    },
    none : {
        pointerEvents : "none",
    },
    "box-none" : {
        pointerEvents : "box-none",
    },
})

/*** met à jour dynamiquemnet les propriétés style d'un objet en fonction du changement de la taille de l'objet
 * @param {useCurrentMedia} {boolean} si true, alors les propriétés sont mis à jour uniquement si le current media change
   @param {mediaQueryUpdateStyle}, la fonction permettant d'obtenir les propriétés css du composant à retourner
   @return {object}, le flatten style des propriétés css associés aux props du composant react l'object
 */
   export function useMediaQueryUpdateStyle({useCurrentMedia,target,mediaQueryUpdateStyle,...props}){
    if(typeof mediaQueryUpdateStyle !=='function') return props.style;
    const dimensions = useWindowDimensions();
    const handleProps = dimensions && useCurrentMedia === true ? Dimensions.getCurrentMedia() : dimensions;
    return useStableMemo(()=>{
        const args = Dimensions.getDimensionsProps();
        args.props = props,
        args.target = target;
        const nStyle = mediaQueryUpdateStyle(args);
        if(isObj(nStyle) || Array.isArray(nStyle)) return StyleSheet.flatten([props.style,nStyle]);
        return StyleSheet.flatten(props.style)||{};
    },[handleProps,useCurrentMedia,dimensions,props.style]);
}