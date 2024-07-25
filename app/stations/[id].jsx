import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  ScrollView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router"; // Use this to get route params
import { getStationsById, getReviewsByStationId } from "../../lib/appwrite"; // Assuming you have these functions
import CustomButton from "../../components/CustomButton";
import MapView, { Marker } from "react-native-maps";

const StationsDetail = () => {
  const { id } = useLocalSearchParams(); // Get the ID from route params
  const [stations, setStations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getStationsById(id);
        setStations(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const data = await getReviewsByStationId(id); // Function to fetch reviews based on station ID
        setReviews(data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error.message);
      }
    };

    fetchStations();
    fetchReviews();
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  if (!stations) return <Text>Station not found</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: stations.thumbnail }} style={styles.image} />
      <Text style={styles.title}>{stations.title}</Text>
      <Text style={styles.label}>Location 📍</Text>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: stations.latitude,
            longitude: stations.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: stations.latitude,
              longitude: stations.longitude,
            }}
            title={stations.title}
            description={stations.address}
          />
        </MapView>
      </View>
      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.phone}>{stations.phone}</Text>
      <Text style={styles.label}>Website:</Text>
      <Text
        style={styles.website}
        onPress={() => Linking.openURL(stations.web)}
      >
        {stations.web}
      </Text>
      <View className="mt-5">
        <Text className="text-white text-xl font-pregular mb-1">
          Operating Hours:
        </Text>
        <Text className="text-white text-xl font-bold mt-1">
          {stations.operating_hours}
        </Text>
      </View>
      <View className="mt-5">
        <Text className="text-white text-xl font-pregular mb-1">Services:</Text>
        {stations.services.map((service, index) => (
          <Text key={index} className="text-white text-xl font-bold mt-1">
            {service}
          </Text>
        ))}
      </View>
      <Text style={styles.label}>Rating:</Text>
      <Text style={styles.rating}>{stations.rating} / 5 ⭐</Text>

      <Text style={styles.label}>Reviews:</Text>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <View key={index} style={styles.reviewContainer}>
            <Text style={styles.reviewText}>{review.review}</Text>
            <Text style={styles.reviewDetails}>
              Reviewed by: {review.creator.username}
            </Text>
            <Text style={styles.reviewDetails}>
              Date: {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noReviews}>No reviews yet.</Text>
      )}

      <CustomButton
        title="Give Review"
        handlePress={() => router.push(`./Visited?id=${stations.$id}`)}
        containerStyles="w-full mt-7"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginVertical: 10,
  },
  label: {
    fontSize: 20,
    color: "white",
    marginVertical: 5,
    marginTop: 20,
  },
  mapContainer: {
    height: 200,
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 10,
  },
  map: {
    flex: 1,
  },
  phone: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  website: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textDecorationLine: "underline",
  },
  rating: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  reviewContainer: {
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  reviewText: {
    color: "white",
    fontSize: 16,
  },
  reviewDetails: {
    color: "gray",
    fontSize: 14,
  },
  noReviews: {
    color: "white",
    fontSize: 16,
    fontStyle: "italic",
  },
});

export default StationsDetail;
