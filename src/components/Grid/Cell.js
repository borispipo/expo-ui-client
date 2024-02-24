'use strict';

import React from '$react';
import {Pressable, StyleSheet} from 'react-native';
import Dimensions from "$cplatform/dimensions";
import View from "$components/View";
import {defaultStr,isObj} from "$cutils";
import PropTypes from "prop-types";
import {medias} from "$theme/grid";
import theme from "$theme";
import {Elevations} from "$components/Surface";

export const totalSize = 12;

export const defaultMobileSize = 12;

export const defaultTabletSize = 6;

export const defaultDesktopSize = 4;

const isV = x=> typeof x =='number' && x && x <= totalSize ? true : false;
export const getSizeStyle = (props)=>{
    let {size,smallPhoneSize,paddingMultiplicator,phoneSize,marginMultiplicator,mobileSize,tabletSize,gutter,desktopSize
        ,smallPhoneGutter,phoneGutter,mobileGutter,tabletGutter,desktopGutter,
    } = defaultObj(props);
    gutter = gutter === false ? 0 : typeof gutter =='number'? gutter : undefined;
    let hasFound = false;
    const isValidSmallSize = isV(smallPhoneSize),
    isValidPhoneSize = isV(phoneSize),
    isValidMobileSize = isV(mobileSize),
    isValidTabletSize = isV(tabletSize),
    isValidDesktopSize = isV(desktopSize);
    if(Dimensions.isSmallPhoneMedia() && isValidSmallSize){
        size =  smallPhoneSize;
        if(smallPhoneGutter !== undefined){gutter = smallPhoneGutter;}
        gutter = gutter !== undefined ? gutter : medias.sp;
        hasFound = true;
    } 
    if(!hasFound && Dimensions.isPhoneMedia() && isValidPhoneSize){
        size = phoneSize;
        if(phoneGutter !== undefined){gutter = phoneGutter;}
        gutter = gutter !== undefined ? gutter : medias.mp;
        hasFound = true;
    }
    if(!hasFound && Dimensions.isMobileMedia()){
        size = isValidMobileSize? mobileSize : size || defaultMobileSize;
        if(mobileGutter !== undefined) gutter = mobileGutter;
        gutter = gutter !== undefined ? gutter : medias.xs;
        hasFound = true;
    } 
    if(!hasFound && Dimensions.isTabletMedia()){
        size = isValidTabletSize ? tabletSize : size || defaultTabletSize;
        if(tabletGutter !== undefined) gutter = tabletGutter;
        gutter = gutter !== undefined ? gutter : medias.sm;
        hasFound = true;
    } else if(!hasFound){
        size = isValidDesktopSize ? desktopSize : size || defaultDesktopSize;
        if(desktopGutter !== undefined) gutter = desktopGutter;
        gutter = gutter !== undefined ? gutter : medias.md;
    }
    if(!isV(size)){
        size = totalSize;
    }
    if(!gutter){
        gutter = 0;
    }
    paddingMultiplicator = typeof paddingMultiplicator =='number'? paddingMultiplicator : 1.8;
    marginMultiplicator = typeof marginMultiplicator =="number"? marginMultiplicator : 0;
    return {paddingRight:gutter*paddingMultiplicator,marginVertical:gutter,width : (((size)/totalSize)*100)+"%"}
}

const GridCellComponent = React.forwardRef((p,ref)=>{
    const {style,size,children,phoneSize,withSurface,elevation:cElev,mediaQueryUpdateStyle,contentProps:cProps,tabletSize,desktopSize,smallPhoneSize,onPress,activeOpacity,onLongPress,flex:customFlex,onPressIn,onPressOut,...props} = p;
    const testID = defaultStr(props.testID,"RN_Grid.CellComponent");
    const contentProps = defaultObj(cProps);
    const C = onPress || onLongPress || onPressIn || onPressOut ? Pressable : View;
    const elevation = typeof elevation == "number"? elevation : withSurface ? 5 : undefined;
    const elevStyle = typeof elevation =="number" ? Elevations[elevation] || null : null;
    return <View 
        {...props}
        testID={testID} 
        mediaQueryUpdateStyle = {(args)=>{
            const style2 = getSizeStyle(p);
            const style = typeof mediaQueryUpdateStyle =='function' && mediaQueryUpdateStyle(args) || undefined;
            if(isObj(style) || Array.isArray(style)){
                return StyleSheet.flatten([style2,styles]);
            }
            return style2;
        }}
        ref={ref} 
        style = {[styles.container,customFlex !== undefined && {flex:customFlex},style]}
    >
        <C testID={testID+"_Content"}  activeOpacity={activeOpacity}  {...contentProps}
             
            onLongPress={onLongPress} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}
                style = {[styles.content,withSurface && {backgroundColor:theme.colors.surface},contentProps.style,elevStyle]}
                children = {children}
            />
    </View>
});

GridCellComponent.displayName = "Grid.Col";
GridCellComponent.propTypes = {
    flex : PropTypes.number,
    size : PropTypes.number,
    smallPhoneSize : PropTypes.number,
    phoneSize : PropTypes.number,
    tabletSize : PropTypes.number,
    desktopSize : PropTypes.number,
    gutter : PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number,
    ]),
    withSurface : PropTypes.bool,
    elevation : PropTypes.number,
    contentProps : PropTypes.object,
}
const styles = StyleSheet.create({
    container : {
        flexDirection:  'column',
        justifyContent : 'flex-start',
        alignItems : 'flex-start',
    },
    content : {
        width : '100%'
    }
});

export default GridCellComponent;