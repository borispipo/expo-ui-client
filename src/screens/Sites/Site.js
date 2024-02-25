import AppBar from "$components/AppBar";
import View from "$components/View";
import { siteScreenName } from "./utils";
import {defaultObj,isNonNullString,isValidUrl} from "$cutils";
import { TextInput,Button } from "react-native-paper";
import { StyleSheet } from "react-native";
import {useRef,useState,useEffect} from "$react";
import Surface from "$components/Surface";
import Label from "$components/Label";
import { useApp } from "../../hooks";
import session from "$layouts/Browser/session";
import {navigate} from "$cnavigation";
import { screenName as sitesScreenName } from "./utils";

export default function SiteScreen(props){
    const params = defaultObj(props.route?.params);
    const {theme} = useApp();
    const {navigation} = props;
    const data = defaultObj(params.data);
    const [editingData,setEditingData] = useState(data);
    const isEdit = isNonNullString(data.name);
    useEffect(()=>{
        if(data.name !== editingData.name || data.url !== editingData.url){
            setEditingData(data);
        }
    },[JSON.stringify(data)]);
    const isNameValid = isNonNullString(editingData.name);
    const isUrlValid = editingData.url && isValidUrl(editingData.url);
    return <View>
        <AppBar
            title = {`Application ${isEdit?` | Modifier [${data.name}]` : '| Nouveau'}`}
        />
        <Surface style={[styles.container]}>
            <View style={styles.inputContainer}>
                <TextInput
                    name = "name"
                    defaultValue={editingData.name}
                    error = {!isNameValid}
                    label = "Nom de l'application"
                    disabled = {isEdit}
                    onChangeText = {(text)=>{
                        setEditingData({
                            ...editingData,
                            name : text,
                        })
                    }}
                />
                {!isNameValid ? <Label error>
                    {"Veuillez entrer un nom valide"}
                </Label> : null}
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    name = "url"
                    error ={!isUrlValid}
                    defaultValue={editingData.url}
                    label = "Lien de l'application"
                    onChangeText = {(text)=>{
                        setEditingData({
                            ...editingData,
                            url : text,
                        })
                    }}
                />
                {!isUrlValid? <Label error>
                    {"Veuillez entrer un lien  valide"}
                </Label> : null}
            </View>
            <Button icon={isEdit?"note-edit":"content-save"} style={styles.button} disabled={!isUrlValid||!isNameValid} mode="contained" onPress={(e)=>{
                if(isNonNullString(editingData.name) && isValidUrl(editingData.url)){
                    session.set(editingData.name,editingData);
                    if(typeof navigation?.canGoBack =="function" && navigation?.canGoBack()){
                        navigation.goBack();
                    } else {
                        navigate(sitesScreenName);
                    }
                }
            }}>{isEdit?"Modifier" : "Enregistrer"}</Button>
        </Surface>
    </View>
}

const styles = StyleSheet.create({
    container : {
        padding : 10,
    },
    inputContainer : {
        marginBottom : 10,
    },
    button : {
        marginTop : 10,
    }
})

SiteScreen.screenName = siteScreenName;