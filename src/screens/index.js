import {defaultStr} from "$cutils";
import {sanitizeName} from "$cnavigation";
import Stack from "../navigation/Stack";
import Home from "./Home";
import Sites from "./Sites";

const screens = [];
[Home,Sites].map((Screen)=>{
    const screenName = defaultStr(Screen?.screenName,Screen?.name);
    if(screenName){
        const name = sanitizeName(screenName);
        screens.push(<Stack.Screen key={name} name={name} component={Screen} />)
    }
});
export default screens;