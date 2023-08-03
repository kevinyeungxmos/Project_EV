import { useState, useEffect, useCallback } from "react";
import {
    RefreshControl,
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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, setDoc, getDocs, onSnapshot } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { onLogoutClicked } from "./SignInScreen";

let unsub;

const MyCar = ({ navigation }) => {
    const [carList, setCarList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [resub, setResub] = useState(0);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getDataFromDB();
        setTimeout(() => {
            setRefreshing(false);
        }, 200);
    }, []);

    const getDataFromDB = async () => {
        setCarList((cl) => []);
        console.log("updated car list");
        try {
            const querySnapshot = await getDocs(
                collection(db, `OwnerProfiles/${auth.currentUser.uid}/Listing`)
            );
            querySnapshot.forEach((doc) => {
                console.log(doc.id);
                const itemToAdd = {
                    id: doc.id,
                    ...doc.data(),
                };
                setCarList((cl) => [...cl, itemToAdd]);
            });
        } catch (err) {
            console.log(err);
        }
    };

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
                        setCarList((newVic) => [...newVic, carChanged]);
                    }
                    if (change.type === "modified") {
                        console.log("Modified ", change.doc.id);
                        setCarList(carList.filter((a) => a.id != change.doc.id));
                        setCarList((newVic) => [...newVic, carChanged])
                        setResub(resub+1)
                    }
                    if (change.type === "removed") {
                        console.log("Removed ", change.doc.id);
                        setCarList(carList.filter((a) => a.id !== change.doc.id));
                        setResub(resub+1)
                    }
                });
            }
        );
        
        return () => {
            console.log("unmounted");
            setCarList((a)=>[])
            unsub();
        };
    }, [resub]);


    const onListPress = (index) => {
        navigation.navigate("CarInfo", {
            cardata: carList[index],
        });
    };

    navigation.setOptions({
        headerLeft: () => (
            <Pressable onPress={navigation.goBack}>
                <Icon
                    name="angle-left"
                    size={32}
                    color="white"
                    style={{ marginLeft: 10, borderWidth: 1 }}
                />
            </Pressable>
        ),
        title: "My Car",
        headerRight: () => (
            <Pressable onPress={() => {
                onLogoutClicked();
                navigation.popToTop();
            }}>
                <Icon
                    name="sign-out"
                    size={32}
                    color="white"
                    style={{ marginRight: 10, borderWidth: 1 }}
                />
            </Pressable>
        ),
    });
    return (
        <SafeAreaView>
            <FlatList
            onRefresh={onRefresh}
            refreshing={refreshing}
                style={{ marginLeft: 10 }}
                data={carList}
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
                                onListPress(index);
                            }}
                        >
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
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
                                </View>
                            </View>
                        </Pressable>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default MyCar;
