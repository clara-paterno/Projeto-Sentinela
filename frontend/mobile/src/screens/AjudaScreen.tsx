
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';

type Icone = keyof typeof Ionicons.glyphMap;

type Contato = {
  nome: string;
  numero: string;
  descricao: string;
  icone: Icone;
};

const COLORS = {
  background: '#0B0F19',
  card: '#171C2B',
  border: '#293247',
  blue: '#3184FF',
  blueSoft: '#10264B',
  blueButton: '#204780',
  white: '#F8FAFF',
  muted: '#9CA9BF',
};

const emergencias: Contato[] = [
  {
    nome: 'Polícia Militar',
    numero: '190',
    descricao: 'Segurança pública',
    icone: 'shield-checkmark-outline',
  },
  {
    nome: 'SAMU',
    numero: '192',
    descricao: 'Atendimento médico de urgência',
    icone: 'medkit-outline',
  },
  {
    nome: 'Corpo de Bombeiros',
    numero: '193',
    descricao: 'Incêndios e resgates',
    icone: 'flame-outline',
  },
  {
    nome: 'Defesa Civil',
    numero: '199',
    descricao: 'Situações de risco',
    icone: 'warning-outline',
  },
];

const apoio: Contato[] = [
  {
    nome: 'Atendimento à Mulher',
    numero: '180',
    descricao: 'Orientação e denúncias',
    icone: 'heart-outline',
  },
  {
    nome: 'Disque Denúncia',
    numero: '181',
    descricao: 'Informações e denúncias',
    icone: 'chatbubble-ellipses-outline',
  },
];

export default function AjudaScreen() {
  const insets = useSafeAreaInsets();

  const ligar = async (numero: string) => {
    try {
      await Linking.openURL(`tel:${numero}`);
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível abrir o discador.'
      );
    }
  };

  const renderContatos = (contatos: Contato[]) =>
    contatos.map((contato) => (
      <View key={contato.numero} style={styles.card}>
        <View style={styles.iconeContainer}>
          <Ionicons
            name={contato.icone}
            size={23}
            color={COLORS.blue}
          />
        </View>

        <View style={styles.informacoes}>
          <Text style={styles.nome}>
            {contato.nome}
          </Text>

          <Text style={styles.descricao}>
            {contato.descricao}
          </Text>

          <Text style={styles.numero}>
            {contato.numero}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.botaoLigar}
          onPress={() => ligar(contato.numero)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Ligar para ${contato.nome}`}
        >
          <Ionicons
            name="call"
            size={19}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    ));

  return (
    <SafeAreaView
    style={styles.screen}
    edges={['top']}
  >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 60 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons
              name="call-outline"
              size={24}
              color={COLORS.blue}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.titulo}>
              Telefones úteis
            </Text>
            <Text style={styles.subtitulo}>
              Contatos de emergência e apoio ao cidadão.
            </Text>
          </View>
        </View>

        {/* Card de introdução */}
        <View style={styles.banner}>
          <View style={styles.bannerTitulo}>
            <Ionicons
              name="shield-checkmark-outline"
              size={21}
              color={COLORS.blue}
            />
            <Text style={styles.bannerTituloTexto}>
              Ajuda quando você precisa
            </Text>
          </View>

          <Text style={styles.bannerDescricao}>
            Encontre os principais serviços e acione
            o discador do seu celular com apenas um toque.
          </Text>
        </View>

        {/* Emergências */}
        <View style={styles.secao}>
          <View style={styles.secaoTitulo}>
            <Ionicons
              name="alert-circle-outline"
              size={21}
              color={COLORS.blue}
            />
            <Text style={styles.tituloSecao}>
              Emergências
            </Text>
          </View>

          {renderContatos(emergencias)}
        </View>

        {/* Canais de apoio */}
        <View style={styles.secao}>
          <View style={styles.secaoTitulo}>
            <Ionicons
              name="heart-outline"
              size={21}
              color={COLORS.blue}
            />
            <Text style={styles.tituloSecao}>
              Canais de apoio
            </Text>
          </View>

          {renderContatos(apoio)}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 26,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 26,
  },

  headerIcon: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.blueSoft,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  titulo: {
    fontSize: 23,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 5,
  },

  subtitulo: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.muted,
  },

  banner: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 30,
  },

  bannerTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },

  bannerTituloTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    flex: 1,
  },

  bannerDescricao: {
    fontSize: 13,
    lineHeight: 21,
    color: COLORS.muted,
  },

  secao: {
    marginBottom: 24,
  },

  secaoTitulo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 15,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 11,
    gap: 12,
  },

  iconeContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  informacoes: {
    flex: 1,
  },

  nome: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  descricao: {
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.muted,
    marginTop: 4,
  },

  numero: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.blue,
    marginTop: 6,
  },

  botaoLigar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: COLORS.blueButton,
    alignItems: 'center',
    justifyContent: 'center',
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    paddingHorizontal: 8,
    marginTop: 2,
  },

  avisoTexto: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.muted,
  },
});
