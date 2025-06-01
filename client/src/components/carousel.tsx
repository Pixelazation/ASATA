import React from "react";
import { ScrollView, StyleSheet, View, ImageBackground, TouchableOpacity, Linking } from "react-native";
import { Text } from 'react-native-ui-lib';

type CarouselItem = {
  title: string;
  image: any; // Image source
  link?: string; // Optional link
};

type CarouselProps = {
  title: string;
  items: CarouselItem[];
};

export const Carousel: React.FC<CarouselProps> = ({ title, items }) => {
  const handlePress = (link?: string) => {
    if (link) {
      Linking.openURL(link).catch((err) => console.error("Failed to open link:", err));
    }
  };

  return (
    <View style={styles.container}>
      <Text section textColor>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {items.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handlePress(item.link)} activeOpacity={0.8}>
            <View style={styles.item}>
              <ImageBackground source={item.image} style={styles.itemBackground}>
                <View style={styles.tintOverlay} />
                <Text style={styles.itemText}>{item.title}</Text>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    gap: 16
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  scrollView: {
    marginBottom: 20,
  },
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // black with 30% opacity
    zIndex: 1,
  },
  item: {
    width: 200,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 8,
  },
  itemBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
  },
  itemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    padding: 16,
    textAlign: "center",
    zIndex: 2
  },
});