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
    ActivityIndicator,
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
} from "firebase/firestore";
import Icon from "react-native-vector-icons/FontAwesome";
import { db } from "../firebaseConfig";
import { useSafeAreaFrame } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { onLogoutClicked } from "./SignInScreen";


const CarInfo = ({ navigation, route }) => {
    const { cardata } = route.params;
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [trim, setTrim] = useState("");
    const [photos, updatePhotos] = useState([]);
    const [seat, setSeat] = useState("");
    const [range, setRange] = useState("");
    const [hp, setHp] = useState("");
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
    const [loading, setLoading] = useState(false);
    const [confirmAddr, setConfirmAddr] = useState(false);

    const brandmake = [];

    const windowWidth = Dimensions.get("window").width;

    useEffect(() => {
        getVehiclesFromApi();
        // setInfo();
        // getCarModel(cardata.brand);
        // getCarTrim(cardata.model);
    }, []);

    navigation.setOptions({
        headerLeft: () => (
            <Pressable onPress={navigation.goBack}>
                <Icon
                    name="angle-left"
                    size={32}
                    color="white"
                    style={{ marginLeft: 10,}}
                />
            </Pressable>
        ),
        title: `${cardata.brand} ${cardata.model} ${cardata.trim}`,
        headerRight: () => (
            <Pressable
                onPress={() => {
                    onLogoutClicked();
                    navigation.popToTop();
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

    const setInfo = () => {
        setBrand(cardata.brand);
        setModel(cardata.model);
        setTrim(cardata.trim);
        setSeat(String(cardata.seat));
        setLicensePlate(cardata.licensePlate);
        setHp(String(cardata.hp));
        setRange(String(cardata.range));
        setPrice(cardata.price);
        setStreet(cardata.street);
        setCity(cardata.city);
        setCountry(cardata.country);
        setLat(cardata.lat);
        setLon(cardata.lon);
        setSeatCap((a) => [...a]);
    };

    const getCurrentLocation = async () => {
        try {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(`Permission to access location was denied`);
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync();

            // Alert.alert(JSON.stringify(location));
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
                setLoading(false);
                setConfirmAddr(true);
                return;
            }

            // 4. Extract relevant parts of the location
            setStreet(result.street);
            setCity(result.city);
            setCountry(result.country);
            setLoading(false);
            setConfirmAddr(false);
            Alert.alert("Current Address Set");
        } catch (err) {
            console.log(err);
        }
    };

    const doForwardGeocode = async (street, city, country) => {
        // 0. On android, permissions must be granted
        // code to ask for permissions goes here
        setLoading(true);
        try {
            // 1. Do forward geocode
            const geocodedLocation = await Location.geocodeAsync(
                `${street}, ${city}, ${country}`
            );

            // 2. Check if a matching location is found
            const result = geocodedLocation[0];
            if (result === undefined) {
                alert("No coordinates found");
                setLoading(false);
                setConfirmAddr(true);
                return;
            }

            // 3. If yes, extract relevant data
            console.log(`Latitude: ${result.latitude}`);
            console.log(`Longitude: ${result.longitude}`);
            setLat(result.latitude);
            setLon(result.longitude);
            setLoading(false);
            setConfirmAddr(false);
            Alert.alert("Address Confirmed");
        } catch (err) {
            console.log(err);
        }
    };

    const doValidation = () => {
        if (Object.keys(brand).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle brand");
            return false;
        }
        if (Object.keys(model).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle model");
            return false;
        }
        if (Object.keys(seat).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle seat");
            return false;
        }
        if (Object.keys(range).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle range");
            return false;
        }
        if (Object.keys(hp).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle house power");
            return false;
        }
        if (Object.keys(licensePlate).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle license plate");
            return false;
        }
        if (Object.keys(price).length == 0) {
            Alert.alert("Missing Data", "Please fill in vehicle price");
            return false;
        }
        if (Object.keys(street).length == 0) {
            Alert.alert("Missing Data", "Please fill in street");
            return false;
        }
        if (Object.keys(city).length == 0) {
            Alert.alert("Missing Data", "Please fill in city");
            return false;
        }
        if (Object.keys(country).length == 0) {
            Alert.alert("Missing Data", "Please fill in country");
            return false;
        }
        if (confirmAddr) {
            Alert.alert("Address changed", "Please confirm address");
            return false;
        }

        return true;
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
            getCarModel(results, cardata.brand);
            getCarTrim(results, cardata.brand, cardata.model);
            setInfo();
        } catch (err) {
            console.log(err);
        }
    };

    const getCarModel = (re, cbrand) => {
        let id = 0;
        setBrand(cbrand);
        //clear the old model list
        setModelList((ml) => []);
        re.map((item) => {
            // push model to model list
            if (item.make == cbrand) {
                setModelList((oldModelList) => [
                    ...oldModelList,
                    { id: ++id, model: item.model },
                ]);
            }
        });
    };

    const getCarTrim = (re, brand, model) => {
        let id = 0;
        let photoID = 0;
        setSeatCap((st) => []);
        updatePhotos((ph) => []);
        console.log(brand, model);
        re.map((item) => {
            if (item.make == brand && item.model == model) {
                setTrim(item.trim);
                //set the seating capacity
                console.log(item.trim);
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
                        { id: id++, seatNo: item.seats_max },
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
            }
        });
    };

    const updateDocFromDB = async () => {
        if (doValidation()) {
            const docRef = doc(
                db,
                `OwnerProfiles/${auth.currentUser.uid}/Listing/`,
                `${cardata.id}`
            );
            const wl = cardata.waitingList;
            const pho = cardata.photos;
            const dataToUpdate = {
                brand: brand,
                model: model,
                trim: trim,
                photos: pho,
                seat: seat,
                range: range,
                hp: hp,
                licensePlate: licensePlate,
                price: price,
                street: street,
                city: city,
                country: country,
                ownerID: auth.currentUser.uid,
                status: cardata.status,
                waitingList: wl,
                renter: cardata.renter,
                lat: lat,
                lon: lon,
            };
            await updateDoc(docRef, dataToUpdate);
            Alert.alert("Updated");
        }
    };

    const deleteDocFromDB = async () => {
        await deleteDoc(
            doc(
                db,
                `OwnerProfiles/${auth.currentUser.uid}/Listing/`,
                `${cardata.id}`
            )
        );
        await deleteDoc(doc(db, `carListing`, `${cardata.id}`));
        Alert.alert("Deleted from market");
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            {loading ? (
                <View
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        alignSelf: "center",
                        position: "absolute",
                        zIndex: 1,
                    }}
                >
                    <ActivityIndicator size="large" color="blue" />
                </View>
            ) : (
                <View></View>
            )}

            <ScrollView style={styles.container_scrollview}>
                <ScrollView
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={true}
                    style={{
                        borderWidth: 1,
                        borderColor: "black",
                        width: windowWidth,
                    }}
                >
                    {photos.map((img) => {
                        return (
                            <Image
                                source={{ uri: img.photoURL }}
                                style={{
                                    width: windowWidth,
                                    height: 300,
                                }}
                            />
                        );
                    })}
                </ScrollView>

                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Text style={styles.text_title}>Car Brand:</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={brandList}
                        search
                        searchPlaceholder="Search"
                        placeholder={brand}
                        renderItem={(item) => {
                            return (
                                <View
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: "14" }}>
                                        {item.make}
                                    </Text>
                                </View>
                            );
                        }}
                        labelField="make"
                        valueField="id"
                        onChange={(item) => {
                            getCarModel(data, item.make);
                        }}
                    ></Dropdown>
                </View>

                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Text style={styles.text_title}>Car Model:</Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={modelList}
                        search
                        searchPlaceholder="Search"
                        placeholder={model}
                        renderItem={(item) => {
                            return (
                                <View
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: "14" }}>
                                        {item.model}
                                    </Text>
                                </View>
                            );
                        }}
                        labelField="model"
                        valueField="id"
                        onChange={(item) => {
                            // console.log(item.model);
                            setModel(item.model);
                            getCarTrim(data, brand, item.model);
                        }}
                    ></Dropdown>
                </View>

                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Text style={styles.text_title}>Car Trim:</Text>
                    <Text style={styles.text}>{trim}</Text>
                </View>

                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
                    <Text style={styles.text_title}>Seating capacity:</Text>
                    <Dropdown
                        style={styles.dropdown_number}
                        data={seatCap}
                        placeholder={seat}
                        labelField="seatNo"
                        valueField="id"
                        renderItem={(item) => {
                            return (
                                <View
                                    style={{
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Text style={{ fontSize: "14" }}>
                                        {item.seatNo}
                                    </Text>
                                </View>
                            );
                        }}
                        onChange={(item) => {
                            // console.log(item.seatNo);
                            setSeat(item.seatNo);
                            // getCarTrim(item.model)
                        }}
                    ></Dropdown>
                </View>

                <View
                    style={{ alignItems: "center", justifyContent: "center" }}
                >
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

                    <Text style={styles.text_title}>
                        Pickup location address:
                    </Text>
                    <TextInput
                        style={styles.text}
                        placeholder="Street"
                        keyboardType="default"
                        autoCapitalize="none"
                        value={street}
                        onChange={(event) => {
                            setStreet(event.nativeEvent.text);
                            setConfirmAddr(true);
                        }}
                    />
                    <TextInput
                        style={styles.text}
                        placeholder="City"
                        keyboardType="default"
                        autoCapitalize="none"
                        value={city}
                        onChange={(event) => {
                            setCity(event.nativeEvent.text);
                            setConfirmAddr(true);
                        }}
                    />
                    <TextInput
                        style={styles.text}
                        placeholder="Country"
                        keyboardType="default"
                        autoCapitalize="none"
                        value={country}
                        onChange={(event) => {
                            setCountry(event.nativeEvent.text);
                            setConfirmAddr(true);
                        }}
                    />
                </View>

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
                        onPress={getCurrentLocation}
                    >
                        <Text style={styles.btnLabel}>Current Address</Text>
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
                        onPress={() => {
                            doForwardGeocode(street, city, country);
                        }}
                    >
                        <Text style={styles.btnLabel}>Confirm Address</Text>
                    </Pressable>
                </View>

                <Pressable
                    style={styles.btn}
                    onPress={() => {
                        updateDocFromDB();
                    }}
                >
                    <Text style={styles.btnLabel}>Edit</Text>
                </Pressable>

                <Pressable
                    style={[styles.btn, { backgroundColor: "red" }]}
                    onPress={() => {
                        deleteDocFromDB();
                    }}
                >
                    <Text style={[styles.btnLabel, { color: "white" }]}>
                        Delete
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CarInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        paddingTop: Platform.OS == "android" ? StatusBar.currentHeight : 0,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    container_view: {
        // borderColor: "blue",
        // borderWidth: 1,
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    container_scrollview: {
        // borderColor: "black",
        // borderWidth: 1,
        width: "100%",
    },
    dropdown: {
        backgroundColor: "white",
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 10,
        borderRadius: 5,
        width: "60%",
    },
    dropdown_number: {
        backgroundColor: "white",
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 10,
        borderRadius: 5,
        width: "15%",
    },
    text: {
        borderColor: "gray",
        borderWidth: 1,
        marginTop: 10,
        textAlign: "center",
        backgroundColor: "white",
        padding: 10,
        borderRadius: 5,
        width: "60%",
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
