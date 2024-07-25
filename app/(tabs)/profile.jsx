import { useState, useEffect } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Text,
  Button,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { icons } from "../../constants";
import useAppwrite from "../../lib/useAppwrite";
import {
  getUserVisitedStations,
  signOut,
  removeVisited,
} from "../../lib/appwrite";
import { useGlobalContext } from "../../context/GlobalProvider";
import EmptyState from "../../components/EmptyState";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  const { user, setUser, setIsLogged } = useGlobalContext();
  const {
    data: visitedStations,
    loading,
    refetch,
  } = useAppwrite(() => getUserVisitedStations(user.$id));
  const [refreshing, setRefreshing] = useState(false);

  const handlePress = (id) => {
    router.push(`/stations/${id}`);
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

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

  const handleCancel = async (visitedId) => {
    try {
      await removeVisited(visitedId);
      Alert.alert("Deleted");
      refetch(); // Refresh the data after cancelling the visited
    } catch (error) {
      console.error("Failed to delete", error);
      Alert.alert("Error", "Failed to delete. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);
    router.replace("/sign-in");
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );

  return (
    <SafeAreaView className="bg-black h-full">
      <FlatList
        data={visitedStations}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="px-4 mb-4"
            onPress={() => handlePress(item.$id)}
          >
            <View className="bg-gray-800 p-4 rounded-lg shadow-md">
              <Text className="text-lg font-semibold text-green-500">
                {item.title}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg">
                Phone: {item.phone}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg">
                Website: {item.web}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg">
                Your review: {item.visitedReview}
              </Text>
              <Text className="text-gray-200 mt-2 text-lg pb-5">
                Date: {formatDateTime(item.visitedDate)}
              </Text>

              <TouchableOpacity
                className="bg-green-500 rounded-xl min-h-[62px] justify-center items-center "
                onPress={() => handleCancel(item.visitedId)}
              >
                <Text className="text-black font-psemibold text-lg">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <EmptyState
            title="No Centers visited yet :("
            subtitle="Visit a center and let us know your experience!"
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-green-500 rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              subtitle={user?.email}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
