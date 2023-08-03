import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    SafeAreaView,
    Alert,
    TouchableOpacity,
} from "react-native";

// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

const SignInScreen = ({ navigation, route }) => {
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

            navigation.navigate("Home", { screen: "MyCar" });
            //cleanup the state variable
            setUsernameFromUI("")
            setPasswordFromUI("")
        } catch (err) {
            console.log(err);
            Alert.alert(`Error! Wrong email or password`);
        }
    };

    const gotoHome = () => {
        navigation.navigate("Home", { screen: "RentOutForm" });
    };

    return (
        // <SafeAreaView style={styles.container}>

        //     <TextInput
        //         style={[styles.tb, {marginTop: 30}]}
        //         placeholder="Enter your email"
        //         textContentType="emailAddress"
        //         autoCapitalize="none"
        //         value={usernameFromUI}
        //         onChangeText={setUsernameFromUI}
        //     />
        //     <TextInput
        //         style={styles.tb}
        //         placeholder="Enter your password"
        //         secureTextEntry={true}
        //         autoCapitalize="none"
        //         value={passwordFromUI}
        //         onChangeText={setPasswordFromUI}
        //     />

        //     <Pressable style={styles.btn} onPress={onLoginClicked}>
        //         <Text style={styles.btnLabel}>
        //             Login
        //         </Text>
        //     </Pressable>
        // </SafeAreaView>
        <SafeAreaView style={styles.container}>
            <Text style={styles.logo}>Group 6 Car Inc.</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    value={usernameFromUI}
                    onChangeText={setUsernameFromUI}
                />
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    secureTextEntry={true}
                    autoCapitalize="none"
                    value={passwordFromUI}
                    onChangeText={setPasswordFromUI}
                />
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={onLoginClicked}>
                <Text style={styles.btnLabel}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.signUpText}>
                Don't have an account? Sign up
            </Text>
        </SafeAreaView>
    );
};

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: "#fff",
//         padding: 20,
//         paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
//         alignItems: "center",
//     },
//     btn: {
//         borderWidth: 1,
//         borderColor: "black",
//         borderRadius: 10,
//         paddingVertical: 15,
//         marginVertical: 10,
//         marginHorizontal: 10,
//         width: "95%",
//     },
//     btnLabel: {
//         fontSize: 16,
//         textAlign: "center",
//     },
//     tb: {
//         width: "95%",
//         borderRadius: 5,
//         backgroundColor: "#efefef",
//         color: "#333",
//         fontWeight: "bold",
//         paddingHorizontal: 10,
//         paddingVertical: 15,
//         marginVertical: 10,
//     },
//     formLabel: {
//         fontSize: 16,
//     },
//     headerText: {
//         fontSize: 20,
//         fontWeight: "bold",
//         marginVertical: 10,
//     },
// });

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f0f0f0',
      padding: 20,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
    },
    inputContainer: {
      width: '100%',
      marginBottom: 20,
      alignItems: 'center'
    },
    input: {
      width: '90%',
      borderRadius: 5,
      backgroundColor: '#fff',
      color: '#333',
      fontWeight: 'bold',
      paddingHorizontal: 15,
      paddingVertical: 15,
    },
    loginBtn: {
      width: '90%',
      borderRadius: 10,
      backgroundColor: '#007bff',
      paddingVertical: 15,
      alignItems: 'center',
    },
    btnLabel: {
      fontSize: 16,
      color: '#fff',
    },
    signUpText: {
      marginTop: 20,
      fontSize: 16,
      color: '#555',
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
