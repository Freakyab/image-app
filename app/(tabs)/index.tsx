import { Text, StyleSheet, Platform, SafeAreaView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import Upload from "./../../components/screen/upload";
import ViewPage from "./../../components/screen/view";

export default function HomeScreen() {
  const Tab = createBottomTabNavigator();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#121212" />
      <NavigationContainer independent={true}>
        <Tab.Navigator
          screenOptions={{
            headerStatusBarHeight:2,
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
