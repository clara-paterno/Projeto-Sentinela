import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";

import {
  buscarCategorias,
  criarSolicitacao,
  enviarAnexos,
  type Categoria,
  type TipoSolicitacao,
  type SolicitacaoCriada,
  type CriarSolicitacaoInput,
} from "../services/solicitacoes";

type EstadoUpload = "sem_imagens" | "enviando" | "concluido" | "falhou";

export default function NovaSolicitacaoScreen() {
  const navigation = useNavigation();

  const [tipo, setTipo] = useState<TipoSolicitacao>("DENUNCIA");
  const [anonima, setAnonima] = useState(true);
  const [imagens, setImagens] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState("");
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);
  const [erroCategorias, setErroCategorias] = useState("");

  const [descricao, setDescricao] = useState("");
  const [enderecoOcorrencia, setEnderecoOcorrencia] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [enderecoResidencial, setEnderecoResidencial] = useState("");
  const [envolvidoNome, setEnvolvidoNome] = useState("");
  const [envolvidoEndereco, setEnvolvidoEndereco] = useState("");
  const [envolvidoDescricao, setEnvolvidoDescricao] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState("");
  const [resultado, setResultado] = useState<SolicitacaoCriada | null>(null);
  const [estadoUpload, setEstadoUpload] = useState<EstadoUpload>("sem_imagens");
  const [erroUpload, setErroUpload] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      try {
        const dados = await buscarCategorias();
        if (!Array.isArray(dados)) {
          throw new Error("Formato de categorias inesperado");
        }
        if (ativo) setCategorias(dados);
      } catch (erro) {
        if (ativo) {
          setErroCategorias(
            erro instanceof Error ? erro.message : "Erro ao carregar categorias"
          );
        }
      } finally {
        if (ativo) setCarregandoCategorias(false);
      }
    }
    void carregar();
    return () => { ativo = false; };
  }, []);

  const categoriasFiltradas = categorias.filter(
    (categoria) => categoria.tipo === tipo && categoria.ativa !== false
  );

  function selecionarTipo(novoTipo: TipoSolicitacao) {
    if (novoTipo === tipo) return;
    setTipo(novoTipo);
    setCategoriaId("");
    setAnonima(novoTipo === "DENUNCIA");
    if (novoTipo !== "DENUNCIA") setImagens([]);
    setErroFormulario("");
  }

  async function selecionarImagens() {
    try {
      const selecao = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 3,
        quality: 1,
      });
      if (selecao.canceled) return;

      const escolhidas = selecao.assets;
      if (escolhidas.length === 0 || escolhidas.length > 3) {
        setErroFormulario("Selecione de 1 a 3 imagens.");
        return;
      }
      for (const imagem of escolhidas) {
        if (imagem.fileSize !== undefined && imagem.fileSize > 5 * 1024 * 1024) {
          setErroFormulario("Cada imagem deve ter no máximo 5 MB.");
          return;
        }
        if (!["image/jpeg", "image/png", "image/webp"].includes(imagem.mimeType ?? "")) {
          setErroFormulario("Use somente imagens JPEG, PNG ou WebP.");
          return;
        }
      }
      setErroFormulario("");
      setImagens(escolhidas);
    } catch (erro) {
      setErroFormulario(
        erro instanceof Error ? erro.message : "Não foi possível selecionar as imagens."
      );
    }
  }

  async function enviarSolicitacao() {
    if (carregando || resultado) return;
    setErroFormulario("");

    if (!categoriaId || !descricao.trim() || !enderecoOcorrencia.trim()) {
      setErroFormulario("Informe categoria, descrição e endereço da ocorrência.");
      return;
    }

    if (!anonima) {
      if (!nome.trim() || !enderecoResidencial.trim() || (!email.trim() && !telefone.trim())) {
        setErroFormulario("Informe nome, endereço residencial e pelo menos um contato.");
        return;
      }
      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setErroFormulario("Confira o e-mail informado.");
        return;
      }
      if (telefone.trim() && telefone.trim().length < 10) {
        setErroFormulario("O telefone precisa ter pelo menos 10 caracteres.");
        return;
      }
    }

    const dados: CriarSolicitacaoInput = {
      tipo,
      categoriaId,
      descricao: descricao.trim(),
      anonima,
      enderecoOcorrencia: enderecoOcorrencia.trim(),
    };

    if (!anonima) {
      dados.solicitanteNome = nome.trim();
      dados.solicitanteEnderecoResidencial = enderecoResidencial.trim();
      if (email.trim()) dados.solicitanteEmail = email.trim();
      if (telefone.trim()) dados.solicitanteTelefone = telefone.trim();
    }
    if (envolvidoNome.trim()) dados.envolvidoNome = envolvidoNome.trim();
    if (envolvidoEndereco.trim()) dados.envolvidoEndereco = envolvidoEndereco.trim();
    if (envolvidoDescricao.trim()) dados.envolvidoDescricao = envolvidoDescricao.trim();

    setCarregando(true);
    try {
      // O cadastro acontece UMA ÚNICA VEZ. Guardamos as credenciais imediatamente.
      const criada = await criarSolicitacao(dados);
      setResultado(criada);

      if (tipo !== "DENUNCIA" || imagens.length === 0) {
        setEstadoUpload("sem_imagens");
        return;
      }

      setEstadoUpload("enviando");
      setErroUpload("");
      try {
        await enviarAnexos(criada.protocolo, criada.codigoConsulta, imagens);
        setEstadoUpload("concluido");
      } catch (erro) {
        setErroUpload(
          erro instanceof Error ? erro.message : "Não foi possível enviar as imagens."
        );
        setEstadoUpload("falhou");
      }
    } catch (erro) {
      setErroFormulario(
        erro instanceof Error ? erro.message : "Não foi possível registrar a solicitação."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function tentarUploadNovamente() {
    if (!resultado || estadoUpload !== "falhou" || carregando || imagens.length === 0) return;
    setCarregando(true);
    setEstadoUpload("enviando");
    setErroUpload("");
    try {
      await enviarAnexos(resultado.protocolo, resultado.codigoConsulta, imagens);
      setEstadoUpload("concluido");
    } catch (erro) {
      setErroUpload(
        erro instanceof Error ? erro.message : "Não foi possível enviar as imagens."
      );
      setEstadoUpload("falhou");
    } finally {
      setCarregando(false);
    }
  }

  if (resultado) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Ionicons name="checkmark-circle" size={54} color="#2F80FF" />
          <Text style={styles.titulo}>Solicitação registrada!</Text>
          <Text style={styles.descricaoSecao}>
            Guarde o protocolo e o código privado para acompanhar a solicitação.
          </Text>

          <Text style={styles.label}>Protocolo</Text>
          <Text selectable style={styles.codigo}>{resultado.protocolo}</Text>
          <Text style={styles.label}>Código de consulta</Text>
          <Text selectable style={styles.codigo}>{resultado.codigoConsulta}</Text>

          {estadoUpload === "enviando" && (
            <View style={styles.aviso}>
              <ActivityIndicator color="#2F80FF" />
              <Text style={styles.textoSecundario}>Enviando imagens...</Text>
            </View>
          )}
          {estadoUpload === "concluido" && (
            <Text style={styles.sucesso}>Imagens enviadas com sucesso.</Text>
          )}
          {estadoUpload === "falhou" && (
            <View style={styles.aviso}>
              <Text style={styles.erro}>
                A solicitação foi salva, mas o envio das imagens falhou: {erroUpload}
              </Text>
              <Text style={styles.textoSecundario}>
                Não cadastre a denúncia novamente. Você pode tentar reenviar as imagens.
                Se a conexão caiu após o servidor recebê-las, uma nova tentativa pode duplicar anexos.
              </Text>
              <TouchableOpacity
                style={styles.botaoEnviar}
                onPress={tentarUploadNovamente}
                disabled={carregando}
              >
                <Text style={styles.botaoEnviarTexto}>Tentar enviar imagens novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[styles.botaoEnviar, estadoUpload === "enviando" && styles.botaoDesabilitado]}
            onPress={() => navigation.goBack()}
            disabled={estadoUpload === "enviando"}
          >
            <Text style={styles.botaoEnviarTexto}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={styles.voltar} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.voltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Nova solicitação</Text>
        <Text style={styles.descricaoSecao}>
          Preencha as informações abaixo para registrar sua solicitação.
        </Text>

        <Text style={styles.label}>Tipo de solicitação</Text>
        <View style={styles.tipoContainer}>
          {(["DENUNCIA", "OCORRENCIA"] as const).map((opcao) => (
            <TouchableOpacity
              key={opcao}
              onPress={() => selecionarTipo(opcao)}
              style={[styles.botaoTipo, tipo === opcao && styles.botaoSelecionado]}
            >
              <Ionicons
                name={opcao === "DENUNCIA" ? "shield-outline" : "document-text-outline"}
                size={26}
                color="#2F80FF"
              />
              <Text style={styles.textoBranco}>
                {opcao === "DENUNCIA" ? "Denúncia" : "Ocorrência"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Categoria *</Text>
        {carregandoCategorias ? (
          <ActivityIndicator color="#2F80FF" />
        ) : erroCategorias ? (
          <Text style={styles.erro}>{erroCategorias}</Text>
        ) : categoriasFiltradas.length === 0 ? (
          <Text style={styles.erro}>Nenhuma categoria disponível para este tipo.</Text>
        ) : (
          <View style={styles.categorias}>
            {categoriasFiltradas.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[styles.categoria, categoriaId === categoria.id && styles.botaoSelecionado]}
                onPress={() => setCategoriaId(categoria.id)}
              >
                <Text style={styles.textoBranco}>{categoria.nome}</Text>
                {categoriaId === categoria.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#2F80FF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.label}>Descrição *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descreva o que aconteceu..."
          placeholderTextColor="#9AA4B2"
          multiline
          textAlignVertical="top"
          maxLength={2000}
        />

        <Text style={styles.label}>Endereço da ocorrência *</Text>
        <TextInput
          style={styles.input}
          value={enderecoOcorrencia}
          onChangeText={setEnderecoOcorrencia}
          placeholder="Rua, número, bairro e referência"
          placeholderTextColor="#9AA4B2"
        />

        {tipo === "DENUNCIA" && (
          <View style={styles.anonimatoCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.textoBranco}>Denúncia anônima</Text>
              <Text style={styles.textoSecundario}>
                Seus dados pessoais não serão solicitados.
              </Text>
            </View>
            <Switch
              value={anonima}
              onValueChange={setAnonima}
              trackColor={{ false: "#2B3448", true: "#2F80FF" }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}

        {!anonima && (
          <View>
            <Text style={styles.subtitulo}>Dados do solicitante</Text>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Nome completo"
              placeholderTextColor="#9AA4B2"
            />
            <Text style={styles.label}>Endereço residencial *</Text>
            <TextInput
              style={styles.input}
              value={enderecoResidencial}
              onChangeText={setEnderecoResidencial}
              placeholder="Seu endereço"
              placeholderTextColor="#9AA4B2"
            />
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor="#9AA4B2"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={setTelefone}
              placeholder="DDD + número"
              placeholderTextColor="#9AA4B2"
              keyboardType="phone-pad"
            />
            <Text style={styles.textoSecundario}>
              Informe pelo menos um contato: e-mail ou telefone.
            </Text>
          </View>
        )}

        {tipo === "DENUNCIA" && (
          <View>
            <Text style={styles.subtitulo}>Imagens da denúncia</Text>
            <TouchableOpacity style={styles.botaoSelecionarImagem} onPress={selecionarImagens}>
              <Ionicons name="images-outline" size={26} color="#2F80FF" />
              <Text style={styles.textoBranco}>Selecionar imagens</Text>
              <Text style={styles.textoSecundario}>
                Até 3 imagens, máximo de 5 MB cada
              </Text>
            </TouchableOpacity>
            {imagens.length > 0 && (
              <View style={styles.linhaImagens}>
                {imagens.map((imagem, index) => (
                  <View key={`${imagem.uri}-${index}`} style={styles.miniaturaContainer}>
                    <Image source={{ uri: imagem.uri }} style={styles.miniatura} />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={styles.subtitulo}>Pessoa envolvida (opcional)</Text>
        <TextInput
          style={styles.input}
          value={envolvidoNome}
          onChangeText={setEnvolvidoNome}
          placeholder="Nome da pessoa envolvida"
          placeholderTextColor="#9AA4B2"
        />
        <TextInput
          style={styles.input}
          value={envolvidoEndereco}
          onChangeText={setEnvolvidoEndereco}
          placeholder="Endereço da pessoa envolvida"
          placeholderTextColor="#9AA4B2"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={envolvidoDescricao}
          onChangeText={setEnvolvidoDescricao}
          placeholder="Outras informações sobre a pessoa"
          placeholderTextColor="#9AA4B2"
          multiline
          textAlignVertical="top"
        />

        {!!erroFormulario && <Text style={styles.erro}>{erroFormulario}</Text>}
        <TouchableOpacity
          style={[
            styles.botaoEnviar,
            (carregando || carregandoCategorias || !!erroCategorias ||
              categoriasFiltradas.length === 0) && styles.botaoDesabilitado,
          ]}
          onPress={enviarSolicitacao}
          disabled={carregando || carregandoCategorias || !!erroCategorias ||
            categoriasFiltradas.length === 0}
        >
          {carregando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.botaoEnviarTexto}>Enviar solicitação</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0F19" },
  content: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 45 },
  voltar: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 22 },
  voltarTexto: { color: "#9AA4B2", fontSize: 15 },
  titulo: { color: "#FFFFFF", fontSize: 26, fontWeight: "700", marginBottom: 8 },
  descricaoSecao: { color: "#9AA4B2", fontSize: 14, lineHeight: 21, marginBottom: 22 },
  label: { color: "#FFFFFF", fontSize: 15, fontWeight: "600", marginBottom: 10, marginTop: 12 },
  subtitulo: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", marginTop: 28, marginBottom: 15 },
  tipoContainer: { flexDirection: "row", gap: 12, marginBottom: 15 },
  botaoTipo: {
    flex: 1, backgroundColor: "#171C2B", borderRadius: 18, borderWidth: 1,
    borderColor: "#2B3448", alignItems: "center", gap: 10, padding: 20,
  },
  botaoSelecionado: { backgroundColor: "#111B35", borderColor: "#2F80FF" },
  textoBranco: { color: "#FFFFFF", fontSize: 14, fontWeight: "500" },
  textoSecundario: { color: "#9AA4B2", fontSize: 12, lineHeight: 19, marginTop: 6 },
  categorias: { gap: 9, marginBottom: 10 },
  categoria: {
    backgroundColor: "#171C2B", borderWidth: 1, borderColor: "#2B3448", borderRadius: 14,
    padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  },
  input: {
    backgroundColor: "#171C2B", color: "#FFFFFF", borderWidth: 1,
    borderColor: "#2B3448", borderRadius: 14, paddingHorizontal: 15,
    paddingVertical: 14, fontSize: 14, marginBottom: 10,
  },
  textArea: { minHeight: 110 },
  anonimatoCard: {
    backgroundColor: "#171C2B", borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 10, marginTop: 18,
  },
  botaoSelecionarImagem: {
    backgroundColor: "#171C2B", borderWidth: 1, borderColor: "#2B3448",
    borderRadius: 18, alignItems: "center", gap: 8, padding: 20,
  },
  linhaImagens: { flexDirection: "row", gap: 10, marginTop: 12 },
  miniaturaContainer: { flex: 1 },
  miniatura: { width: "100%", height: 90, borderRadius: 12 },
  botaoEnviar: {
    backgroundColor: "#2F80FF", borderRadius: 16, padding: 17,
    alignItems: "center", marginTop: 28,
  },
  botaoEnviarTexto: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", textAlign: "center" },
  botaoDesabilitado: { opacity: 0.5 },
  erro: { color: "#FF7777", marginVertical: 12, lineHeight: 20 },
  sucesso: { color: "#78D8A4", marginTop: 16, fontSize: 14 },
  aviso: { backgroundColor: "#171C2B", borderRadius: 16, padding: 15, marginTop: 18 },
  codigo: {
    color: "#FFFFFF", backgroundColor: "#171C2B", borderRadius: 12,
    padding: 15, fontSize: 14, marginBottom: 12,
  },
});
