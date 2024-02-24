import View from "$components/View";
import List from "$components/List";
import { StyleSheet } from "react-native";
import {screenName} from "./utils";
import session from "$layouts/Browser/session";
import Label from "$components/Label";
import Icon from "$components/Icon";
import AppBar from "$components/AppBar";
import Grid from "$components/Grid";
import { ScrollView } from "react-native";
import theme from "$theme";
import { useMemo } from "react";
import {isNonNullString,isValidUrl,isObj} from "$cutils";
import PreviewUrl from "$components/PreviewUrl";
import Surface from "$components/Surface";
import {HStack} from "$components/Stack";

export default function SitesManager(props){
    const {navigation} = props;
    const sites = session.get();
    const content = useMemo(()=>{
        const content = [];
        Object.map(sites,(site)=>{
            if(!isObj(site) || !isNonNullString(site.name) || !isValidUrl(site.url)) return;
            content.push(<Grid.Cell key = {site.name}>
                <Surface style={[theme.styles.w100]}>
                    {<Label textBold>{site.name}</Label>}
                    <HStack style={[theme.styles.w100]}>
                        <PreviewUrl
                            text={`${site.name}, ${site.url}`}    
                        />
                    </HStack>
                </Surface>
            </Grid.Cell>);
        })
        return content;
    },[sites])
    return <View style={styles.container}>
        <AppBar
            title = {"Mes applications"}
        />
        <View style={[styles.listContainer]}>
            <ScrollView>
                <Grid style={[theme.styles.w100]}>
                    {content}
                </Grid>
            </ScrollView>
        </View>
    </View>
}

SitesManager.screenName = screenName;

const styles = StyleSheet.create({
    container : {
        flex : 1,
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
    }
})