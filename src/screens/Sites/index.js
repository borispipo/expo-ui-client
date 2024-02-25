import View from "$components/View";
import List from "$components/List";
import { StyleSheet,Alert } from "react-native";
import {screenName} from "./utils";
import session,{EVENTS} from "$layouts/Browser/session";
import Label from "$components/Label";
import Icon from "$components/Icon";
import AppBar from "$components/AppBar";
import { useMemo,useState,useEffect } from "react";
import {isNonNullString,isValidUrl,isObj} from "$cutils";
import Surface from "$components/Surface";
import {HStack} from "$components/Stack";
import Fab from "$components/Fab";
import {Portal} from "react-native-paper";
import {useApp} from "$src/hooks";
import Link from "$components/Link";
import appConfig from "$capp/config";
import { Pressable } from "react-native";
import {navigate} from "$cnavigation";
import { siteScreenName} from "./utils";
import APP from "$capp/instance";


export default function SitesManager(props){
    const {theme:appTheme} = useApp();
    const [sites,setSites] = useState(session.get());
    const appName = appConfig.name;
    const items = useMemo(()=>{
        const items = [];
        Object.map(sites,(site)=>{
            if(!isObj(site) || !isNonNullString(site.name) || !isValidUrl(site.url)) return;
            items.push(site);
        })
        return items;
    },[sites]);
    useEffect(()=>{
        const onUpdateSite = ()=>{
            setSites(session.get());
        }
        APP.on(EVENTS.UPDATE_SITE,onUpdateSite);
        return ()=>{
            APP.off(EVENTS.UPDATE_SITE,onUpdateSite);
        }
    },[])
    return <View style={styles.container}>
        <AppBar
            title = {"Mes applications"}
        />
        <View style={[styles.listContainer]}>
            <List
                items = {items}
                renderItem = {({item:site,index})=>{
                    return <View style={[styles.itemContainer]}>
                            <Surface elevation = {5} style={[styles.itemContentContainer]}>
                                <HStack style={[styles.itemContentContainer]}>
                                    <View>
                                        {<Label textBold>{site.name}</Label>}
                                        <Link.Preview
                                            link={`${site.url}`} 
                                            disabled
                                        />
                                    </View>
                                    <HStack style={styles.icons}>
                                        <Icon
                                            name = "check"
                                            size = {30}
                                            onPress = {(e)=>{
                                                session.setActive(site);
                                                return navigate("Home");
                                            }}
                                            style = {styles.icon}
                                            color = {appTheme.colors.success}
                                        />
                                        <Icon
                                            name = "file-edit"
                                            size = {30}
                                            onPress = {(e)=>{
                                                navigate({
                                                    routeName : siteScreenName,
                                                    params : {
                                                        data : site,
                                                    }
                                                })
                                            }}
                                            style = {styles.icon}
                                            
                                            color = {appTheme.colors.primary}
                                        />
                                        {site.name !== appName ? <Icon
                                            name = "delete"
                                            size = {30}
                                            style = {styles.icon}
                                            onPress = {(e)=>{
                                                Alert.alert(`Supprimer [${site.name}]`, `Voulez vous réellement supprimer l'application [${site.name}]?`, [
                                                    {
                                                      text: 'Supprimer',
                                                      onPress: () => {
                                                        session.delete(site.name);
                                                        setSites({...session.get()});
                                                      },
                                                    },
                                                    {
                                                      text: 'Annuller',
                                                      style: 'cancel',
                                                    },
                                                  ]);
                                            }}
                                            color = {appTheme.colors.error}
                                        /> : null}
                                    </HStack>
                                </HStack>
                        </Surface>
                    </View>
                }}
                keyExtractor = {(item,index)=>{
                    return item.name;
                }}
            />
            <Portal>
                <Fab
                    onPress = {(e)=>{
                       navigate(siteScreenName);
                    }}
                    title = {"Nouvelle application"}
                    icon = {"link-plus"}
                    size = {'large'}
                />
            </Portal>
        </View>
    </View>
}

SitesManager.screenName = screenName;

const styles = StyleSheet.create({
    container : {
        flex : 1,
    },
    itemContentContainer : {
        justifyContent : "space-between",
        alignItems : "flex-start",
        //height : 100,
    },
    itemContainer : {
        width : "100%",
        padding : 10,
    },
    itemContentContainer : {
        width : "100%",
        justifyContent : "flex-start",
        alignSelf : "flex-start",
        marginBottom : 20,
        padding : 10,
    },
    appBarContainer : {
        flexDirection :"row",
        justifyContent : "flex-start",
        alignItems : "center",
        minHeight : 40,
    },
    appbarLabel : {
        fontSize : 17,
        fontWeight : "bold",
    },
    listContainer : {
        flex : 1,
        maxWidth : "100%",
    },
    fab : {
    
    },
    icon : {
        margin : 0,
        padding:0,
    }
})