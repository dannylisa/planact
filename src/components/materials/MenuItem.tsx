import { GlobalState } from "@/modules";
import { DefaultTheme } from "@/style/styled";
import React from "react"
import { TouchableOpacity, TouchableOpacityProps, Text, StyleSheet } from "react-native"
import { useSelector } from "react-redux";

interface MenuItemProps extends TouchableOpacityProps {
    content: string;
}
const MenuItem = (props:MenuItemProps) => {
    const {content, ...others} = props;
    const theme = useSelector(({theme}:GlobalState) => theme);
    const {item, itemText} = styles(theme);
    return (
        <TouchableOpacity style={item} {...others}>
            <Text style={itemText}>
                {props.content}
            </Text>
        </TouchableOpacity>
    )
}

export default MenuItem;

const styles = ({mainBackground, text}:DefaultTheme) => StyleSheet.create({
    item:{
        flexDirection: "row",
        paddingVertical: 24,
        alignItems: "center",
        backgroundColor: mainBackground,
        paddingHorizontal: 18,
    },
    itemText: {
        fontSize: 18,
        color: text,
        fontWeight: "900"
    }
})