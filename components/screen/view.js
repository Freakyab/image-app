import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";
import React, { useEffect, useState, useCallback, useMemo } from "react";
// import RNFS from "react-native-fs";
// import DocumentPicker from "react-native-document-picker";
import { StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export default function ViewPage({ route }) {
  const [data, setData] = useState([]);
  const [limit, setLimit] = useState(2);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const { resetAllLoaded, doc } = route.params || {};
  const uniqueIds = useMemo(
    () => new Set(data.map((item) => item._id)),
    [data]
  );

  useEffect(() => {
    if (resetAllLoaded && doc) {
      if (!uniqueIds.has(doc._id)) {
        setData((prevData) => [doc, ...prevData]);
      }
    }
  }, [resetAllLoaded, doc]);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (loading || (allLoaded && !isRefresh)) return;

      setLoading(true);

      try {
        const response = await fetch(
          `https://freaky-api.vercel.app/imageUploader/get/${limit}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const json = await response.json();
        if (json.length > 0) {
          const newItems = json.filter((item) => !uniqueIds.has(item._id));
          if (newItems.length > 0) {
            setData((prevData) => [...prevData, ...newItems]);
            newItems.forEach((item) => uniqueIds.add(item._id));
            setLimit(limit + 2);
          }
        } else {
          setAllLoaded(true); // No more data to load
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [loading, allLoaded, limit, uniqueIds]
  );

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={styles.itemContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.imageName}>{item.image}</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <MaterialIcons name="delete" size={30} color="#ff6000" />
            <Pressable onPress={() => downloadImage( item.link,item.image)}>
              <AntDesign name="clouddownload" size={30} color="#fffff1" />
            </Pressable>
          </View>
        </View>

        <Image source={{ uri: item.link }} style={styles.image} />
      </View>
    ),
    []
  );

  const renderFooter = () => {
    if (!loading) return null;
    return <ActivityIndicator style={{ marginVertical: 20 }} />;
  };

  
const saveBase64Image = async (base64String, fileName) => {
  try {
    if (typeof base64String !== 'string') {
      console.error('Invalid base64String:', base64String);
      throw new Error('base64String must be a valid string');
    }

    // Remove the data URI prefix if it exists
    const base64Data = base64String.includes('base64,')
      ? base64String.split('base64,')[1]
      : base64String;

    // Ensure file name is valid
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return fileUri;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw error;
  }
};

const downloadImage = async (base64String, fileName) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status === 'granted') {
      const newFileName = fileName + '.jpg';
      const fileUri = await saveBase64Image(base64String, newFileName);
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync('Download', asset, false);

      console.log('Image saved to gallery!');
    } else {
      console.log('Permission to access media library denied');
    }
  } catch (error) {
    console.error('Error saving image to gallery:', error);
  }
};

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          setLimit(2);
          setData([]);
          setAllLoaded(false);
          fetchData(true);
        }}
        style={styles.refreshTab}>
        <FontAwesome
          name="refresh"
          size={24}
          color="white"
          style={styles.refreshButton}
        />
      </Pressable>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        onEndReached={fetchData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && <Text style={styles.noData}>No images available</Text>
        }
        initialNumToRender={4} // Render more items initially
        windowSize={11} // Increase the window size for faster scrolling
        removeClippedSubviews={true} // Remove off-screen views for performance
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1e1e1e",
  },
  itemContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#333",
    marginHorizontal: 10,
    marginLeft: "auto",
    marginRight: "auto",
    width: "90%", // Adjusted width for better alignment
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 10, // Added margin to separate from the image
  },
  imageName: {
    color: "white",
    fontWeight: "bold",
    textTransform: "capitalize",
    fontSize: 16,
    maxWidth: "70%",
  },
  image: {
    width: "100%",
    height: 400,
    borderRadius: 10,
    borderColor: "gray",
    borderWidth: 1,
    resizeMode: "cover",
  },
  noData: {
    fontSize: 18,
    color: "gray",
  },
  refreshButton: {
    padding: 15,
    backgroundColor: "#6200ee",
    borderRadius: 100,
    elevation: 5, // Added shadow for better visibility
  },
  refreshTab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
});
