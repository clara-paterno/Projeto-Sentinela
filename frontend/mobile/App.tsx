import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

export default function App() {
  function registrarSolicitacao() {
    console.log("Registrar solicitação");
  }

  function acompanharSolicitacao() {
    console.log("Acompanhar solicitação");
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B0F19" />

        <View style={styles.header}>
          <Text style={styles.boasVindas}>Bem-vinda ao</Text>
          <Text style={styles.logo}>SENTINELA</Text>
          <Text style={styles.subtitulo}>
            Registre denúncias e ocorrências, acompanhe o atendimento e fique
            por dentro do andamento da sua solicitação.
          </Text>
        </View>

        <View style={styles.cardPrincipal}>
          <Text style={styles.cardTitulo}>O que você deseja fazer?</Text>
          <Text style={styles.cardTexto}>
            Escolha uma das opções abaixo para começar.
          </Text>

          <TouchableOpacity
            style={styles.botaoPrimario}
            onPress={registrarSolicitacao}
          >
            <Text style={styles.botaoPrimarioTexto}>
              Registrar solicitação
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSecundario}
            onPress={acompanharSolicitacao}
          >
            <Text style={styles.botaoSecundarioTexto}>
              Acompanhar solicitação
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          <View style={styles.cardPequeno}>
            <Text style={styles.cardPequenoTitulo}>Denúncia</Text>
            <Text style={styles.cardPequenoTexto}>
              Registre situações que podem ser feitas de forma anônima.
            </Text>
          </View>

          <View style={styles.cardPequeno}>
            <Text style={styles.cardPequenoTitulo}>Ocorrência</Text>
            <Text style={styles.cardPequenoTexto}>
              Solicite atendimento e informe seus dados para retorno.
            </Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardInfoTitulo}>Acompanhamento rápido</Text>
          <Text style={styles.cardInfoTexto}>
            Após o envio, você receberá um protocolo e um código de consulta
            para verificar o status da solicitação.
          </Text>
        </View>

        <View style={styles.bottomBar}>
          <View style={styles.bottomItemAtivo}>
            <Text style={styles.bottomTextoAtivo}>Início</Text>
          </View>

          <View style={styles.bottomItem}>
            <Text style={styles.bottomTexto}>Consultar</Text>
          </View>

          <View style={styles.bottomItem}>
            <Text style={styles.bottomTexto}>Ajuda</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F19",
    paddingHorizontal: 18,
  },

  header: {
    paddingTop: 8,
    marginBottom: 20,
  },

  boasVindas: {
    color: "#9AA4B2",
    fontSize: 16,
    marginBottom: 6,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
  },

  subtitulo: {
    color: "#9AA4B2",
    fontSize: 14,
    lineHeight: 22,
  },

  cardPrincipal: {
    backgroundColor: "#171C2B",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },

  cardTitulo: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },

  cardTexto: {
    color: "#9AA4B2",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  botaoPrimario: {
    backgroundColor: "#2F80FF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  botaoPrimarioTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  botaoSecundario: {
    backgroundColor: "#1D2333",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2B3448",
  },

  botaoSecundarioTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  cardPequeno: {
    flex: 1,
    backgroundColor: "#171C2B",
    borderRadius: 22,
    padding: 18,
    minHeight: 140,
  },

  cardPequenoTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },

  cardPequenoTexto: {
    color: "#9AA4B2",
    fontSize: 13,
    lineHeight: 20,
  },

  cardInfo: {
    backgroundColor: "#111B35",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#1F3F7A",
  },

  cardInfoTitulo: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 8,
  },

  cardInfoTexto: {
    color: "#AFC3E6",
    fontSize: 14,
    lineHeight: 21,
  },

  bottomBar: {
    marginTop: "auto",
    marginBottom: 10,
    backgroundColor: "#171C2B",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bottomItemAtivo: {
    flex: 1,
    backgroundColor: "#2F80FF",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },

  bottomItem: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },

  bottomTextoAtivo: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },

  bottomTexto: {
    color: "#8E98A8",
    fontWeight: "500",
    fontSize: 13,
  },
});