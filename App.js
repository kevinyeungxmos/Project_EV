import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, LogBox } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";

import SignInScreen from "./screens/SignInScreen";
import RentOutForm from "./screens/RentOutForm";
import Home from "./screens/Home";
import MyCar from "./screens/MyCar";
import CarInfo from "./screens/carInfo";
import Booking from "./screens/Booking";
import ManageBooking from "./screens/ManageBooking";

LogBox.ignoreAllLogs();

//to obtain instance of navigation stack
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
    return (

        <NavigationContainer>
            <Stack.Navigator initialRouteName="SignIn">
                <Stack.Screen
                    component={SignInScreen}
                    name="SignIn"
                    options={styles.header}
                ></Stack.Screen>
                <Stack.Screen
                    component={RentOutForm}
                    name="RentOutForm"
                    options={styles.header}
                ></Stack.Screen>
                <Stack.Screen
                    component={MyCar}
                    name="MyCar"
                    options={styles.header}
                ></Stack.Screen>
                <Stack.Screen
                    component={Home}
                    name="Home"
                    options={{ headerShown:  false}}
                ></Stack.Screen>
                <Stack.Screen
                    component={CarInfo}
                    name="CarInfo"
                    options={styles.header}
                ></Stack.Screen>
                <Stack.Screen
                    component={Booking}
                    name="Booking"
                    options={styles.header}
                ></Stack.Screen>
                <Stack.Screen
                    component={ManageBooking}
                    name="ManageBooking"
                    options={styles.header}
                ></Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    header: {
        headerStyle: { backgroundColor: "skyblue" },
        headerTintColor: "#fff",
    },
});
