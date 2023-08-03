import { useState, useEffect } from "react";
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
import { auth, storage } from "../firebaseConfig";
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
    getDoc,
    query,
    where,
} from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { onLogoutClicked } from "./SignInScreen";

let unsub;

const ManageBooking = ({ route, navigation }) => {
    const { carReserved } = route.params;
    const [waiting, setWaiting] = useState([]);
    const [name, setName] = useState("N/A");
    const [icon, setIcon] = useState({});

    const nn = () => {
        console.log(carReserved);
    };

    const getIcon = async (userID, index) => {
        const urlIcon = await getDownloadURL(ref(storage, `${userID}/${userID}.png`))
        console.log(urlIcon)
        icon[userID] = urlIcon
        console.log(icon)
    };

    useEffect(() => {
        unsub = onSnapshot(
            doc(
                db,
                `OwnerProfiles/${auth.currentUser.uid}/Listing`,
                `${carReserved.id}`
            ),
            (snapshot) => {
                if (snapshot.data().status == "Approved") {
                    setName(snapshot.data().renter.name);
                }
                const allData = snapshot.data();
                snapshot.data().waitingList.map((item, index) => {
                    getIcon(item.id, index);
                });
                setWaiting(snapshot.data());
            }
        );

        return () => {
            console.log("unmounted");
            unsub();
        };
    }, []);

    navigation.setOptions({
        headerLeft: () => (
            <Pressable onPress={navigation.goBack}>
                <Icon
                    name="angle-left"
                    size={32}
                    color="white"
                    style={{ marginLeft: 10, }}
                />
            </Pressable>
        ),
        title: `${carReserved.brand} ${carReserved.model} ${carReserved.trim}`,
        headerRight: () => (
            <Pressable
                onPress={() => {
                    // onLogoutClicked();
                    // navigation.popToTop();
                    console.log(icon)
                }}
            >
                <Icon
                    name="sign-out"
                    size={32}
                    color="white"
                    style={{ marginRight: 10, }}
                />
            </Pressable>
        ),
    });

    const onApprove = async (name, id, index) => {
        const newList = carReserved.waitingList;
        newList[index].confirmationCode = Math.floor(Math.random() * 1000000);

        if (waiting.status != "Approved") {
            // update status
            const updateDocRef = doc(
                db,
                `OwnerProfiles/${auth.currentUser.uid}/Listing`,
                `${carReserved.id}`
            );
            await updateDoc(updateDocRef, {
                status: "Approved",
                renter: {
                    name: name,
                    id: id,
                },
                waitingList: newList,
            });
            console.log("user id => ", id);
            console.log("car id  => ", carReserved.id);
            const updateUserRef = query(
                collection(db, `UserProfiles/${id}/Reserved`),
                where("CarID", "==", carReserved.id)
            );

            const querysnapshot = await getDocs(updateUserRef);
            let docID;
            querysnapshot.forEach((doc) => {
                console.log(doc.id);
                docID = doc.id;
            });

            const udd = doc(db, `UserProfiles/${id}/Reserved`, docID);
            await updateDoc(udd, {
                confirmationCode: newList[index].confirmationCode,
                status: "confirmed",
            });
        } else {
            Alert.alert("Error", "Already rented out");
        }
    };

    const onDecline = async (name, id, index) => {
        const newList = carReserved.waitingList;
        newList[index].confirmationCode = "declined";

        const updateDocRef = doc(
            db,
            `OwnerProfiles/${auth.currentUser.uid}/Listing`,
            `${carReserved.id}`
        );
        await updateDoc(updateDocRef, {
            waitingList: newList,
        });

        const updateUserRef = query(
            collection(db, `UserProfiles/${id}/Reserved`),
            where("CarID", "==", carReserved.id)
        );

        const querysnapshot = await getDocs(updateUserRef);
        let docID;
        querysnapshot.forEach((doc) => {
            console.log(doc.id);
            docID = doc.id;
        });

        const udd = doc(db, `UserProfiles/${id}/Reserved`, docID);
        await updateDoc(udd, {
            status: "declined",
        });

        Alert.alert("Message", `You declined ${name} request`);
    };

    return (
        <SafeAreaView>
            <View style={{ alignItems: "center" }}>
                <Image
                    source={{
                        uri: carReserved.photos[0].photoURL,
                    }}
                    style={{
                        height: 300,
                        width: 320,
                    }}
                />
                <View>
                    <Text>License Plate: {carReserved.licensePlate}</Text>
                    <Text>Car status: {waiting.status}</Text>
                    <Text>Price: ${carReserved.price}</Text>
                    <Text>Renter: {name}</Text>
                </View>
                <Text
                    style={{
                        fontWeight: "bold",
                        fontSize: 20,
                    }}
                >
                    Who gonna rent your vehicle?
                </Text>
            </View>
            <FlatList
                style={{ marginLeft: 10 }}
                data={waiting.waitingList}
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
                        <View
                            style={{
                                alignItems: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontWeight: "bold",
                                    fontSize: 18,
                                    marginTop: 10,
                                }}
                            >
                                {item.name} 
                            </Text>

                            <View style={{ flex: 1, flexDirection: "row", padding: 5 }}>
                                <Image
                                    source={{
                                        uri: icon[`${item.id}`],
                                    }}
                                    style={{
                                        height: 30,
                                        width: 30,
                                        marginRight:10,
                                    }}
                                />
                                <View style={{  }}>
                                    <Text>Booking Date: <Text style={{fontWeight:"bold"}}>{item.date}</Text></Text>
                                    <Text>
                                        Comfirmation Code:{" "}
                                        <Text style={{fontWeight:"bold"}}>{item.confirmationCode}</Text>
                                    </Text>
                                </View>
                            </View>

                            {item.confirmationCode != "" ? (
                                item.confirmationCode == "declined" ? (
                                    <Text style={{color:"red"}}>
                                        <Text style={{fontWeight:"bold"}}>{item.name}'s</Text> request has been declined
                                    </Text>
                                ) : (
                                    <Text>
                                        <Text style={{fontWeight:"bold"}}>{item.name}</Text> is renting your vehicle
                                    </Text>
                                )
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        flexDirection: "row",
                                        justifyContent: "space-evenly",
                                    }}
                                >
                                    <Pressable
                                        style={{
                                            width: "40%",
                                            borderWidth: 1,
                                            borderColor: "black",
                                            borderRadius: 5,
                                            paddingVertical: 15,
                                            marginVertical: 10,
                                            marginHorizontal: 10,
                                            backgroundColor: "green",
                                        }}
                                        onPress={() => {
                                            console.log("clicked");
                                            onApprove(
                                                item.name,
                                                item.id,
                                                index
                                            );
                                        }}
                                    >
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: "white",
                                            }}
                                        >
                                            Approve
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={{
                                            width: "40%",
                                            borderWidth: 1,
                                            borderColor: "black",
                                            borderRadius: 5,
                                            paddingVertical: 15,
                                            marginVertical: 10,
                                            marginHorizontal: 10,
                                            backgroundColor: "red",
                                        }}
                                        onPress={() => {
                                            onDecline(
                                                item.name,
                                                item.id,
                                                index
                                            );
                                        }}
                                    >
                                        <Text
                                            style={{
                                                textAlign: "center",
                                                color: "white",
                                            }}
                                        >
                                            Decline
                                        </Text>
                                    </Pressable>
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </SafeAreaView>
    );
};

export default ManageBooking;
