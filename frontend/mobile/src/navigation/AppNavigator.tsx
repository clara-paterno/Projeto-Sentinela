
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ConsultaScreen from "../screens/ConsultaScreen";
import AjudaScreen from "../screens/AjudaScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NovaSolicitacaoScreen from "../screens/NovaSolicitacaoScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  function getTabInfo(name: string, focused: boolean) {
    let label = "Início";
    let icon: IconName = focused ? "home" : "home-outline";

    if (name === "Consulta") {
      label = "Consultar";
      icon = focused ? "search" : "search-outline";
    } else if (name === "Ajuda") {
      label = "Ajuda";
      icon = focused
        ? "help-circle"
        : "help-circle-outline";
    }

    return { label, icon };
  }

  return (
    <View
      style={[
        styles.tabBar,
        { bottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { label, icon } = getTabInfo(
          route.name,
          focused
        );

        function onPress() {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={() =>
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              })
            }
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={[
              styles.tabItem,
              focused && styles.tabItemAtivo,
            ]}
          >
            <Ionicons
              name={icon}
              size={23}
              color={focused ? "#FFFFFF" : "#9AA4B2"}
            />

            <Text
              style={[
                styles.tabTexto,
                focused && styles.tabTextoAtivo,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AbasNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: "#0B0F19",
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Consulta" component={ConsultaScreen} />
      <Tab.Screen name="Ajuda" component={AjudaScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="Abas"
          component={AbasNavigator}
        />

        <Stack.Screen
          name="NovaSolicitacao"
          component={NovaSolicitacaoScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    left: 18,
    right: 18,
    height: 72,
    backgroundColor: "#171C2B",
    borderRadius: 24,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    elevation: 5,
    zIndex: 10,
  },

  tabItem: {
    flex: 1,
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },

  tabItemAtivo: {
    backgroundColor: "#2F80FF",
  },

  tabTexto: {
    fontSize: 11,
    color: "#9AA4B2",
    fontWeight: "500",
  },

  tabTextoAtivo: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
