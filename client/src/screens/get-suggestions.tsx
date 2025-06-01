import React, { useRef, useState, useEffect } from "react";
import {
  ScrollView,
  TextInput,
  Alert,
  Linking,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { Text, View, Button } from "react-native-ui-lib";
import { observer } from "mobx-react";
import { NavioScreen } from "rn-navio";
import { useServices } from "@app/services";
import { useAppearance } from "@app/utils/hooks";
import { LocationSearchApi } from "@app/services/api/locationsearch";
import { LocationDetailsApi } from "@app/services/api/locationdetails";
import { LocationPhotosApi } from "@app/services/api/location-photos";
import { GeocodingApi } from "@app/services/api/geocoding";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location"; // Import expo-location
import { MaterialIcons } from '@expo/vector-icons'; // already imported
import type { Region } from 'react-native-maps';
import { ItinerarySelectorModal } from "@app/components/add-to-itinerary-modal";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANEL_MIN_HEIGHT = 200;
const PANEL_MAX_HEIGHT = SCREEN_HEIGHT - 100;

type Location = {
  latitude: number;
  longitude: number;
};

export const GetSuggestions: NavioScreen = observer(() => {
  useAppearance();
  const { navio } = useServices();
  const params = navio.useParams<{ selectedOption?: string }>();
  const [showTutorial, setShowTutorial] = useState(false);

  const [location, setLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>(params.selectedOption || "");
  const [selectedRecreation, setSelectedRecreation] = useState<string[]>([]);
  const [selectedDiner, setSelectedDiner] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region | undefined>({
    latitude: 10.321684,
    longitude: 123.898671,
    latitudeDelta: 0.1922,
    longitudeDelta: 0.1421,
  });

  const selectedSuggestionRef = useRef<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);


  const [deviceLocation, setDeviceLocation] = useState<{ latitude: number; longitude: number } | null>(null); // <-- store device location

  const recreationOptions = ["Wildlife", "Adventure", "Beaches", "Museums", "Hiking", "Parks"];
  const dinerOptions = ["Fast Food", "Fine Dining", "Cafés", "Buffets", "Local Cuisine"];

  const animatedY = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const searchBarOpacity = useRef(new Animated.Value(1)).current;
  const isExpandedRef = useRef(false);
  const currentY = useRef(PANEL_MIN_HEIGHT);
  const mapRef = useRef<MapView>(null);

  const toggleSelection = (item: string, type: "recreation" | "diner") => {
    if (type === "recreation") {
      setSelectedRecreation(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedDiner(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  const fetchSuggestions = async () => {
    if (!location.trim()) {
      Alert.alert("Error", "Please enter a location or select a location on the map.");
      return;
    }

    setLoading(true);
    try {
      let category = '';
      if (selectedOption === "recreation") category = "attractions";
      else if (selectedOption === "diner") category = "restaurants";
      else if (selectedOption === "accommodation") category = "hotels";

      let query = location;

      if (!region && location.trim()) {
        const selectedFilters =
          selectedOption === "recreation" ? selectedRecreation.join(", ") :
          selectedOption === "diner" ? selectedDiner.join(", ") : "";
        query = `${location} ${selectedFilters}`;
      } else if (region) {
        const geocodeResult = await GeocodingApi.reverseGeocode(region.latitude, region.longitude);
        if (geocodeResult) {
          const { fullAddress } = geocodeResult;
          const selectedFilters =
            selectedOption === "recreation" ? selectedRecreation.join(", ") :
            selectedOption === "diner" ? selectedDiner.join(", ") : "";
          query = `${fullAddress} ${selectedFilters}`;
        }
      }

      const data = await LocationSearchApi.search(query, category);
      const results = data?.data || [];

      const detailedResults = await Promise.all(
        results.map(async (item: any) => {
          try {
            const details = await LocationDetailsApi.getDetails(Number(item.location_id));
            const photosData = await LocationPhotosApi.getPhotos(Number(item.location_id), 1);
            const firstPhoto = photosData?.data?.[0]?.images?.medium?.url ?? null;

            return {
              ...details,
              photoUrl: firstPhoto,
            };
          } catch (error) {
            console.error("Error fetching detail/photo for item:", error);
            return { ...item, photoUrl: null };
          }
        })
      );

      setSuggestions(detailedResults);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determine the category based on selectedOption
  const getCategoryFromOption = (option: string): string => {
    switch(option) {
      case 'recreation': return 'attractions';
      case 'diner': return 'restaurants';
      case 'accommodation': return 'hotels';
      default: return '';
    }
  };

  const handleMapPress = async (event: any) => {
    const { coordinate } = event.nativeEvent;
    setRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: region?.latitudeDelta || 0.1922,
      longitudeDelta: region?.longitudeDelta || 0.1421,
    });

    // Geocoding disabled due to rate limits
    // const result = await GeocodingApi.reverseGeocode(coordinate.latitude, coordinate.longitude);
    // if (result) {
    //   const { fullAddress } = result;
    //   setLocation(`${fullAddress}`);
    // }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    setRegion(undefined);
  };

  // Fetch current location on screen load
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required to set the default pin.");
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setDeviceLocation(coords);
        setRegion({ ...coords, latitudeDelta: 0.1922, longitudeDelta: 0.1421 });

        // Geocoding disabled due to rate limits
        // const geocodeResult = await GeocodingApi.reverseGeocode(coords.latitude, coords.longitude);
        // if (geocodeResult) {
        //   const { fullAddress } = geocodeResult;
        //   setLocation(`${fullAddress}`);
        // }
      } catch (error) {
        console.error("Error fetching current location:", error);
        Alert.alert("Error", "Failed to fetch current location.");
      }
    })();
  }, []); // Run only once when the component mounts

  // Update search bar opacity based on panel position

  const updateSearchBarOpacity = (panelHeight: number) => {
    const opacity = 1 - (panelHeight - PANEL_MIN_HEIGHT) / (PANEL_MAX_HEIGHT - PANEL_MIN_HEIGHT);
    searchBarOpacity.setValue(opacity);
  };

  const togglePanel = () => {
    const targetHeight = isExpandedRef.current ? PANEL_MIN_HEIGHT : PANEL_MAX_HEIGHT;
    isExpandedRef.current = !isExpandedRef.current;

    Animated.parallel([
      Animated.spring(animatedY, {
        toValue: targetHeight,
        useNativeDriver: false,
      }),
      Animated.timing(searchBarOpacity, {
        toValue: isExpandedRef.current ? 0 : 1,
        duration: 200,
        useNativeDriver: true,
      })
    ]).start();

    currentY.current = targetHeight;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        const newHeight = Math.max(
          PANEL_MIN_HEIGHT,
          Math.min(PANEL_MAX_HEIGHT, currentY.current - gestureState.dy)
        );
        animatedY.setValue(newHeight);
        updateSearchBarOpacity(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        currentY.current = Math.max(
          PANEL_MIN_HEIGHT,
          Math.min(PANEL_MAX_HEIGHT, currentY.current - gestureState.dy)
        );

        const velocityThreshold = 0.5;
        const isFastSwipe = Math.abs(gestureState.vy) > velocityThreshold;

        let targetHeight;

        if (isFastSwipe) {
          targetHeight = gestureState.vy > 0 ? PANEL_MIN_HEIGHT : PANEL_MAX_HEIGHT;
        } else {
          const halfwayPoint = PANEL_MIN_HEIGHT + (PANEL_MAX_HEIGHT - PANEL_MIN_HEIGHT) / 2;
          targetHeight = currentY.current > halfwayPoint ? PANEL_MAX_HEIGHT : PANEL_MIN_HEIGHT;
        }

        isExpandedRef.current = targetHeight === PANEL_MAX_HEIGHT;

        Animated.parallel([
          Animated.spring(animatedY, {
            toValue: targetHeight,
            useNativeDriver: false,
          }),
          Animated.timing(searchBarOpacity, {
            toValue: isExpandedRef.current ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();

        currentY.current = targetHeight;
      },
    })
  ).current;

  // Update region when user moves the map
  const handleRegionChangeComplete = async (newRegion: any) => {
    setRegion(newRegion);
    // Geocoding disabled due to rate limits
    // try {
    //   const geocodeResult = await GeocodingApi.reverseGeocode(newRegion.latitude, newRegion.longitude);
    //   if (geocodeResult) {
    //     const { fullAddress } = geocodeResult;
    //     setLocation(`${fullAddress}`);
    //   }
    // } catch (error) {
    //   console.error("Error reverse geocoding:", error);
    // }
  };

  // Center map on current device location
  const handleCurrentLocation = async () => {
    try {
      // Use cached deviceLocation if available
      let coords = deviceLocation;
      if (!coords) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Location permission is required.");
          return;
        }
        const currentLocation = await Location.getCurrentPositionAsync({});
        coords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };
        setDeviceLocation(coords); // cache for future use
      }

      const regionCoords = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.1922,
        longitudeDelta: 0.1421,
      };
      setRegion(regionCoords);
      mapRef.current?.animateToRegion(regionCoords, 1000);

      // Geocoding disabled due to rate limits
      // const geocodeResult = await GeocodingApi.reverseGeocode(coords.latitude, coords.longitude);
      // if (geocodeResult) {
      //   const { fullAddress } = geocodeResult;
      //   setLocation(`${fullAddress}`);
      // }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch current location.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Map and overlays (zIndex: 1) */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        region={region}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
      />
      {/* Center Pin Overlay - zIndex: 1 */}
      <View pointerEvents="none" style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        marginLeft: -24,
        marginTop: -110,
        zIndex: 1, // Lower than sliding panel
      }}>
        <MaterialIcons name="place" size={48} color="#007AFF" />
      </View>
      {/* Current Location Button - zIndex: 1 */}
      <TouchableOpacity
        style={[styles.currentLocationButton, { zIndex: 1 }]}
        onPress={handleCurrentLocation}
        activeOpacity={0.7}
      >
        <MaterialIcons name="my-location" size={32} color="#007AFF" />
      </TouchableOpacity>

      {/* Search bar and sliding panel (higher zIndex) */}
      {/* <Animated.View style={[styles.searchBarContainer, { opacity: searchBarOpacity, zIndex: 10 }]}>
        <TextInput
          placeholder="Search Location"
          value={location}
          onChangeText={handleLocationChange}
          style={styles.searchBar}
        />
      </Animated.View> */}

      <Animated.View
        style={[styles.slidingPanel, { height: animatedY, zIndex: 10 }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.panelContent}>
          {/* <Text text50 marginB-s2>Get Suggestions</Text> */}

          <TouchableOpacity 
            style={styles.dragHandle} 
            onPress={togglePanel}
            activeOpacity={0.8}
          >
            <View style={styles.dragHandleBar} />
          </TouchableOpacity>

          {/* --- Search bar now inside the panel --- */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
            <TextInput
              placeholder="Search city, hotel, restaurant, or place name"
              value={location}
              onChangeText={handleLocationChange}
              style={[styles.searchBar, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setShowTutorial(true)}
              style={{ marginLeft: 8, padding: 6 }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="lightbulb-outline" size={26} color="#FFC107" />
            </TouchableOpacity>
          </View>
          {showTutorial && (
            <View style={{
              backgroundColor: "#fffbe6",
              borderRadius: 10,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: "#ffe082",
              shadowColor: "#000",
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                How to use Get Suggestions
              </Text>
              <Text>
                Enter a city, hotel, restaurant, or place name in the search bar to get suggestions for that location.{"\n"}
                Or, move the map pin to get suggestions near a specific spot on the map.
              </Text>
              <TouchableOpacity
                onPress={() => setShowTutorial(false)}
                style={{ alignSelf: "flex-end", marginTop: 8 }}
              >
                <Text style={{ color: "#016A42", fontWeight: "bold" }}>Got it</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.categoryContainer}>
            <TouchableOpacity
              style={[styles.categoryBox, selectedOption === "accommodation" && styles.categoryBoxSelected]}
              onPress={() => setSelectedOption("accommodation")}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>🏨</Text>
              <Text style={styles.categoryLabel}>Accommodation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryBox, selectedOption === "recreation" && styles.categoryBoxSelected]}
              onPress={() => setSelectedOption("recreation")}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>🏖️</Text>
              <Text style={styles.categoryLabel}>Recreation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryBox, selectedOption === "diner" && styles.categoryBoxSelected]}
              onPress={() => setSelectedOption("diner")}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryIcon}>🍽️</Text>
              <Text style={styles.categoryLabel}>Diner</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContainer}>
            {selectedOption === "recreation" && (
              <View>
                <Text text60 marginB-s2>Choose Recreation Types</Text>
                <View style={styles.optionsContainer}>
                  {recreationOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionBox, selectedRecreation.includes(option) && styles.optionBoxSelected]}
                      onPress={() => toggleSelection(option, "recreation")}
                    >
                      <Text
                        style={[styles.optionText, selectedRecreation.includes(option) && styles.optionTextSelected]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedOption === "diner" && (
              <View>
                <Text text60 marginB-s2>Choose Diner Types</Text>
                <View style={styles.optionsContainer}>
                  {dinerOptions.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.optionBox, selectedDiner.includes(option) && styles.optionBoxSelected]}
                      onPress={() => toggleSelection(option, "diner")}
                    >
                      <Text
                        style={[styles.optionText, selectedDiner.includes(option) && styles.optionTextSelected]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <Button
              label="Find Matches"
              onPress={fetchSuggestions}
              marginB-s1
              disabled={loading}
              backgroundColor="#016A42"
              labelStyle={{ color: "white", fontWeight: "bold" }}
            />

            {loading ? (
              <Text text70M>Loading suggestions...</Text>
            ) : (
              suggestions.map((item, index) => (
                <View key={index} style={styles.suggestionCard}>
                  <TouchableOpacity
                    onPress={() => item.web_url && Linking.openURL(item.web_url)}
                    activeOpacity={0.7}
                    style={{ flex: 1 }}
                  >
                    {item.photoUrl && (
                      <Image source={{ uri: item.photoUrl }} style={styles.suggestionImage} />
                    )}
                    <Text text60BO marginT-s2 marginB-s1>{item.name}</Text>
                    <Text text70 marginB-s1>{item.address_obj?.address_string || "No address available"}</Text>
                    <Text>
                      {Array.from({ length: Math.round(Number(item.rating) || 0) }, () => "⭐").join("") || "No rating"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.addToItineraryButton}
                    onPress={() => {
                      selectedSuggestionRef.current = item;
                      setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addToItineraryText}>Add to Itinerary</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}  
          </ScrollView>
        </View>
      </Animated.View>
      <ItinerarySelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectItinerary={async (itinerary) => {
          const selected = selectedSuggestionRef.current;
          if (selected) {
            if (!selected.longitude || !selected.latitude) {
              const coords = await GeocodingApi.forwardGeocode(selected.address_obj?.address_string)
              selected.longitude = coords?.lng;
              selected.latitude = coords?.lat;
              console.log(coords);
            }

            console.log(selected.latitude);
            console.log(selected.longitude);

            navio.push('ActivityForm', {
              itineraryId: itinerary.id,
              prefill: {
                name: selected.name,
                description: selected.description || selected.address_obj?.address_string || '',
                location: selected.address_obj?.address_string || '',
                image_url: selected.photoUrl,
                longitude: selected.longitude,
                latitude: selected.latitude,
              },
              category: getCategoryFromOption(selectedOption)
            });
          }
          setModalVisible(false);
        }}
        onCreateNew={() => {
          const selected = selectedSuggestionRef.current;
          setModalVisible(false);
          navio.push('ItineraryForm', {
            onCreated: async (newItineraryId: string) => {
              if (selected) {
                if (!selected.longitude || !selected.latitude) {
                  const coords = await GeocodingApi.forwardGeocode(selected.address_obj?.address_string)
                  selected.longitude = coords?.lng;
                  selected.latitude = coords?.lat;
                }

                console.log(selected.latitude);
                console.log(selected.longitude);

                navio.push('ActivityForm', {
                  itineraryId: newItineraryId,
                  prefill: {
                    name: selected.name,
                    description: selected.description || selected.address_obj?.address_string || '',
                    location: selected.address_obj?.address_string || '',
                    image_url: selected.photoUrl,
                    longitude: selected.longitude,
                    latitude: selected.latitude,
                  },
                  category: getCategoryFromOption(selectedOption)
                });
              }
            }
          });
        }}
      />
    </View>
  );
});

GetSuggestions.options = {
  title: "Get Suggestions",
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBarContainer: {
    position: "absolute",
    top: 10,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  addToItineraryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  addToItineraryText: {
    color: "white",
    fontWeight: "600",
  },
  searchBar: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    fontSize: 16,
  },
  slidingPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  panelContent: {
    flex: 1,
  },
  dragHandle: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: -10,
    marginBottom: 10,
  },
  dragHandleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  categoryBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  categoryBoxSelected: {
    backgroundColor: "#d1e7ff",
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  optionBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#d4edda",
  },
  optionBoxSelected: {
    backgroundColor: "#155724",
  },
  optionText: {
    fontSize: 14,
    color: "#155724",
  },
  optionTextSelected: {
    color: "white",
  },
  scrollContainer: {
    flex: 1,
  },
  suggestionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  suggestionImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 220,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
  },
});