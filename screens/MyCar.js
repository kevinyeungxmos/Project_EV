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
import { collection, addDoc, setDoc, getDocs } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";

const MyCar = ({ navigation }) => {
    const [carList, setCarList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        getDataFromDB();
        setTimeout(() => {
            setRefreshing(false);
        }, 200);
    }, []);

    const getDataFromDB = async () => {
        setCarList((cl) => []);
        console.log("updated car list")
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
        getDataFromDB();
    }, []);

    // const hh = () => {
    //     carList.map((item) => {
    //         console.log(item.brand);
    //     });
    // };

    // const hs = (data) => {
    //     console.log(data);
    // };

    const onListPress = (index) => {
        console.log(index);
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
    });
    return (
        <SafeAreaView>

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                <FlatList
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
                                    <View style={{ marginLeft: 20 }}>
                                        <Text
                                            style={{
                                                fontWeight: "bold",
                                                fontSize: 18,
                                            }}
                                        >
                                            {item.brand} {item.model}{" "}
                                            {item.trim}
                                        </Text>
                                        <Text>status: {item.status}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        );
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    );
};

export default MyCar;
