import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import WaiterTabBar from "../components/waiter/WaiterTabBar";
import { DeliveryProvider } from "../hooks/useDelivery";
import OrderChatScreen from "@syscor/shared/src/screens/OrderChatScreen";
import DeliveryPushManager from "../components/delivery/DeliveryPushManager";
import { useTheme } from "../theme/ThemeContext";

import DeliveriesScreen from "../screens/delivery/DeliveriesScreen";
import DeliveryDetailScreen from "../screens/delivery/DeliveryDetailScreen";
import DeliveryRouteScreen from "../screens/delivery/DeliveryRouteScreen";
import DeliveryConfirmScreen from "../screens/delivery/DeliveryConfirmScreen";
import DeliveryHistoryScreen from "../screens/delivery/DeliveryHistoryScreen";
import DeliveryProfileScreen from "../screens/delivery/DeliveryProfileScreen";

const Tab = createBottomTabNavigator();

// Pantallas a pantalla completa: sin barra inferior (el chat necesita el
// espacio para el teclado).
const HIDE_TAB_BAR_ON = ["OrderChat"];
const tabBarHidden = ({ state }) =>
  HIDE_TAB_BAR_ON.includes(getFocusedRouteNameFromRoute(state.routes[state.index]));
const DeliveriesStack = createNativeStackNavigator();

function DeliveriesStackNavigator() {
  const { p } = useTheme();
  return (
    <DeliveriesStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: p.bg },
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
      {/* Chat directo con el cliente del pedido */}
      <DeliveriesStack.Screen
        name="OrderChat"
        component={OrderChatScreen}
        options={{ animation: "slide_from_right" }}
      />
    </DeliveriesStack.Navigator>
  );
}

export default function DeliveryNavigator() {
  return (
    <DeliveryProvider>
      <DeliveryPushManager />
      {/* Mismo diseño que la barra del mesero: Entregas va en el botón central. */}
      <Tab.Navigator
        initialRouteName="Deliveries"
        tabBar={(props) => (tabBarHidden(props) ? null : <WaiterTabBar {...props} />)}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="History"
          component={DeliveryHistoryScreen}
          options={{ tabBarLabel: "Historial", tabBarIcon: "time-outline" }}
        />
        <Tab.Screen
          name="Deliveries"
          component={DeliveriesStackNavigator}
          options={{ tabBarLabel: "Entregas", tabBarIcon: "moped", tabBarIconSet: "material-community", tabBarCenter: true }}
        />
        <Tab.Screen
          name="Profile"
          component={DeliveryProfileScreen}
          options={{ tabBarLabel: "Perfil", tabBarIcon: "person-outline" }}
        />
      </Tab.Navigator>
    </DeliveryProvider>
  );
}
