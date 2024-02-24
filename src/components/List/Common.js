
import React from "$react";
import { prepareItems as customPrepareItems,getBToTopRef } from "./utils";
import {grid,StylePropTypes} from "$theme";
import PropTypes from "prop-types";
import {defaultObj,defaultStr,extendObj,isObj,defaultDecimal,defaultArray,defaultFunc} from "$cutils";
import {isMobileMedia} from "$cplatform/dimensions";
import {FlatList,StyleSheet,View} from "react-native";
import Label from "$components/Label";
import { useList,useGetNumColumns } from "./hooks";

const CommonListComponent = React.forwardRef((props,ref)=>{
    const context = useList(props);
    let {testID,isBigList,defaultItemHeight,itemHeight,onRender,componentProps,columnWrapperStyle,onViewableItemsChanged,withFlatListItem,Component,withBackToTop,backToTopRef:customBackToTopRef,withBackToTopButton,onScroll,onScrollEnd,onMount,onUnmount,renderScrollViewWrapper,prepareItems,getItemKey,getKey,keyExtractor,items,filter,renderItem,numColumns,containerProps,bindResizeEvents,...rest} = props;
    withBackToTopButton = withBackToTop === true || withBackToTopButton == true || isMobileMedia()? true : false;
    rest = defaultObj(rest);
    containerProps = defaultObj(containerProps);
    const {itemWindowWidth} = useGetNumColumns(props);  
    let scrollEndTimeout = React.useRef(null);
    const listRef = React.useRef(null);
    const hasCustomBackToTop = typeof customBackToTopRef == 'function'? true : false;
    const backToTopRef = React.useRef(null);
    const isFlatList = Component === FlatList;
    defaultStr(props.testID,"RN_CommonListComponent");
    extendObj(context,{
        getKey : typeof keyExtractor =='function'? keyExtractor : typeof getItemKey =='function'? getItemKey : typeof getKey =='function'? getKey : undefined,
        addItemsRefs : function(ref, itemRef){
            context.itemsRefs[itemRef.index] = {
              ref,
              item: itemRef.item,
              index: itemRef.index,
            }
        },
        renderItem : function({item,index,section,...rest}){
            rest = rest ? rest : {};
            if(isObj(item) && item.isSectionListHeader){
                rest.isSectionListHeader = true;
            }
            let ret = renderItem({item,numColumns,index,section,numColumns,itemContainerWidth:itemWindowWidth,itemWindowWidth,...rest,isScrolling:listRef.current?.isScrolling?true:false,items:defaultArray(context.items)});
            if(typeof ret =='string' || typeof ret =='number'){
                return <Label testID={testID+"_ListItemLabel"} children = {ret}/>
            } 
            return (React.isValidElement(ret)) ? ret : null; 
        },
        /*** @params : {animated?: ?boolean,index: number,viewOffset?: number,viewPosition?: number,} */
        scrollToIndex : function(params) {
            if (listRef.current && typeof listRef.current.scrollToIndex =='function') {
              listRef.current.scrollToIndex(params);
            }
        },
        scrollToTop : function(params){
            return context.scrollToIndex({animated:true,...defaultObj(params),index:0});
        },
        /** params?: ?{animated?: ?boolean} */
        scrollToEnd : function(params) {
            if (listRef.current && listRef.current.scrollToEnd) {
              listRef.current.scrollToEnd(params);
            }
        },
        /*** @params : {animated?: ?boolean,item: ItemT,viewPosition?: number} */
        scrollToItem : function(params) {
            if (listRef.current) {
              listRef.current.scrollToItem(params);
            }
        },
        /*** @params : {animated?: ?boolean, offset: number} */
        scrollToOffset : function(params) {
            if (listRef.current) {
                listRef.current.scrollToOffset(params);
            }
        },
        handleOnScroll : (event)=>{
            if(customBackToTopRef === false) {
                if(onScroll){
                    onScroll(event);
                }
                return;
            }
            const bToTopRef = getBToTopRef(hasCustomBackToTop ? customBackToTopRef() : backToTopRef);
            if (withBackToTopButton && bToTopRef) {
                bToTopRef.toggleVisibility(event);
            }
            if(listRef.current){
                listRef.current.isScrolling = true;
                context.isScrolling = true;
            }
            clearTimeout(scrollEndTimeout.current);
            scrollEndTimeout.current = setTimeout(()=>{
                if(listRef.current){
                    listRef.current.isScrolling = false;
                    context.isScrolling = false;
                }
                clearTimeout(scrollEndTimeout.current);
                if(onScrollEnd){
                    onScrollEnd(event);
                }
            },1000);
            if(onScroll){
                onScroll(event);
            }
        },
        onScroll : function(event){
            context.handleOnScroll(event);
        },
        keyExtractor : function(item,index){
            if(context.getKey){
                return context.getKey(item,index);
            }
            return React.key(item,index);
        },
        itemHeight : typeof itemHeight =='number' && itemHeight ? itemHeight : function(section,index){
            if(typeof index ==='undefined') return 0;
            if(!Array.isArray(context.items)){
                context.items = [];
            }
            if(typeof itemHeight ==='function'){
                return itemHeight({section,numColumns,itemContainerWidth:itemWindowWidth,itemWindowWidth,index,context,item:context.items[index],items:context.items});
            }
            return defaultItemHeight
        },
        onBackActionPress : !hasCustomBackToTop ? function(){
            return context?.scrollToTop()
        }: undefined,
    })
    
    context.listRef = listRef.current;
    
    React.useOnRender(onRender,Math.max(items.length/10 || 0,500));
    React.setRef(ref,context);
    React.useEffect(()=>{
        React.setRef(ref,context);
        if(typeof onMount =='function'){
            onMount(context);
        }
        return ()=>{
            React.setRef(ref,null);
            if(typeof onUnmount ==='function'){
                onUnmount();
            }
        }
    },[]);
    const restP = numColumns > 1 && isFlatList ? {
        columnWrapperStyle : [styles.columnWrapperStyle,props.columnWrapperStyle]
    } : {};
    const itemsLength = context.items?.length;
    const isNotVirtual = false && isBigList && itemsLength <=10;
    return <View testID={testID+"_CommonListContainer"} {...containerProps} style={[styles.container,containerProps.style]}>
        {!isNotVirtual ? <Component
            onEndReachedThreshold={0}
            scrollEventThrottle={16}
            {...rest}
            {...restP}
            testID = {testID}
            ref = {listRef}
            onScroll={context.onScroll}
            data = {context.items}
            numColumns={numColumns}
            keyExtractor = {context.keyExtractor}
            renderItem = {context.renderItem}
            itemHeight = {itemHeight === false ? undefined : context.itemHeight}
            onViewableItemsChanged={onViewableItemsChanged}
            {...defaultObj(componentProps)}
        /> : context.items.map((item,index)=>{
            const key = context.keyExtractor(item,index);
            return <View key={key} testID={`${testID}_RN_RealBigList_${index}_${key}`} style={[styles.realListItem]}>
                {context.renderItem({item,index})}
            </View> 
        })}
    </View>
})


CommonListComponent.propTypes = {
    onViewableItemsChanged : PropTypes.func,
    ...defaultObj(FlatList.propTypes),
    defaultItemHeight : PropTypes.number,///la valeur de la hauteur des items par défaut
    backToTopRef : PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.bool,
    ]),
    Component : PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node,
        PropTypes.elementType
    ]),
    withBackToTopButton : PropTypes.bool,
    withBackToTop : PropTypes.bool,
    onScroll : PropTypes.func,
    onScrollEnd : PropTypes.func,
    /**** les props de la scrollView, qui wrapp le composant ScrollView dans le rendu BigList */
    contentContainerStyle: StylePropTypes,
    prepareItems : PropTypes.oneOfType([
        PropTypes.bool,///si la fonction permettant de faire un travail préparaoire des données de la liste sera appelée
        PropTypes.func,
    ]),
    items : PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]),
    responsive : PropTypes.bool,//si le nombre de columns de la big list sera déterminées dynamiquement
    //si la liste prendra en compte le redimessionnement de la page, ce qui poussera à mettre à jour le nombre de colonnes lorsque la liste est rédimensionnée
    bindResizeEvents : PropTypes.bool, 
    renderItem : PropTypes.func,
    containerProps : PropTypes.object,///les props du container à la big list
    filter : PropTypes.func, //la fonction utilisée pour le filtre des éléments à rendre pour la liste
    onMount : PropTypes.func,
    onUnmount : PropTypes.func,
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      minHeight : 100,
    },
    columnWrapperStyle : {
        flex : 1,
    },
    realListItem : {
        width : "100%",
        paddingVertical : 0,
        paddingHorizontal : 0,
        minHeight : 40,
    },
  });
export default CommonListComponent;

CommonListComponent.displayName = "CommonListComponent";