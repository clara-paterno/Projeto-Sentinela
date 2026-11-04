import { View, Text } from "react-native";
import TelefonesUteis from '../components/TelefonesUteis';

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
      <TelefonesUteis />
    </View>
  );
}