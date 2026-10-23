import { View, Text } from "react-native";

export default function ConsultaScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0B0F19",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#FFFFFF", fontSize: 24 }}>
        Consultar solicitações
      </Text>
    </View>
  );
}