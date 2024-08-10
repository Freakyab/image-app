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
            `http://192.168.1.8:5000/imageUploader/get/${limit}`,
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
              <Pressable
                onPress={() =>
                  downloadImage({
                    fileName: item.image,
                    base64Image: item.link,
                  })
                }>
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
  
    const downloadImage = async ({ fileName, base64Image }) => {
      try {
        console.log("Downloading image...",fileName);
        // Ask the user to select a directory or file path to save the image
        // const res = await DocumentPicker.pick({
        //   type: [DocumentPicker.types.allFiles],
        // });
  
        // Get the file path from the selected directory
        const filePath = res[0].uri.replace(/\/[^/]+$/, ""); // Get the directory path
        const fullPath = `${filePath}/${fileName}`;
  
        // Write the base64 image to the selected path
        await RNFS.writeFile(fullPath, base64Image, "base64");
  
        Alert.alert("Success", `Image saved to ${fullPath}`);
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User canceled the picker
          console.log("User canceled the picker");
        } else {
          console.error(err);
          Alert.alert("Error", "Failed to save the image");
        }
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
      width: 400,
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
  