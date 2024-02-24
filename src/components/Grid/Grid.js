import React from  '$react';
import {Pressable,StyleSheet} from 'react-native';
import {grid} from "$theme";
import {defaultStr} from "$cutils";
import PropTypes from "prop-types";
import { StyleProp } from '$theme';
import View from "$components/View";

const GridComponent = React.forwardRef(({onPress,responsive,activeOpacity,onLongPress,flexGrow,flex:customFlex,style,onPressIn,col,onPressOut,...props},ref)=>{
    const testID = defaultStr(props.testID,"RN_GridComponent");
    const flattenedStyle = StyleSheet.flatten(style);
    flexGrow = typeof flexGrow =='number'? flexGrow : 0;
    const flex = customFlex !== undefined ? customFlex :   (flattenedStyle && (col && flattenedStyle.width || !col && flattenedStyle.height)) ? undefined : undefined;
    const C = onPress || onLongPress || onPressIn || onPressOut ? Pressable : View;
    return <C {...props} activeOpacity={activeOpacity} onLongPress={onLongPress} onPressIn={onPressIn} onPressOut={onPressOut}
        testID={testID} onPress={onPress}
        style={[styles.container,{flexGrow},col && {flexDirection:'column'},responsive!== false && !col && grid.row(false),style,flex !== undefined && {flex}]} ref={ref}
    />
});

const styles = StyleSheet.create({
    container : {
        flexDirection:  'row'
    }
});

GridComponent.displayName = "GridComponent";
GridComponent.propTypes = {
    col : PropTypes.bool,///si le rendu sera en colonne
    style : StyleProp,
    flexGrow : PropTypes.number,
    responsive : PropTypes.bool,///si le contenu de la grille sera responsive, dans ce cas, ses enfants seront les Cell
}

export default GridComponent;