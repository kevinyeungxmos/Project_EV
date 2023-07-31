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
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
// import the auth variable
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";

const RentOutForm = ({ navigation, route }) => {
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [trim, setTrim] = useState("");
    const [photos, updatePhotos] = useState([]);
    const [seat, setSeat] = useState("");
    const [range, setRange] = useState("");
    const [hp, setHp] = useState("100");
    const [licensePlate, setLicensePlate] = useState("");
    const [price, setPrice] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [data, setData] = useState([]);
    const [brandList, setBrandList] = useState([]);
    const [modelList, setModelList] = useState([]);
    const [seatCap, setSeatCap] = useState([]);
    const [lat, setLat] = useState("");
    const [lon, setLon] = useState("");

    const brandmake = [];

    navigation.setOptions({
        headerLeft: () => (
            <Pressable onPress={navigation.goBack}>
                <Icon
                    name="angle-left"
                    size={32}
                    color="white"
                    style={{ marginLeft: 10, borderWidth: 1}}
                />
            </Pressable>
        ),
        title: "Car Rent Out Form",
    });

    const getCurrentLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(`Permission to access location was denied`);
                return;
            }

            let location = await Location.getCurrentPositionAsync();

            Alert.alert(JSON.stringify(location));
            doReverseGeocode(
                location.coords.latitude,
                location.coords.longitude
            );
            setLat(location.coords.latitude);
            setLon(location.coords.longitude);
        } catch (err) {
            console.log(err);
        }
    };

    const doReverseGeocode = async (lat, lon) => {
        try {
            const coords = {
                latitude: lat,
                longitude: lon,
            };

            // 2. Geocode
            const postalAddresses = await Location.reverseGeocodeAsync(
                coords,
                {}
            );

            const result = postalAddresses[0];

            if (result === undefined) {
                Alert.alert("No results found.");
                return;
            }

            // 4. Extract relevant parts of the location
            setStreet(result.street);
            setCity(result.city);
            setCountry(result.country);
        } catch (err) {
            console.log(err);
        }
    };

    const doForwardGeocode = async (street, city, country) => {
        // 0. On android, permissions must be granted
        // code to ask for permissions goes here

        try {
            // 1. Do forward geocode
            const geocodedLocation = await Location.geocodeAsync(
                `${street}, ${city}, ${country}`
            );

            // 2. Check if a matching location is found
            const result = geocodedLocation[0];
            if (result === undefined) {
                alert("No coordinates found");
                return;
            }

            // 3. If yes, extract relevant data
            console.log(`Latitude: ${result.latitude}`);
            console.log(`Longitude: ${result.longitude}`);
            setLat(result.latitude);
            setLon(result.longitude);
        } catch (err) {
            console.log(err);
        }
    };

    const getVehiclesFromApi = async () => {
        let id = 0;

        try {
            const response = await fetch(
                "https://kevinyeungxmos.github.io/vehicles.json"
            );
            const results = await response.json();
            setData(results);
            results.map((item) => {
                const mk = item["make"];
                //save the results to brandmake
                if (!brandmake.includes(mk)) {
                    brandmake.push(mk);
                }
            });
            //map the brandmake to brandList
            brandmake.map((b) => {
                brandList.push({ make: b, id: String(++id) });
            });
        } catch (err) {
            console.log(err);
        }
    };

    const getCarModel = (brand) => {
        let id = 0;
        setBrand(brand);
        //clear the old model list
        setModelList((ml) => []);
        data.map((item) => {
            // push model to model list
            if (item.make == brand) {
                setModelList((oldModelList) => [
                    ...oldModelList,
                    { id: ++id, model: item.model },
                ]);
            }
        });
    };

    const getCarTrim = (model) => {
        let id = 0;
        let photoID = 0;
        setSeatCap((st) => []);
        updatePhotos((ph) => []);
        data.map((item) => {
            if (item.make == brand && item.model == model) {
                setTrim(item.trim);
                //set the seating capacity
                if (item.seats_min != item.seats_max) {
                    setSeatCap((oldModelList) => [
                        ...oldModelList,
                        { id: id++, seatNo: item.seats_min },
                    ]);
                    setSeatCap((oldModelList) => [
                        ...oldModelList,
                        { id: id++, seatNo: item.seats_max },
                    ]);
                } else {
                    setSeatCap((oldModelList) => [
                        ...oldModelList,
                        { id: id++, seatNo: item.seats_min },
                    ]);
                }
                //set car photos
                item.images.map((ph) => {
                    // console.log(ph.url_full);
                    updatePhotos((oldPhotos) => [
                        ...oldPhotos,
                        { id: photoID++, photoURL: ph.url_full },
                    ]);
                });
                //set range
                setRange(String(item.total_range));
                //set hp
                setHp(String(item.horsepower));
                //set seat
                setSeat(item.seats_min);
            }
        });
        // console.log(trim);
        // console.log(photos);
    };

    const uploadToDB = async () => {
        const dataToAdd = {
            brand: brand,
            model: model,
            trim: trim,
            photos: photos,
            seat: seat,
            range: range,
            hp: hp,
            licensePlate: licensePlate,
            price: price,
            street: street,
            city: city,
            country: country,
            ownerID: auth.currentUser.uid,
            status: "idle",
            waitingList: [],
            renter: {
                name: "",
                id: "",
            },
            lat: lat,
            lon: lon,
        };
        try {
            const carListingCollectionRef = collection(
                db,
                `OwnerProfiles/${auth.currentUser.uid}/Listing`
            );
            const insertDoc = await addDoc(carListingCollectionRef, dataToAdd);
            console.log("Document written with ID: ", insertDoc.id);
    
            const insertDoc2 = await setDoc(doc(db, "carListing", insertDoc.id), {
                ownerID: auth.currentUser.uid,
                docID: insertDoc.id,
            });
         
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getVehiclesFromApi();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.container_scrollview}>
                <Text style={styles.text_title}>Car Brand:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={brandList}
                    search
                    searchPlaceholder="Search"
                    placeholder="Select Car Brand"
                    labelField="make"
                    valueField="id"
                    onChange={(item) => {
                        getCarModel(item.make);
                    }}
                ></Dropdown>
                <Text style={styles.text_title}>Car Model:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={modelList}
                    search
                    searchPlaceholder="Search"
                    placeholder="Select A Model"
                    labelField="model"
                    valueField="id"
                    onChange={(item) => {
                        // console.log(item.model);
                        setModel(item.model);
                        getCarTrim(item.model);
                    }}
                ></Dropdown>
                <Text style={styles.text_title}>Car Trim:</Text>
                <Text style={styles.text}>{trim}</Text>
                <Text style={styles.text_title}>Seating capacity:</Text>
                <Dropdown
                    style={styles.dropdown}
                    data={seatCap}
                    placeholder="Select Seating Capacity"
                    labelField="seatNo"
                    valueField="id"
                    value={seatCap[0]}
                    onChange={(item) => {
                        // console.log(item.seatNo);
                        setSeat(item.seatNo);
                        // getCarTrim(item.model)
                    }}
                ></Dropdown>
                <Text style={styles.text_title}>Car Horse Power:</Text>
                <TextInput
                    style={styles.text}
                    placeholder="Horse Power"
                    autoCapitalize="none"
                    value={hp}
                    onChangeText={setHp}
                    keyboardType="numeric"
                />

                <Text style={styles.text_title}>Car Range in mile:</Text>
                <TextInput
                    style={styles.text}
                    placeholder="Range in Mile"
                    autoCapitalize="none"
                    value={range}
                    onChangeText={setRange}
                    keyboardType="numeric"
                />

                <Text style={styles.text_title}>License plate:</Text>
                <TextInput
                    style={styles.text}
                    placeholder="License plate (example: BLHT281)"
                    autoCapitalize="none"
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                />

                <Text style={styles.text_title}>Rental Price:</Text>
                <TextInput
                    style={styles.text}
                    placeholder="Price per week"
                    keyboardType="numeric"
                    autoCapitalize="none"
                    value={price}
                    onChangeText={setPrice}
                />

                <Text style={styles.text_title}>Pickup location address:</Text>
                <TextInput
                    style={styles.text}
                    placeholder="Street"
                    keyboardType="default"
                    autoCapitalize="none"
                    value={street}
                    onChangeText={setStreet}
                />
                <TextInput
                    style={styles.text}
                    placeholder="City"
                    keyboardType="default"
                    autoCapitalize="none"
                    value={city}
                    onChangeText={setCity}
                />
                <TextInput
                    style={styles.text}
                    placeholder="Country"
                    keyboardType="default"
                    autoCapitalize="none"
                    value={country}
                    onChangeText={setCountry}
                />

                <View style={styles.container_view}>
                    <Pressable
                        style={{
                            width: "40%",
                            borderWidth: 1,
                            borderColor: "black",
                            borderRadius: 5,
                            paddingVertical: 15,
                            marginVertical: 10,
                            marginHorizontal: 10,
                        }}
                    >
                        <Text
                            style={styles.btnLabel}
                            onPress={getCurrentLocation}
                        >
                            Current Address
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
                        }}
                    >
                        <Text
                            style={styles.btnLabel}
                            onPress={() => {
                                doForwardGeocode(street, city, country);
                            }}
                        >
                            Confirm Address
                        </Text>
                    </Pressable>
                </View>

                <Pressable style={styles.btn}>
                    <Text style={styles.btnLabel} onPress={uploadToDB}>
                        Submit
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RentOutForm;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
        padding: 40,
        alignItems: "center",
    },
    container_view: {
        borderColor: "blue",
        borderWidth: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    container_scrollview: {
        borderColor: "black",
        borderWidth: 1,
        width: "90%",
    },
    dropdown: {
        backgroundColor: "white",
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 10,
        borderRadius: 5,
    },
    text: {
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 10,
        textAlign: "center",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 5,
    },
    text_title: {
        fontSize: 18,
        marginTop: 10,
        fontWeight: "600",
    },
    btn: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 5,
        paddingVertical: 15,
        marginVertical: 10,
        marginHorizontal: 10,
        width: "95%",
    },
    btnLabel: {
        fontSize: 16,
        textAlign: "center",
    },
});
