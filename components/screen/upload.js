import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";

export default function Upload({ navigation }) {
  const [isLoading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState({
    uri: null,
    base64: null,
    image: "",
  });

  const handleSubmit = async () => {
    setLoading(true);

    if (selectedImage.uri) {
      setLoading(true);
      fetch("https://freaky-api.vercel.app/imageUploader/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage.image,
          link: selectedImage.base64,
        }),
      })
        .then((response) => response.json())
        .then((json) => {
          if (json.status) {
            ToastAndroid.show(
              "Image uploaded successfully.",
              ToastAndroid.SHORT
            );
            navigation.navigate("View", {
              resetAllLoaded: true,
              doc: json.doc,
            });
            setSelectedImage({
              uri: null,
              base64: null,
              image: "",
            });
          } else {
            ToastAndroid.show(
              "An error occurred while uploading the image.",
              ToastAndroid.SHORT
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred while uploading the image.");
        });

      setLoading(false);
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage({
        uri: result.assets[0].uri,
        base64: "data:image/jpeg;base64," + result.assets[0].base64 ,
        image: "",
      });
    } else {
      alert("You did not select any image.");
    }

    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {selectedImage.uri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.image} />
          <Pressable
            style={styles.close}
            onPress={() =>
              setSelectedImage({
                uri: null,
                base64: null,
                image: "",
              })
            }>
            <Text style={styles.closeText}>x</Text>
          </Pressable>
          <KeyboardAvoidingView>
            <TextInput
              value={selectedImage.image}
              onChangeText={(text) =>
                setSelectedImage({ ...selectedImage, image: text })
              }
              placeholder="Enter the image name..."
              style={styles.input}
            />
          </KeyboardAvoidingView>
        </View>
      )}
      <Pressable style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.text}>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color="#ffffff"
              style={{ paddingRight: 10 }}
            />
          )}
          {isLoading
            ? "Loading..."
            : selectedImage.uri
            ? "Upload Image"
            : "Select Image"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111111",
  },
  btn: {
    backgroundColor: "#6200ee",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    marginTop: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    padding: 8,
    color: "#ffffff",
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
    resizeMode: "cover",
  },
  imageContainer: {
    position: "relative",
  },
  close: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#6200ee",
    borderRadius: 100,
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 1,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    position: "relative",
    color: "white",
    bottom: 2,
    fontSize: 20,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    height: 60,
    marginVertical: 20,
    paddingLeft: 10,
  },
});
