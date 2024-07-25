import {
  Account,
  Client,
  ID,
  Avatars,
  Databases,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.daddycoders.ev_charging_finder",
  projectId: "669b67980003f76de869",
  storageId: "669b6807000e100365e6",
  databaseId: "669b67d2000112bbf3e3",
  userCollectionId: "669b67d70035f80c9c7e",
  stationsCollectionId: "66a26375001a6233e0c0",
  visitedCollectionId: "66a26396003160e88f4c",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.stationsCollectionId,
      [Query.orderDesc("$createdAt")]
    );
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.stationsCollectionId,
      [Query.search("title", query)]
    );

    if (!posts) throw new Error("Something went wrong");

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getStationsById = async (id) => {
  try {
    const stations = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.stationsCollectionId,
      id
    );
    return stations;
  } catch (error) {
    console.error("Error fetching service stations:", error);
    throw new Error(error.message);
  }
};

export const markVisited = async (creator, stationsId, visitedDate, review) => {
  try {
    const visitedData = {
      date: visitedDate.toISOString(),
      review: review, // Include review text
      creator: creator,
      stationsId: stationsId,
    };

    const response = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.visitedCollectionId,
      ID.unique(),
      visitedData
    );

    return response;
  } catch (error) {
    console.error("Error marking visited:", error);
    throw new Error(error.message);
  }
};

export const getUserVisitedStations = async (userId) => {
  try {
    const visitedsResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.visitedCollectionId,
      [Query.equal("creator", userId)]
    );
    const visiteds = visitedsResponse.documents;

    const stationssPromises = visiteds.map(async (visited) => {
      const stationsId = visited.stationsId.$id;

      const stations = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.stationsCollectionId,
        stationsId
      );

      return {
        ...stations,
        visitedDate: visited.date,
        visitedReview: visited.review,
        visitedId: visited.$id,
      };
    });

    const stationss = await Promise.all(stationssPromises);

    return stationss;
  } catch (error) {
    console.error("Error fetching visited service stationss:", error);
    throw new Error(error.message);
  }
};

export const removeVisited = async (visitedId) => {
  try {
    const response = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.visitedCollectionId,
      visitedId
    );
    return response;
  } catch (error) {
    console.error("Error removing visited:", error);
    throw new Error(error.message);
  }
};

export const getReviewsByStationId = async (stationsId) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.visitedCollectionId,
      [Query.equal("stationsId", stationsId)]
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw new Error(error.message);
  }
};
