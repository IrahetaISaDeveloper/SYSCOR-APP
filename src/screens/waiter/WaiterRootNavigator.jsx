import React, { useState } from "react";
import WaiterDashboardScreen from "../waiter/WaiterDashboardScreen";
import WaiterProfileScreen from "../waiter/WaiterProfileScreen";

export default function WaiterRootNavigator() {
  const [screen, setScreen] = useState("dashboard"); // "dashboard" | "profile"

  if (screen === "profile") {
    return <WaiterProfileScreen onBack={() => setScreen("dashboard")} />;
  }

  return <WaiterDashboardScreen onOpenProfile={() => setScreen("profile")} />;
}