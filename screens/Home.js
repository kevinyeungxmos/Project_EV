import { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    SafeAreaView,
} from "react-native";

// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import RentOutForm from "./RentOutForm";
import MyCar from "./MyCar";
import Booking from "./Booking";

const Tab = createBottomTabNavigator();

const Home = (route) => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName = "";

                    if (route.name == "RentOutForm") {
                        iconName = "car";
                    }
                    if (route.name == "MyCar") {
                        iconName = "car";
                    }
                    if (route.name == "Booking") {
                        iconName = "list-alt";
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen
                component={RentOutForm}
                name="RentOutForm"
                options={styles.header_form}
            ></Tab.Screen>
            <Tab.Screen
                component={MyCar}
                name="MyCar"
                options={styles.header_mycar}
            ></Tab.Screen>
            <Tab.Screen
                component={Booking}
                name="Booking"
                options={styles.header_booking}
            ></Tab.Screen>
        </Tab.Navigator>
    );
};

export default Home;

const styles = StyleSheet.create({
    header_form: {
        headerStyle: { backgroundColor: "skyblue" },
        headerTintColor: "#fff",
        title: "Car Rent Out",
    },
    header_mycar: {
        headerStyle: { backgroundColor: "skyblue" },
        headerTintColor: "#fff",
        title: "My Car",
    },
    header_booking: {
        headerStyle: { backgroundColor: "skyblue" },
        headerTintColor: "#fff",
        title: "Booking",
    },
});
