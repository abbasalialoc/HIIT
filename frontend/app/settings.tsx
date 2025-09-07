import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  TextInput
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface WorkoutSettings {
  workTime: number;
  restTime: number;
  setsPerExercise: number;
  circuits: number;
  exerciseOrder: string[];
}

export default function Settings() {
  // Timer settings
  const [workTime, setWorkTime] = useState(40);
  const [restTime, setRestTime] = useState(20);
  const [setsPerExercise, setSetsPerExercise] = useState(3);
  const [circuits, setCircuits] = useState(2);
  
  // Exercise settings
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([]);
  
  // Loading state
  const [loading, setLoading] = useState(true);

  const EXPO_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadSettings();
    loadExercises();
  }, []);

  const loadSettings = async () => {
    try {
      // First try to load from local storage (always available)
      const savedSettings = await AsyncStorage.getItem('workoutSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setWorkTime(settings.workTime || 40);
        setRestTime(settings.restTime || 20);
        setSetsPerExercise(settings.setsPerExercise || 3);
        setCircuits(settings.circuits || 2);
        setExerciseOrder(settings.exerciseOrder || []);
        console.log('Settings loaded from local storage');
        return; // Use local storage data
      }

      // If no local storage, try backend (only in development)
      const EXPO_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      if (EXPO_BACKEND_URL) {
        const response = await fetch(`${EXPO_BACKEND_URL}/api/settings`);
        if (response.ok) {
          const settings = await response.json();
          setWorkTime(settings.workTime);
          setRestTime(settings.restTime);
          setSetsPerExercise(settings.setsPerExercise);
          setCircuits(settings.circuits);
          setExerciseOrder(settings.exerciseOrder || []);
          console.log('Settings loaded from backend');
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use defaults if everything fails
    }
  };

  const loadExercises = async () => {
    try {
      const response = await fetch(`${EXPO_BACKEND_URL}/api/exercises`);
      if (response.ok) {
        const exercisesData: Exercise[] = await response.json();
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsData = {
        workTime,
        restTime,
        setsPerExercise,
        circuits,
        exerciseOrder
      };

      // Always save to local storage first (works offline)
      await AsyncStorage.setItem('workoutSettings', JSON.stringify(settingsData));
      
      // Try to save to backend if available, but don't fail if it's not
      const EXPO_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
      if (EXPO_BACKEND_URL) {
        try {
          const response = await fetch(`${EXPO_BACKEND_URL}/api/settings`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(settingsData),
          });
          console.log('Backend save attempt:', response.ok ? 'success' : 'failed');
        } catch (error) {
          console.log('Backend not available, using local storage only');
        }
      }

      Alert.alert('Success', 'Settings saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings. Please try again.');
      console.error('Save settings error:', error);
    }
  };

  const updateExercise = async (exerciseId: string, updates: Partial<Exercise>) => {
    try {
      const response = await fetch(`${EXPO_BACKEND_URL}/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update local state
        setExercises(prev => prev.map(ex => 
          ex.id === exerciseId ? { ...ex, ...updates } : ex
        ));
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
    }
  };

  const toggleExercise = (exerciseId: string, isActive: boolean) => {
    updateExercise(exerciseId, { isActive });
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    const newOrder = [...exerciseOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setExerciseOrder(newOrder);
  };

  const adjustTime = (type: 'work' | 'rest', delta: number) => {
    if (type === 'work') {
      const newTime = Math.max(10, Math.min(300, workTime + delta));
      setWorkTime(newTime);
    } else {
      const newTime = Math.max(5, Math.min(180, restTime + delta));
      setRestTime(newTime);
    }
  };

  const adjustCount = (type: 'sets' | 'circuits', delta: number) => {
    if (type === 'sets') {
      const newCount = Math.max(1, Math.min(10, setsPerExercise + delta));
      setSetsPerExercise(newCount);
    } else {
      const newCount = Math.max(1, Math.min(5, circuits + delta));
      setCircuits(newCount);
    }
  };

  const renderTimeAdjuster = (
    label: string,
    value: number,
    unit: string,
    onAdjust: (delta: number) => void
  ) => (
    <View style={styles.adjusterContainer}>
      <Text style={styles.adjusterLabel}>{label}</Text>
      <View style={styles.adjusterControls}>
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onAdjust(-5)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}{unit}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onAdjust(5)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCountAdjuster = (
    label: string,
    value: number,
    onAdjust: (delta: number) => void
  ) => (
    <View style={styles.adjusterContainer}>
      <Text style={styles.adjusterLabel}>{label}</Text>
      <View style={styles.adjusterControls}>
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onAdjust(-1)}
        >
          <Ionicons name="remove" size={20} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{value}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.adjustButton} 
          onPress={() => onAdjust(1)}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveSettings}
        >
          <Ionicons name="checkmark" size={24} color="#4ecdc4" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Timer Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timer Settings</Text>
          
          {renderTimeAdjuster(
            'Work Time',
            workTime,
            's',
            (delta) => adjustTime('work', delta)
          )}
          
          {renderTimeAdjuster(
            'Rest Time',
            restTime,
            's',
            (delta) => adjustTime('rest', delta)
          )}
        </View>

        {/* Workout Structure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Structure</Text>
          
          {renderCountAdjuster(
            'Sets per Exercise',
            setsPerExercise,
            (delta) => adjustCount('sets', delta)
          )}
          
          {renderCountAdjuster(
            'Total Circuits',
            circuits,
            (delta) => adjustCount('circuits', delta)
          )}
        </View>

        {/* Exercise Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Selection</Text>
          <Text style={styles.sectionSubtitle}>
            Toggle exercises on/off for your workout
          </Text>
          
          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              </View>
              
              <View style={styles.exerciseControls}>
                <Switch
                  value={exercise.isActive}
                  onValueChange={(value) => toggleExercise(exercise.id, value)}
                  trackColor={{ false: '#3a3a3a', true: '#4ecdc4' }}
                  thumbColor={exercise.isActive ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Workout Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Active Exercises</Text>
              <Text style={styles.summaryValue}>
                {exercises.filter(ex => ex.isActive).length}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Sets</Text>
              <Text style={styles.summaryValue}>
                {exercises.filter(ex => ex.isActive).length * setsPerExercise * circuits}
              </Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Estimated Duration</Text>
              <Text style={styles.summaryValue}>
                {Math.round(
                  (exercises.filter(ex => ex.isActive).length * 
                   setsPerExercise * 
                   circuits * 
                   (workTime + restTime)) / 60
                )}min
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity style={styles.saveButtonLarge} onPress={saveSettings}>
            <Ionicons name="save-outline" size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 16,
  },
  adjusterContainer: {
    marginBottom: 20,
  },
  adjusterLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
  },
  adjusterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    padding: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueContainer: {
    backgroundColor: '#2d2d4a',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2d2d4a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  exerciseControls: {
    marginLeft: 16,
  },
  summaryContainer: {
    backgroundColor: '#2d2d4a',
    borderRadius: 12,
    padding: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  saveSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  saveButtonLarge: {
    backgroundColor: '#4ecdc4',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});