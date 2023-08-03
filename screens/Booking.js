import { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    SafeAreaView,
    ScrollView,
    Alert,
    FlatList,
    Image,
    Dimensions,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
    collection,
    addDoc,
    setDoc,
    getDocs,
    updateDoc,
    doc,
    deleteDoc,
    onSnapshot,
} from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { onLogoutClicked } from "./SignInScreen";

let unsub;

const Booking = ({navigation, route}) => {
    const [car, setCar] = useState([]);
    const [resub, setResub] = useState(0);

    navigation.setOptions({
        headerLeft: () => (
            <Pressable onPress={navigation.goBack}>
                <Icon
                    name="angle-left"
                    size={32}
                    color="white"
                    style={{ marginLeft: 10 }}
                />
            </Pressable>
        ),
        headerRight: () => (
            <Pressable onPress={() => {
                onLogoutClicked();
                navigation.popToTop();
            }}>
                <Icon
                    name="sign-out"
                    size={32}
                    color="white"
                    style={{ marginRight: 10}}
                />
            </Pressable>
        ),
    });

    useEffect(() => {
        unsub = onSnapshot(
            collection(db, `OwnerProfiles/${auth.currentUser.uid}/Listing`),
            (snapshot) => {
                console.log("active");
                snapshot.docChanges().forEach((change) => {
                    const carChanged = change.doc.data();
                    carChanged.id = change.doc.id;
                    if (change.type === "added") {
                        console.log("New ", change.doc.id);
                        setCar((newVic) => [...newVic, carChanged]);
                    }
                    if (change.type === "modified") {
                        console.log("Modified ", change.doc.id);
                        setCar(car.filter((a) => a.id != change.doc.id));
                        setCar((newVic) => [...newVic, carChanged])
                        setResub(resub+1)
                    }
                    if (change.type === "removed") {
                        console.log("Removed ", change.doc.id);
                        setCar(car.filter((a) => a.id !== change.doc.id));
                        setResub(resub+1)
                    }
                });
            }
        );
        
        return () => {
            console.log("unmounted");
            setCar((a)=>[])
            unsub();
        };
    }, [resub]);

    const gotoManageBooking = (index) => {
        navigation.navigate("ManageBooking", {
            carReserved: car[index],
        });
    }

    return (
        <SafeAreaView>
            <FlatList
                style={{ marginLeft: 10 }}
                data={car}
                ItemSeparatorComponent={() => {
                    return (
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: "black",
                                marginRight: 10,
                            }}
                        />
                    );
                }}
                renderItem={({ item, index }) => {
                    // describe the UI for each row
                    // inside this function
                    return (
                        <Pressable
                            onPress={() => {
                                gotoManageBooking(index)
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingTop: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        fontSize: 18,
                                    }}
                                >
                                    {" "}
                                    {index + 1}{" "}
                                </Text>
                                <Image
                                    source={{
                                        uri: item.photos[0].photoURL,
                                    }}
                                    style={{
                                        height: 75,
                                        width: 75,
                                        marginLeft: 10,
                                    }}
                                />
                                <View style={{ marginLeft: 10, paddingRight: 110 }}>
                                    <Text
                                        style={{
                                            fontWeight: "bold",
                                            fontSize: 18,
                                        }}
                                    >
                                        {item.brand} {item.model} {item.trim}
                                    </Text>
                                    <Text>status: {item.status}</Text>
                                    <Text>
                                        License Plate: {item.licensePlate}
                                    </Text>
                                    <Text>Price: ${item.price}</Text>
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default Booking;
