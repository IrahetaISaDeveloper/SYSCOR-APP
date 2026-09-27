import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import EmployeeTabBar from "../components/commons/EmployeeTabBar";

import DeliveriesScreen from "../screens/delivery/DeliveriesScreen";
import DeliveryDetailScreen from "../screens/delivery/DeliveryDetailScreen";
import DeliveryRouteScreen from "../screens/delivery/DeliveryRouteScreen";
import DeliveryConfirmScreen from "../screens/delivery/DeliveryConfirmScreen";
import DeliveryHistoryScreen from "../screens/delivery/DeliveryHistoryScreen";
import DeliveryProfileScreen from "../screens/delivery/DeliveryProfileScreen";

const Tab = createBottomTabNavigator();
const DeliveriesStack = createNativeStackNavigator();

function DeliveriesStackNavigator() {
  return (
    <DeliveriesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F7F3E9" },
      }}
    >
      <DeliveriesStack.Screen name="DeliveriesList" component={DeliveriesScreen} />
      <DeliveriesStack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
      <DeliveriesStack.Screen
        name="DeliveryRoute"
        component={DeliveryRouteScreen}
        options={{ animation: "slide_from_right" }}
      />
      <DeliveriesStack.Screen
        name="DeliveryConfirm"
        component={DeliveryConfirmScreen}
        options={{ animation: "slide_from_bottom" }}
      />
    </DeliveriesStack.Navigator>
  );
}

export default function DeliveryNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <EmployeeTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Deliveries"
        component={DeliveriesStackNavigator}
        options={{ tabBarLabel: "Entregas", tabBarIcon: "two_wheeler" }}
      />
      <Tab.Screen
        name="History"
        component={DeliveryHistoryScreen}
        options={{ tabBarLabel: "Historial", tabBarIcon: "history" }}
      />
      <Tab.Screen
        name="Profile"
        component={DeliveryProfileScreen}
        options={{ tabBarLabel: "Perfil", tabBarIcon: "person" }}
      />
    </Tab.Navigator>
  );
}
