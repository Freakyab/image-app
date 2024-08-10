import { Image, StyleSheet, Platform, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import Upload from "./../../components/screen/view";
import ViewPage from "./../../components/screen/upload";

export default function HomeScreen() {
  const Tab = createBottomTabNavigator();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer independent={true}>
        <StatusBar style="light" backgroundColor="black" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: "#121212",
              height: 60,
              paddingBottom: 10,
            },
            headerTintColor: "white",
            headerStyle: {
              backgroundColor: "#121212",
            },
            tabBarActiveTintColor: "purple",
            tabBarShowLabel: false,
          }}>
          <Tab.Screen
            name="View"
            component={ViewPage}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="view-list" size={32} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Upload"
            component={Upload}
            options={{
              tabBarIcon: ({ color }) => (
                <Feather name="upload" size={32} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
