import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Header } from '@/components/Header';
import { calculateCoolingLoad } from '@/utils/calculations';

export default function ResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Recalculate whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      calculateResults();
    }, [])
  );

  // Also set up a listener for storage changes
  useEffect(() => {
    const interval = setInterval(() => {
      calculateResults();
    }, 1000); // Check for changes every second

    return () => clearInterval(interval);
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('roomData');
      const conditionsData = await AsyncStorage.getItem('conditionsData');
      const productData = await AsyncStorage.getItem('productData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '4.0', width: '3.0', height: '2.5', doorWidth: '1.0', doorHeight: '2.0',
        doorOpenings: '15', insulationType: 'PUF', insulationThickness: 150 
      };
      const conditions = conditionsData ? JSON.parse(conditionsData) : { externalTemp: '35', internalTemp: '-18', operatingHours: '24' };
      const product = productData ? JSON.parse(productData) : { 
        productType: 'Beef', dailyLoad: '1000', incomingTemp: '25', outgoingTemp: '-18',
        storageType: 'Boxed', numberOfPeople: '2', workingHours: '4',
        lightingWattage: '150', equipmentLoad: '300' 
      };

      const calculatedResults = calculateCoolingLoad(room, conditions, product);
      setResults(calculatedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculation Results" step={5} totalSteps={4} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Calculation Results" step={4} totalSteps={3} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>Total Cooling Capacity Required</Text>
          <Text style={styles.mainResultValue}>{results.totalLoadWithSafety.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy Consumption: {(results.totalLoadWithSafety * 24).toFixed(1)} kWh</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Storage Information</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Maximum Storage Capacity:</Text>
              <Text style={styles.breakdownValue}>{results.storageCapacity.maximum.toFixed(0)} kg</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Current Daily Load:</Text>
              <Text style={styles.breakdownValue}>{results.productInfo.mass} kg</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Storage Utilization:</Text>
              <Text style={styles.subtotalValue}>{results.storageCapacity.utilization.toFixed(1)}%</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Transmission Loads</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Walls ({results.areas.wall.toFixed(1)} m²):</Text>
              <Text style={styles.breakdownValue}>{results.transmissionLoad.walls.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Ceiling ({results.areas.ceiling.toFixed(1)} m²):</Text>
              <Text style={styles.breakdownValue}>{results.transmissionLoad.ceiling.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Floor ({results.areas.floor.toFixed(1)} m²):</Text>
              <Text style={styles.breakdownValue}>{results.transmissionLoad.floor.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Subtotal Transmission:</Text>
              <Text style={styles.subtotalValue}>{results.transmissionLoad.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Product Load</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Product mass:</Text>
              <Text style={styles.breakdownValue}>{results.productInfo.mass} kg/day</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Sensible heat (above freezing):</Text>
              <Text style={styles.breakdownValue}>{results.productLoad.sensibleAbove.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Latent heat (freezing):</Text>
              <Text style={styles.breakdownValue}>{results.productLoad.latent.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Sensible heat (below freezing):</Text>
              <Text style={styles.breakdownValue}>{results.productLoad.sensibleBelow.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Subtotal Product:</Text>
              <Text style={styles.subtotalValue}>{results.productLoad.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Air Change Load</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Room volume:</Text>
              <Text style={styles.breakdownValue}>{results.volume.toFixed(1)} m³</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Air change rate:</Text>
              <Text style={styles.breakdownValue}>{results.airChangeRate} changes/hr</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Air infiltration load:</Text>
              <Text style={styles.subtotalValue}>{results.airInfiltrationLoad.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Door Opening Load</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Door area:</Text>
              <Text style={styles.breakdownValue}>{results.areas.door.toFixed(1)} m²</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Daily openings:</Text>
              <Text style={styles.breakdownValue}>{results.doorOpenings} times/day</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Door infiltration load:</Text>
              <Text style={styles.subtotalValue}>{results.doorLoad.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Internal Loads</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Occupancy load ({results.workingHours}h/24h):</Text>
              <Text style={styles.breakdownValue}>{results.internalLoads.people.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Lighting load:</Text>
              <Text style={styles.breakdownValue}>{results.internalLoads.lighting.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Equipment/Fan load:</Text>
              <Text style={styles.breakdownValue}>{results.internalLoads.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>Subtotal Internal:</Text>
              <Text style={styles.subtotalValue}>{results.internalLoads.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.finalCard}>
            <Text style={styles.finalTitle}>Final Calculation</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total calculated load:</Text>
              <Text style={styles.breakdownValue}>{results.totalLoad.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety factor (10%):</Text>
              <Text style={styles.breakdownValue}>+{(results.totalLoadWithSafety - results.totalLoad).toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>FINAL REQUIRED CAPACITY:</Text>
              <Text style={styles.finalValue}>{results.totalLoadWithSafety.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Room Specifications Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {results.dimensions.length}m × {results.dimensions.width}m × {results.dimensions.height}m</Text>
            <Text style={styles.infoText}>• Door size: {results.doorDimensions.width}m × {results.doorDimensions.height}m</Text>
            <Text style={styles.infoText}>• Room volume: {results.volume.toFixed(1)} m³</Text>
            <Text style={styles.infoText}>• Temperature difference: {results.temperatureDifference.toFixed(1)}°C</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Thickness: {results.construction.thickness}mm</Text>
            <Text style={styles.infoText}>• U-Factor: {results.construction.uFactor.toFixed(3)} W/m²K</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Product Information</Text>
            <Text style={styles.infoText}>• Product: {results.productInfo.type}</Text>
            <Text style={styles.infoText}>• Daily load: {results.productInfo.mass} kg</Text>
            <Text style={styles.infoText}>• Temperature range: {results.productInfo.incomingTemp}°C → {results.productInfo.outgoingTemp}°C</Text>
            <Text style={styles.infoText}>• Storage type: {results.storageCapacity.storageType}</Text>
            <Text style={styles.infoText}>• Pull-down time: {results.pullDownTime} hours</Text>
          </View>
        </View>
      </ScrollView>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  mainResultCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainResultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 8,
  },
  mainResultSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  finalCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  finalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 12,
  },
  finalLabel: {
    fontSize: 15,
    color: '#1E3A8A',
    fontWeight: '700',
  },
  finalValue: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});