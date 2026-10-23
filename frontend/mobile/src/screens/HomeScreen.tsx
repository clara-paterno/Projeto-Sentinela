
import React from "react";
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

type Rotas = {
  Home: undefined;
  Consulta: undefined;
  Ajuda: undefined;
  NovaSolicitacao: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<Rotas>>();

  function registrarSolicitacao() {
    navigation.navigate("NovaSolicitacao");
  }

  function acompanharSolicitacao() {
    navigation.navigate("Consulta");
  }

  function abrirAjuda() {
    navigation.navigate("Ajuda");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B0F19"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>SENTINELA</Text>
          </View>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={abrirAjuda}
            accessibilityLabel="Abrir ajuda"
          >
            <Ionicons
              name="help-circle-outline"
              size={25}
              color="#2F80FF"
            />
          </TouchableOpacity>
        </View>

        {/* SERVIÇOS */}
        <View style={styles.servicesCard}>
          <Text style={styles.sectionTitle}>Serviços</Text>
          <Text style={styles.sectionDescription}>
            O que você deseja fazer hoje?
          </Text>

          <View style={styles.servicesRow}>
            <TouchableOpacity
              style={styles.serviceItem}
              onPress={registrarSolicitacao}
            >
              <View style={styles.serviceCircle}>
                <Ionicons
                  name="shield-outline"
                  size={24}
                  color="#2F80FF"
                />
              </View>
              <Text style={styles.serviceLabel}>Denúncia</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceItem}
              onPress={registrarSolicitacao}
            >
              <View style={styles.serviceCircle}>
                <Ionicons
                  name="document-text-outline"
                  size={24}
                  color="#2F80FF"
                />
              </View>
              <Text style={styles.serviceLabel}>Ocorrência</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceItem}
              onPress={acompanharSolicitacao}
            >
              <View style={styles.serviceCircle}>
                <Ionicons
                  name="search-outline"
                  size={24}
                  color="#2F80FF"
                />
              </View>
              <Text style={styles.serviceLabel}>Consulta</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceItem}
              onPress={abrirAjuda}
            >
              <View style={styles.serviceCircle}>
                <Ionicons
                  name="help-circle-outline"
                  size={24}
                  color="#2F80FF"
                />
              </View>
              <Text style={styles.serviceLabel}>Ajuda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SAIBA MAIS */}
        <View style={styles.saibaMaisHeader}>
          <Text style={styles.saibaMaisTitulo}>Saiba mais</Text>
          <Ionicons
            name="information-circle-outline"
            size={21}
            color="#9AA4B2"
          />
        </View>

        {/* CARDS INFORMATIVOS */}
        <View style={styles.grid}>
          <View style={styles.cardPequeno}>
            <Ionicons
              name="shield-outline"
              size={28}
              color="#2F80FF"
            />
            <Text style={styles.cardPequenoTitulo}>
              Denúncia
            </Text>
            <Text style={styles.cardPequenoTexto}>
              Comunique situações suspeitas ou irregulares.
              Você pode optar pelo anonimato.
            </Text>
          </View>

          <View style={styles.cardPequeno}>
            <Ionicons
              name="document-text-outline"
              size={28}
              color="#2F80FF"
            />
            <Text style={styles.cardPequenoTitulo}>
              Ocorrência
            </Text>
            <Text style={styles.cardPequenoTexto}>
              Solicite atendimento da GCM e informe seus dados
              para acompanhamento.
            </Text>
          </View>
        </View>

        {/* CARD PRINCIPAL DE AÇÕES */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>
            Como podemos ajudar?
          </Text>

          <Text style={styles.actionDescription}>
            Registre uma nova solicitação ou acompanhe
            o andamento de um atendimento existente.
          </Text>

          <TouchableOpacity
            style={styles.botaoPrimario}
            onPress={registrarSolicitacao}
          >
            <Ionicons
              name="add-circle-outline"
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.botaoPrimarioTexto}>
              Registrar solicitação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={acompanharSolicitacao}
          >
            <Ionicons
              name="search-outline"
              size={21}
              color="#FFFFFF"
            />
            <Text style={styles.botaoSecundarioTexto}>
              Acompanhar solicitação
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  boasVindas: {
    color: "#9AA4B2",
    fontSize: 14,
    marginBottom: 4,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1.5,
  },

  headerIcon: {
    width: 46,
    height: 46,
    backgroundColor: "#171C2B",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },

  servicesCard: {
    backgroundColor: "#171C2B",
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 5,
  },

  sectionDescription: {
    color: "#9AA4B2",
    fontSize: 13,
    marginBottom: 22,
  },

  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  serviceItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },

  serviceCircle: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#1D2333",
    borderWidth: 1,
    borderColor: "#2F80FF",
    justifyContent: "center",
    alignItems: "center",
  },

  serviceLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },

  saibaMaisHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  saibaMaisTitulo: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
  },

  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  cardPequeno: {
    flex: 1,
    backgroundColor: "#171C2B",
    borderRadius: 22,
    padding: 17,
    minHeight: 195,
  },

  cardPequenoTitulo: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "700",
    marginTop: 14,
    marginBottom: 8,
  },

  cardPequenoTexto: {
    color: "#9AA4B2",
    fontSize: 12,
    lineHeight: 19,
  },

  actionCard: {
    backgroundColor: "#111B35",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1F3F7A",
  },

  actionTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "700",
    marginBottom: 10,
  },

  actionDescription: {
    color: "#AFC3E6",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 22,
  },

  botaoPrimario: {
    backgroundColor: "#2F80FF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginBottom: 12,
  },

  botaoPrimarioTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  botaoSecundario: {
    backgroundColor: "#1D2333",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#2B3448",
  },

  botaoSecundarioTexto: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
