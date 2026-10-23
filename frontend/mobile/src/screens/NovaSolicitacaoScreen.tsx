import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

export default function NovaSolicitacaoScreen() {
  const [tipo, setTipo] = useState<"DENUNCIA" | "OCORRENCIA">("DENUNCIA");

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
    <View>
      <Text style= {styles.sectionTitle}>Nova solicitação</Text>
      <View style={styles.tipoContainer}>
        <TouchableOpacity 
        style={[
          styles.botaoTipo,
          tipo === "DENUNCIA" && styles.botaoSelecionado
        ]} 
        onPress={()=> setTipo("DENUNCIA")}>
          <Ionicons name="shield-outline" size={24} color="#2F80FF" />
          <Text style ={styles.sectionDescription}>Denúncia</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[
          styles.botaoTipo,
          tipo === "OCORRENCIA" && styles.botaoSelecionado
          ]} 
          onPress={()=> setTipo("OCORRENCIA")}>
          <Ionicons name="document-text-outline" size={24} color="#2F80FF" />
          <Text style = {styles.sectionDescription}>Ocorrência</Text>
        </TouchableOpacity>
      </View>
      {tipo === "DENUNCIA" && <Text>Deseja permanecer anônimo?</Text>}
      {tipo === "OCORRENCIA" && <Text>Informe seus dados para contato.</Text>}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  tipoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 5,
  },
  
  sectionDescription: {
    color: "#b0b9c6",
    fontSize: 14,
    fontWeight: "bold",
  },

  botaoTipo: {
    flex: 1,
    backgroundColor: "#171C2B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },

  botaoSelecionado: {
    borderColor: "#2F80FF",
    borderWidth: 2,
    backgroundColor: "#111B35",
  },
});
