import React from "react";
import { ScrollView, StyleSheet, Text, View, ImageBackground } from "react-native";

type CarouselItem = {
  title: string;
  image: any; 
};

type CarouselProps = {
  title: string;
  items: CarouselItem[];
};

export const Carousel: React.FC<CarouselProps> = ({ title, items }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <ImageBackground source={item.image} style={styles.itemBackground}>
              <Text style={styles.itemText}>{item.title}</Text>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  scrollView: {
    marginBottom: 20,
  },
  item: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    marginHorizontal: 32,
  },
  itemBackground: {
    width: 200,
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
  },
});