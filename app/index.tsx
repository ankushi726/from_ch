import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Snowflake, Thermometer, Wind } from 'lucide-react-native';

export default function HomeScreen() {
  const handleFreezerPress = () => {
    router.push('/(freezer)');
  };

  const handleComingSoon = (type: string) => {
    Alert.alert(
      'Coming Soon', 
      `${type} calculations will be available in a future update.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <LinearGradient
      colors={['#EBF8FF', '#DBEAFE', '#BFDBFE']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Enzo CoolCalc</Text>
          <Text style={styles.subtitle}>Professional Refrigeration Load Calculator</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionCard} onPress={handleFreezerPress}>
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.cardGradient}
            >
              <Snowflake color="#FFFFFF" size={32} strokeWidth={2} />
              <Text style={styles.cardTitle}>Freezer</Text>
              <Text style={styles.cardSubtitle}>Standard freezer rooms</Text>
              <Text style={styles.cardDescription}>Calculate cooling loads for standard freezer applications (-18°C to -25°C)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, styles.disabledCard]} 
            onPress={() => handleComingSoon('Blast Freezer')}
          >
            <LinearGradient
              colors={['#6B7280', '#4B5563']}
              style={styles.cardGradient}
            >
              <Wind color="#FFFFFF" size={32} strokeWidth={2} />
              <Text style={styles.cardTitle}>Blast Freezer</Text>
              <Text style={styles.cardSubtitle}>Quick freezing applications</Text>
              <Text style={styles.cardDescription}>Coming Soon - Rapid freezing calculations</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, styles.disabledCard]} 
            onPress={() => handleComingSoon('Cold Room')}
          >
            <LinearGradient
              colors={['#6B7280', '#4B5563']}
              style={styles.cardGradient}
            >
              <Thermometer color="#FFFFFF" size={32} strokeWidth={2} />
              <Text style={styles.cardTitle}>Cold Room</Text>
              <Text style={styles.cardSubtitle}>Above freezing storage</Text>
              <Text style={styles.cardDescription}>Coming Soon - Chilled storage calculations</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Professional refrigeration engineering calculations</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    gap: 16,
  },
  optionCard: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledCard: {
    opacity: 0.7,
  },
  cardGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
});