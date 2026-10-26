
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  consultarSolicitacao,
  type SolicitacaoConsultada,
} from "../services/solicitacoes";

const statusLabels: Record<
  SolicitacaoConsultada["status"],
  string
> = {
  RECEBIDA: "Recebida",
  EM_ANALISE: "Em análise",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDA: "Concluída",
  ENCERRADA_SEM_ATENDIMENTO: "Encerrada sem atendimento",
};

export default function ConsultaScreen() {
  const [protocolo, setProtocolo] = useState("");
  const [codigoConsulta, setCodigoConsulta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] =
    useState<SolicitacaoConsultada | null>(null);

  async function consultar() {
    if (carregando) return;

    setErro("");
    setResultado(null);

    const protocoloLimpo = protocolo.trim();
    const codigoLimpo = codigoConsulta.trim();

    const formatoUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!formatoUUID.test(protocoloLimpo)) {
      setErro("Informe um protocolo UUID válido.");
      return;
    }

    if (!/^[0-9a-f]{48}$/i.test(codigoLimpo)) {
      setErro("O código de consulta deve ter 48 caracteres hexadecimais.");
      return;
    }

    try {
      setCarregando(true);

      const dados = await consultarSolicitacao({
        protocolo: protocoloLimpo,
        codigoConsulta: codigoLimpo,
      });

      setResultado(dados);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível consultar a solicitação."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Ionicons
            name="search-circle-outline"
            size={38}
            color="#2F80FF"
          />

          <Text style={styles.titulo}>
            Consultar solicitação
          </Text>

          <Text style={styles.subtitulo}>
            Acompanhe o andamento da sua denúncia
            ou ocorrência.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Protocolo</Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu protocolo"
            placeholderTextColor="#9AA4B2"
            value={protocolo}
            onChangeText={setProtocolo}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>
            Código de consulta
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite o código privado"
            placeholderTextColor="#9AA4B2"
            value={codigoConsulta}
            onChangeText={setCodigoConsulta}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />

          <Text style={styles.dica}>
            Utilize os dados recebidos após registrar
            sua solicitação.
          </Text>

          {erro !== "" && (
            <View style={styles.erroCard}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#FF7777"
              />
              <Text style={styles.erroTexto}>
                {erro}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.botao,
              carregando && styles.botaoDesabilitado,
            ]}
            onPress={consultar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.botaoTexto}>
                  Consultar
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {resultado && (
          <View style={styles.resultadoCard}>
            <Text style={styles.resultadoTitulo}>
              Sua solicitação
            </Text>

            <View style={styles.statusCard}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#2F80FF"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.dica}>
                  Status atual
                </Text>

                <Text style={styles.statusTexto}>
                  {statusLabels[resultado.status] ??
                    resultado.status}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>
              Tipo
            </Text>
            <Text style={styles.valor}>
              {resultado.tipo === "DENUNCIA"
                ? "Denúncia"
                : "Ocorrência"}
            </Text>

            <Text style={styles.label}>
              Categoria
            </Text>
            <Text style={styles.valor}>
              {resultado.categoria}
            </Text>

            <Text style={styles.label}>
              Descrição
            </Text>
            <Text style={styles.valor}>
              {resultado.descricao}
            </Text>

            <Text style={styles.label}>
              Registrada em
            </Text>
            <Text style={styles.valor}>
              {new Date(
                resultado.criadaEm
              ).toLocaleString("pt-BR")}
            </Text>

            <Text style={styles.label}>
              Última atualização
            </Text>
            <Text style={styles.valor}>
              {new Date(
                resultado.atualizadaEm
              ).toLocaleString("pt-BR")}
            </Text>
          </View>
        )}
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
    paddingTop: 20,
    paddingBottom: 120,
  },

  header: {
    marginBottom: 25,
    gap: 10,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "700",
  },

  subtitulo: {
    color: "#9AA4B2",
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    backgroundColor: "#171C2B",
    borderRadius: 24,
    padding: 20,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 9,
    marginTop: 12,
  },

  input: {
    backgroundColor: "#1D2333",
    color: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B3448",
    paddingHorizontal: 15,
    paddingVertical: 15,
    fontSize: 14,
  },

  dica: {
    color: "#9AA4B2",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },

  botao: {
    backgroundColor: "#2F80FF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 23,
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  botaoTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  erroCard: {
    backgroundColor: "#331D2B",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 15,
  },

  erroTexto: {
    color: "#FF9999",
    fontSize: 13,
    flex: 1,
  },

  resultadoCard: {
    backgroundColor: "#171C2B",
    borderRadius: 24,
    padding: 20,
    marginTop: 22,
  },

  resultadoTitulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  statusCard: {
    backgroundColor: "#111B35",
    borderWidth: 1,
    borderColor: "#1F3F7A",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },

  statusTexto: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  valor: {
    color: "#AFC3E6",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6,
  },
});
