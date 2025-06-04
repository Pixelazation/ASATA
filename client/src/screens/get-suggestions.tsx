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
  Easing,
  Dimensions,
  PanResponder,
  ActivityIndicator,
  Pressable,
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
import { Modal } from "react-native";
import { LocationReviewApi } from "@app/services/api/locationreview";
import { Icon, IconName } from '../components/icon';
import { RadioSelection } from '../components/molecules/radio-selection';
import { HeaderBack } from '../components/molecules/header-back';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../utils/designSystem';
import { FilterChipAddBar } from "../components/filter-chip-add-bar";

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
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [selectedOption, setSelectedOption] = useState<string | null>(params.selectedOption || "recreation");
  const recreationOptions = ["Wildlife", "Parks", "Adventure", "Beaches", "Museums", "Hiking"];
  const dinerOptions = ["Fast Food", "Fine Dining", "Cafés", "Buffets", "Local Cuisine"];
  const [recreationFilters, setRecreationFilters] = useState([...recreationOptions]);
  const [selectedRecreation, setSelectedRecreation] = useState<string[]>([]);
  const [dinerFilters, setDinerFilters] = useState([...dinerOptions]);
  const [selectedDiner, setSelectedDiner] = useState<string[]>([]);

  const handleToggleDiner = (label: string) => {
    setSelectedDiner(prev => {
      if (prev.includes(label)) {
        // If it's a custom filter (not in the original options), remove from filters too
        if (!dinerOptions.includes(label)) {
          setDinerFilters(filters => filters.filter(f => f !== label));
        }
        return prev.filter(item => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };
  const handleAddDiner = (label: string) => {
    if (!dinerFilters.includes(label)) {
      setDinerFilters((prev) => [...prev, label]);
      setSelectedDiner((prev) => [...prev, label]);
    }
  };

  const handleToggleRecreation = (label: string) => {
    setSelectedRecreation(prev => {
      if (prev.includes(label)) {
        // If it's a custom filter (not in the original options), remove from filters too
        if (!recreationOptions.includes(label)) {
          setRecreationFilters(filters => filters.filter(f => f !== label));
        }
        return prev.filter(item => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };
  const handleAddRecreation = (label: string) => {
    if (!dinerFilters.includes(label)) {
      setRecreationFilters((prev) => [...prev, label]);
      setSelectedRecreation((prev) => [...prev, label]);
    }
  };

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState<Region | undefined>({
    latitude: 10.321684,
    longitude: 123.898671,
    latitudeDelta: 0.1922,
    longitudeDelta: 0.1421,
  });

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const [showResults, setShowResults] = useState(false);

  const selectedSuggestionRef = useRef<any>(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [modalSuggestion, setModalSuggestion] = useState<any>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);


  const [deviceLocation, setDeviceLocation] = useState<{ latitude: number; longitude: number } | null>(null); // <-- store device location


  const animatedY = useRef(new Animated.Value(PANEL_MIN_HEIGHT)).current;
  const searchBarOpacity = useRef(new Animated.Value(1)).current;
  const isExpandedRef = useRef(false);
  const currentY = useRef(PANEL_MIN_HEIGHT);
  const mapRef = useRef<MapView>(null);

  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (detailModalVisible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.spring(modalTranslateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [detailModalVisible]);

  const toggleSelection = (item: string, type: "recreation" | "diner") => {
    if (type === "recreation") {
      setSelectedRecreation(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    } else {
      setSelectedDiner(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    }
  };

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      let category = getCategoryFromOption(selectedOption || "");
      let latLong: string | undefined = region ? `${region.latitude},${region.longitude}` : undefined;
      // let address = [city, country].filter(Boolean).join(", ");
      let address = country;
      // let address = "";

      // Gather all selected filters (including custom)
      let filters: string[] = [];
      if (selectedOption === "recreation" && selectedRecreation.length > 0) {
        filters = filters.concat(selectedRecreation);
      }
      if (selectedOption === "diner" && selectedDiner.length > 0) {
        filters = filters.concat(selectedDiner);
      }

      // Query logic: use filters if any, otherwise use category
      let query = filters.length > 0 ? filters.join(",") : category;

      // Debug logging
      console.log("Tripadvisor Query:", query);
      console.log("Tripadvisor LatLong:", latLong);
      console.log("Tripadvisor Category:", category);
      console.log("Tripadvisor Address:", address);

      const data = await LocationSearchApi.search(query, category, latLong, address);
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

  const updateLocationFromPin = async (latitude: number, longitude: number) => {
    const geocodeResult = await GeocodingApi.reverseGeocode(latitude, longitude);

    console.log("Reverse Geocode Result:", geocodeResult);

    if (geocodeResult) {
      const { fullAddress, city, country } = geocodeResult;
      setLocation(`${fullAddress}`);
      setSearchInput(`${fullAddress}`);
      setCity(`${city || ''}`);
      setCountry(`${country || ''}`);

      console.log("Updated Location:", fullAddress, city, country);

    }
  }

  const handleLocationChange = async (text: string) => {
    setLocation(text);
    setSearchInput(text);

    if (text.trim().length === 0) return;

    try {
      const coords = await GeocodingApi.forwardGeocode(text);
      if (coords && coords.lat && coords.lng) {
        const newRegion = {
          latitude: coords.lat,
          longitude: coords.lng,
          latitudeDelta: 0.1922,
          longitudeDelta: 0.1421,
        };
        setRegion(newRegion);
        setDeviceLocation({ latitude: coords.lat, longitude: coords.lng });
        mapRef.current?.animateToRegion(newRegion, 1000);

        // Optionally update city/country using reverse geocode
        updateLocationFromPin(coords.lat, coords.lng);
      }
    } catch (error) {
      Alert.alert("Location not found", "Could not find the specified location.");
    }
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
        updateLocationFromPin(coords.latitude, coords.longitude);

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

  const adjustPanelOnSearch = () => {
    if (isExpandedRef.current) {
      // If panel is expanded, collapse it
      togglePanel();
    } 
  }

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
    console.log(newRegion);
    // Geocoding disabled due to rate limits
    try {
      updateLocationFromPin(newRegion.latitude, newRegion.longitude);
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
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

      updateLocationFromPin(coords.latitude, coords.longitude);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch current location.");
    }
  };

  const categoryOptions = [
    { name: 'diner', label: 'Diner', icon: 'restaurant' },
    { name: 'recreation', label: 'Recreation', icon: 'sunny' },
    { name: 'accommodation', label: 'Accomodation', icon: 'business' },
  ] as {name: string, label: string, icon: IconName}[];

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16, zIndex: 20 }}>
        <HeaderBack />
      </View>

      {/* Map and overlays (zIndex: 1) */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: deviceLocation?.latitude || 10.321684,
          longitude: deviceLocation?.longitude || 123.898671,
          latitudeDelta: 0.1922,
          longitudeDelta: 0.1421,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
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
        <MaterialIcons name="place" size={48} color={colors.primary} />
      </View>
      {/* Current Location Button - zIndex: 1 */}
      <TouchableOpacity
        style={[styles.currentLocationButton, { zIndex: 1 }]}
        onPress={handleCurrentLocation}
        activeOpacity={0.7}
      >
        <MaterialIcons name="my-location" size={32} color={colors.primary} />
      </TouchableOpacity>

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
          {!showResults && (
            <>
              {/* Search bar, category buttons, filters, Find Matches button */}
              {/* --- Search bar now inside the panel --- */}
              <View style={styles.searchBarRow}>
                <TextInput
                  placeholder="Enter City or Location Name"
                  value={searchInput}
                  onChangeText={setSearchInput}
                  onSubmitEditing={() => handleLocationChange(searchInput)}
                  onPressIn={adjustPanelOnSearch}
                  style={[styles.searchBar, { flex: 1 }]}
                  returnKeyType="search"
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
                <View style={styles.tutorialContainer}>
                  <Text style={styles.tutorialTitle}>
                    How to use Get Suggestions
                  </Text>
                  <Text>
                    Enter a city, hotel, restaurant, or place name in the search bar to get suggestions for that location.{"\n"}
                    Or, move the map pin to get suggestions near a specific spot on the map.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowTutorial(false)}
                    style={styles.tutorialGotIt}
                  >
                    <Text>Got it</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={{ marginVertical: 8 }}>
                <RadioSelection
                  options={categoryOptions}
                  pressableSize={100}
                  selected={selectedOption}
                  selectFunction={value => {
                    if (value != null) setSelectedOption(value);
                }}
              />
              </View>
              
    
                {selectedOption === "recreation" && (
                  <View>
                    <Text text60 marginB-s2>Choose Diner Types</Text>
                    <FilterChipAddBar
                      filters={recreationFilters}
                      selected={selectedRecreation}
                      onToggle={handleToggleRecreation}
                      onAdd={handleAddRecreation}
                    />
                  </View>
                )}
    
                {selectedOption === "diner" && (
                  <View>
                    <Text text60 marginB-s2>Choose Diner Types</Text>
                    <FilterChipAddBar
                      filters={dinerFilters}
                      selected={selectedDiner}
                      onToggle={handleToggleDiner}
                      onAdd={handleAddDiner}
                    />
                  </View>
                )}
    
                <Button
                  label="Find Matches"
                  onPress={() => {
                    fetchSuggestions();
                    setShowResults(true);
                  }}
                  marginB-s1
                  disabled={loading}
                  backgroundColor="#016A42"
                  labelStyle={{ color: "white", fontWeight: "bold" }}
                />
            </>
          )}

          <ScrollView style={styles.scrollContainer}>
            {loading ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: "#555", textAlign: "center" }}>
                  {(() => {
                    if (selectedOption === "diner" && selectedDiner.length > 0) {
                      return `Loading restaurant suggestions for ${selectedDiner.join(", ")}.`;
                    }
                    if (selectedOption === "recreation" && selectedRecreation.length > 0) {
                      return `Loading recreation suggestions for ${selectedRecreation.join(", ")}.`;
                    }
                    if (selectedOption === "accommodation") {
                      return "Loading hotel suggestions.";
                    }
                    // fallback
                    return "Loading suggestions...";
                  })()}
                </Text>
              </View>
            ) : (
              suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activityCard}
                  activeOpacity={0.85}
                  onPress={() => {
                    setModalSuggestion(item);
                    setDetailModalVisible(true);
                    setReviews([]);
                    setReviewsLoading(true);
                    LocationReviewApi.getReviews(Number(item.location_id)).then(res => {
                      setReviews(res?.data || []);
                      setReviewsLoading(false);
                    });
                  }}
                >
                  {/* Image */}
                  {item.photoUrl ? (
                    <Image source={{ uri: item.photoUrl }} style={styles.activityImage} />
                  ) : (
                    <View style={[styles.activityImage, { backgroundColor: colors.placeholder }]} />
                  )}
                  {/* Title and Rating */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.activityTitle} numberOfLines={1}>{item.name}</Text>
                    {item.rating && (
                      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        {Array.from({ length: Math.round(Number(item.rating) || 0) }, () => <Icon name='star' color={colors.primary} size={16}/>)}
                      </View>
                    )}
                  </View>
                  {/* Address */}
                  <Text style={styles.activityLocation} numberOfLines={1}>
                    {item.address_obj?.address_string || "No address available"}
                  </Text>
                  {/* Description */}
                  {item.description ? (
                    <Text style={styles.activityDescription} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  {/* Add to Itinerary Button */}
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
                </TouchableOpacity>
              ))
      )}
          </ScrollView>
          {showResults && (
            <TouchableOpacity
              style={styles.fab}
              onPress={() => {
                setShowResults(false);
                setSuggestions([]);
                setLocation("");
                setSelectedOption("");
                setSelectedRecreation([]);
                setSelectedDiner([]);
              }}
              activeOpacity={0.85}
            >
              <MaterialIcons name="refresh" size={28} color={colors.primary} />
            </TouchableOpacity>
          )}
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
              category: getCategoryFromOption(selectedOption || '')
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
                  category: getCategoryFromOption(selectedOption || "")
                });
              }
            }
          });
        }}
      />
      {modalSuggestion && (
        <Modal
          visible={detailModalVisible}
          transparent
          animationType="none"
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <Pressable
            style={{ flex: 1 }}
            onPress={() => setDetailModalVisible(false)}
          >
            <Animated.View
              style={styles.modalOverlay}
              pointerEvents="auto"
            />
          </Pressable>

          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              padding: 8,
            }}
            pointerEvents="box-none" // this lets the pressable behind receive touches
          >
            <Animated.View
              style={styles.modalContentWrapper}
              pointerEvents="box-none"
            >
            <View style={styles.modalContent}>
              <ScrollView
                contentContainerStyle={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Image */}
                {modalSuggestion.photoUrl ? (
                  <Image source={{ uri: modalSuggestion.photoUrl }} style={styles.modalImage} />
                ) : (
                  <View style={[styles.modalImage, {backgroundColor: colors.placeholder}]} />
                )}
                {/* Title */}
                <Text style={styles.modalTitle}>{modalSuggestion.name}</Text>
                {/* Address */}
                <Text style={styles.modalAddress}>{modalSuggestion.address_obj?.address_string || "No address available"}</Text>
                {/* Rating */}
                {modalSuggestion.rating && (
                  <Text style={styles.modalRating}>
                    {Array.from({ length: Math.round(Number(modalSuggestion.rating) || 0) }, () => "⭐").join("")}
                  </Text>
                )}
                {/* Description */}
                {modalSuggestion.description && (
                  <Text style={styles.modalDescription}>
                    {modalSuggestion.description}
                  </Text>
                )}
                {/* Buttons */}
                <View style={styles.modalButtonRow}>
                  <TouchableOpacity
                    style={[styles.addToItineraryButton, { flex: 1, marginRight: 8 }]}
                    onPress={() => {
                      selectedSuggestionRef.current = modalSuggestion;
                      setDetailModalVisible(false);
                      setModalVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addToItineraryText}>Add to Itinerary</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addToItineraryButton, { backgroundColor: "#555", flex: 1, marginLeft: 8 }]}
                    onPress={() => {
                      if (modalSuggestion.web_url) Linking.openURL(modalSuggestion.web_url);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addToItineraryText}>Open in Web</Text>
                  </TouchableOpacity>
                </View>

                {/* Reviews Section */}
                <View style={styles.modalReviewSection}>
                  <Text style={styles.modalReviewTitle}>
                    Reviews
                  </Text>
                  {reviewsLoading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 12 }} />
                  ) : reviews.length === 0 ? (
                    <Text style={{ color: "#888", fontStyle: "italic" }}>No reviews found.</Text>
                  ) : (
                    reviews.map((review: any) => (
                      <View key={review.id} style={styles.modalReviewItem}>
                        <View style={styles.modalReviewUserRow}>
                          <Image
                            source={{ uri: review.user?.avatar?.thumbnail }}
                            style={styles.modalReviewAvatar}
                          />
                          <View>
                            <Text style={styles.modalReviewUserName}>{review.user?.username}</Text>
                            <Text style={styles.modalReviewUserLocation}>
                              {review.user?.user_location?.name}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.modalReviewTitleText}>{review.title}</Text>
                        <Text style={styles.modalReviewStars}>
                          {Array.from({ length: Number(review.rating) || 0 }, () => "⭐").join("")}
                        </Text>
                        <Text style={styles.modalReviewText}>{review.text}</Text>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(review.url)}
                          style={{ alignSelf: "flex-start" }}
                        >
                          <Text style={styles.modalReviewLink}>Read full review</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => setDetailModalVisible(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </Animated.View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
});

GetSuggestions.options = {
  headerShown: false,
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
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  addToItineraryText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
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
  activityCard: {
  padding: 16,
  borderWidth: 1,
  borderColor: "#e0e0e0",
  borderRadius: 14,
  marginBottom: 16,
  backgroundColor: "#fff",
  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
},
activityImage: {
  width: "100%",
  height: 140,
  borderRadius: 10,
  marginBottom: 10,
  backgroundColor: "#f0f0f0",
},
activityTitle: {
  fontSize: 18,
  fontWeight: "bold",
  flex: 1,
  marginRight: 8,
  color: "#222",
},
activityLocation: {
  fontSize: 14,
  color: "#555",
  marginBottom: 4,
},
activityDescription: {
  fontSize: 14,
  color: "#333",
  marginBottom: 8,
},
activityRating: {
  fontSize: 16,
  color: "#FFC107",
  fontWeight: "bold",
},
searchBarRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
},
tutorialContainer: {
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
},
tutorialTitle: {
  fontWeight: "bold",
  marginBottom: 6,
},
tutorialGotIt: {
  color: "#016A42",
  fontWeight: "bold",
  alignSelf: "flex-end",
  marginTop: 8,
},
fab: {
  position: "absolute",
  bottom: 16,
  right: 16,
  backgroundColor: "white",
  borderRadius: 28,
  width: 56,
  height: 56,
  justifyContent: "center",
  alignItems: "center",
  elevation: 6,
  zIndex: 20,
  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.3)',
  position: 'absolute',
  width: '100%',
  height: '100%',
},
modalContentWrapper: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
modalContent: {
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 0,
  width: '90%',
  maxHeight: '80%',
  overflow: 'hidden',
},
modalScroll: {
  padding: 24,
},
modalImage: {
  width: '100%',
  height: 180,
  borderRadius: 10,
  marginBottom: 12,
},
modalTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  marginBottom: 8,
},
modalAddress: {
  color: '#555',
  marginBottom: 8,
},
modalRating: {
  color: "#FFC107",
  fontWeight: "bold",
  marginBottom: 8,
},
modalDescription: {
  fontSize: 15,
  color: "#333",
  marginBottom: 12,
  textAlign: "justify",
},
modalButtonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 12,
},
modalReviewSection: {
  marginTop: 10,
},
modalReviewTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 8,
},
modalReviewItem: {
  marginBottom: 18,
  borderBottomWidth: 1,
  borderBottomColor: "#eee",
  paddingBottom: 12,
},
modalReviewUserRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 4,
},
modalReviewAvatar: {
  width: 32,
  height: 32,
  borderRadius: 16,
  marginRight: 8,
  backgroundColor: "#eee",
},
modalReviewUserName: {
  fontWeight: "bold",
},
modalReviewUserLocation: {
  color: "#888",
  fontSize: 12,
},
modalReviewTitleText: {
  fontWeight: "bold",
  marginBottom: 2,
},
modalReviewStars: {
  color: "#FFC107",
  marginBottom: 2,
},
modalReviewText: {
  color: "#333",
  marginBottom: 4,
},
modalReviewLink: {
  color: colors.primary,
  fontSize: 13,
  alignSelf: "flex-start",
},
modalCloseButton: {
  alignSelf: "center",
  marginTop: 18,
},
modalCloseText: {
  color: colors.primary,
  fontWeight: "bold",
},
});