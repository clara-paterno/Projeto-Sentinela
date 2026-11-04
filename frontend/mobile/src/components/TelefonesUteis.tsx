
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const contatos = [
  { nome: 'Polícia Militar', numero: '190' },
  { nome: 'SAMU', numero: '192' },
  { nome: 'Corpo de Bombeiros', numero: '193' },
  { nome: 'Defesa Civil', numero: '199' },
  { nome: 'Atendimento à Mulher', numero: '180' },
  { nome: 'Disque Denúncia', numero: '181' },
];

export default function TelefonesUteis() {
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

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Telefones Úteis</Text>
      <Text style={styles.subtitulo}>
        Contatos de emergência e apoio ao cidadão
      </Text>

      {contatos.map((contato) => (
        <TouchableOpacity
          key={contato.numero}
          style={styles.card}
          onPress={() => ligar(contato.numero)}
          accessibilityRole="button"
          accessibilityLabel={`Ligar para ${contato.nome}`}
        >
          <View style={styles.info}>
            <Text style={styles.nome}>{contato.nome}</Text>
            <Text style={styles.numero}>{contato.numero}</Text>
          </View>

          <Ionicons
            name="call-outline"
            size={24}
            color="#1F3F7A"
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#171C2B',
  },
  subtitulo: {
    fontSize: 14,
    color: '#667085',
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  info: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171C2B',
  },
  numero: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F3F7A',
    marginTop: 4,
  },
});
