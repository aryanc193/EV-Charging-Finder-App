import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getStationsById, markVisited } from "../../lib/appwrite";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../../components/CustomButton";
import { useGlobalContext } from "../../context/GlobalProvider";

const Visited = () => {
  const { user } = useGlobalContext();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [stations, setStations] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(""); // State for review text

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getStationsById(id);
        setStations(data);
      } catch (error) {
        console.error("Failed to fetch service center:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchStations();
    }
  }, [id]);

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  const handleDateChange = (event, date) => {
    if (event.type === "set") {
      const newDate = date || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setFullYear(newDate.getFullYear());
        updatedDate.setMonth(newDate.getMonth());
        updatedDate.setDate(newDate.getDate());
        return updatedDate;
      });
      setShowDatePicker(false);
      if (!showTimePicker) {
        setShowTimePicker(true);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, time) => {
    if (event.type === "set") {
      const newTime = time || new Date();
      setSelectedDate((prevDate) => {
        const updatedDate = new Date(prevDate);
        updatedDate.setHours(newTime.getHours());
        updatedDate.setMinutes(newTime.getMinutes());
        return updatedDate;
      });
      setShowTimePicker(false);
    } else {
      setShowTimePicker(false);
    }
  };

  const openDatePicker = () => {
    if (Platform.OS === "ios") {
      setShowDatePicker(true);
    } else if (Platform.OS === "android") {
      import("@react-native-community/datetimepicker").then(
        ({ DateTimePickerAndroid }) => {
          DateTimePickerAndroid.open({
            mode: "date",
            value: selectedDate,
            onChange: (event, date) => handleDateChange(event, date),
          });
        }
      );
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleMarkVisited = async () => {
    try {
      if (!stations) {
        Alert.alert("Error", "Service center information is not available.");
        return;
      }
      await markVisited(user.$id, stations.$id, selectedDate, review); // Pass review text
      Alert.alert("Success", "Marked Visited successfully!");
      router.push("../(tabs)/home");
    } catch (error) {
      Alert.alert("Error", "Failed to mark visited. Please try again.");
      console.error(error);
    }
  };

  if (loading) return <Text>Loading...</Text>;

  if (!stations) return <Text>Station not found</Text>;

  return (
    <View className="flex-1 mt-10 bg-black">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <Text className="text-4xl font-bold mb-4 text-white">
          {stations.title}
        </Text>
        <Text className="text-lg text-white mb-4">
          When did you last visit this station?
        </Text>
        <CustomButton
          title="Select Date & Time"
          handlePress={openDatePicker}
          containerStyles="w-full h-12 mb-5"
        />
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, date) => handleDateChange(event, date)}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, time) => handleTimeChange(event, time)}
          />
        )}
        <Text className="text-xl font-regular text-white">
          Selected Date and Time:{" "}
        </Text>
        <Text className="text-white font-bold text-4xl mt-4">
          {formatDateTime(selectedDate)}
        </Text>
        <Text className="text-lg text-white mb-4 mt-20">
          Write your review:
        </Text>
        <TextInput
          value={review}
          onChangeText={setReview}
          placeholder="Write your review here"
          placeholderTextColor="gray"
          multiline
          className="w-full h-[200px] bg-gray-800 text-white p-4 rounded-lg mb-4"
          style={{ textAlignVertical: "top", textAlign: "left" }}
        />
      </ScrollView>
      <CustomButton
        title="Send Review"
        handlePress={handleMarkVisited}
        containerStyles="w-full h-12"
      />
    </View>
  );
};

export default Visited;
