import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    SafeAreaView,
    Alert,
} from "react-native";

// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const SignInScreen = ({navigation, route}) => {
    const [usernameFromUI, setUsernameFromUI] = useState("");
    const [passwordFromUI, setPasswordFromUI] = useState("");

    const onLoginClicked = async () => {
        //verify credentials
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                usernameFromUI,
                passwordFromUI
            );
            
            navigation.navigate("Home", {screen: "MyCar"})
        } catch (err) {
            console.log(err);
            Alert.alert(`Error! Wrong email or password`);
        }
    };

    const gotoHome = () => {
        navigation.navigate("Home", {screen: "RentOutForm"})
    }

    return (
        <SafeAreaView style={styles.container}>

            <TextInput
                style={[styles.tb, {marginTop: 30}]}
                placeholder="Enter your email"
                textContentType="emailAddress"
                autoCapitalize="none"
                value={usernameFromUI}
                onChangeText={setUsernameFromUI}
            />
            <TextInput
                style={styles.tb}
                placeholder="Enter your password"
                secureTextEntry={true}
                autoCapitalize="none"
                value={passwordFromUI}
                onChangeText={setPasswordFromUI}
            />

            <Pressable style={styles.btn} onPress={onLoginClicked}>
                <Text style={styles.btnLabel}>
                    Login
                </Text>
            </Pressable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
        alignItems: "center"
    },
    btn: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 10,
        paddingVertical: 15,
        marginVertical: 10,
        marginHorizontal:10,
        width: "95%"
    },
    btnLabel: {
        fontSize: 16,
        textAlign: "center",
    },
    tb: {
        width: "95%",
        borderRadius: 5,
        backgroundColor: "#efefef",
        color: "#333",
        fontWeight: "bold",
        paddingHorizontal: 10,
        paddingVertical: 15,
        marginVertical: 10,
        
    },
    formLabel: {
        fontSize: 16,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 10,
    },
});

export const onLogoutClicked = async () => {
    try {
        // 1. check if a user is currently logged in
        if (auth.currentUser === null) {
            Alert.alert("Sorry, no user is logged in.");
        } else {
            await signOut(auth);
            Alert.alert("Logout complete!");
        }
    } catch (err) {
        console.log(err);
    }
};

export default SignInScreen;
