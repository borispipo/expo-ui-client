import {useApp} from "$src/hooks";
export const useGetThemeColors = ()=>{
    const {theme} = useApp();
    const isDark = theme.dark || theme.isDark || theme.colors.dark ,onPrimary = isDark? theme.colors.onSurface : theme.colors.onPrimary;
    return {
        onPrimary,
        color : onPrimary,
        backgroundColor : isDark? theme.colors.surface : theme.colors.primary
    }
}