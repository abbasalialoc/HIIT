import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Svg, { Line, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Exercise data structure
interface Exercise {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

const EXERCISES: Exercise[] = [
  { id: '1', name: 'Push-ups', description: 'Standard push-ups', isActive: true },
  { id: '2', name: 'Squats', description: 'Bodyweight squats', isActive: true },
  { id: '3', name: 'Jumping Jacks', description: 'Full body cardio', isActive: true },
  { id: '4', name: 'Mountain Climbers', description: 'Core and cardio', isActive: true }
];

// Timer states
type TimerState = 'ready' | 'work' | 'rest' | 'paused' | 'finished';

// Simple animated stick figure component
const StickFigure: React.FC<{ exercise: string; isAnimating: boolean }> = ({ exercise, isAnimating }) => {
  const animationValue = useSharedValue(0);

  useEffect(() => {
    if (isAnimating) {
      animationValue.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      animationValue.value = 0;
    }
  }, [isAnimating]);

  const getStickFigureAnimation = () => {
    switch (exercise) {
      case 'Push-ups':
        return (
          <Animated.View style={[{ transform: [{ translateY: animationValue.value * 20 }] }]}>
            <Svg width="120" height="80" viewBox="0 0 120 80">
              {/* Head */}
              <Circle cx="60" cy="15" r="8" stroke="#fff" strokeWidth="2" fill="none" />
              {/* Body */}
              <Line x1="60" y1="23" x2="60" y2="50" stroke="#fff" strokeWidth="2" />
              {/* Arms */}
              <Line x1="60" y1="30" x2="40" y2="45" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="30" x2="80" y2="45" stroke="#fff" strokeWidth="2" />
              {/* Legs */}
              <Line x1="60" y1="50" x2="45" y2="70" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="50" x2="75" y2="70" stroke="#fff" strokeWidth="2" />
            </Svg>
          </Animated.View>
        );
      case 'Squats':
        return (
          <Animated.View style={[{ transform: [{ translateY: animationValue.value * 30 }] }]}>
            <Svg width="120" height="80" viewBox="0 0 120 80">
              {/* Head */}
              <Circle cx="60" cy="15" r="8" stroke="#fff" strokeWidth="2" fill="none" />
              {/* Body */}
              <Line x1="60" y1="23" x2="60" y2="45" stroke="#fff" strokeWidth="2" />
              {/* Arms */}
              <Line x1="60" y1="25" x2="45" y2="35" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="25" x2="75" y2="35" stroke="#fff" strokeWidth="2" />
              {/* Legs bent */}
              <Line x1="60" y1="45" x2="50" y2="60" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="45" x2="70" y2="60" stroke="#fff" strokeWidth="2" />
              <Line x1="50" y1="60" x2="45" y2="70" stroke="#fff" strokeWidth="2" />
              <Line x1="70" y1="60" x2="75" y2="70" stroke="#fff" strokeWidth="2" />
            </Svg>
          </Animated.View>
        );
      case 'Jumping Jacks':
        return (
          <Animated.View style={[{ transform: [{ rotate: `${animationValue.value * 15}deg` }] }]}>
            <Svg width="120" height="80" viewBox="0 0 120 80">
              {/* Head */}
              <Circle cx="60" cy="15" r="8" stroke="#fff" strokeWidth="2" fill="none" />
              {/* Body */}
              <Line x1="60" y1="23" x2="60" y2="50" stroke="#fff" strokeWidth="2" />
              {/* Arms spread */}
              <Line x1="60" y1="30" x2="35" y2="25" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="30" x2="85" y2="25" stroke="#fff" strokeWidth="2" />
              {/* Legs spread */}
              <Line x1="60" y1="50" x2="40" y2="70" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="50" x2="80" y2="70" stroke="#fff" strokeWidth="2" />
            </Svg>
          </Animated.View>
        );
      case 'Mountain Climbers':
        return (
          <Animated.View style={[{ transform: [{ translateX: animationValue.value * 10 }] }]}>
            <Svg width="120" height="80" viewBox="0 0 120 80">
              {/* Head */}
              <Circle cx="60" cy="20" r="8" stroke="#fff" strokeWidth="2" fill="none" />
              {/* Body angled */}
              <Line x1="60" y1="28" x2="75" y2="45" stroke="#fff" strokeWidth="2" />
              {/* Arms supporting */}
              <Line x1="60" y1="32" x2="45" y2="50" stroke="#fff" strokeWidth="2" />
              <Line x1="60" y1="32" x2="75" y2="50" stroke="#fff" strokeWidth="2" />
              {/* Running legs */}
              <Line x1="75" y1="45" x2="65" y2="65" stroke="#fff" strokeWidth="2" />
              <Line x1="75" y1="45" x2="90" y2="60" stroke="#fff" strokeWidth="2" />
            </Svg>
          </Animated.View>
        );
      default:
        return (
          <Svg width="120" height="80" viewBox="0 0 120 80">
            <Circle cx="60" cy="15" r="8" stroke="#fff" strokeWidth="2" fill="none" />
            <Line x1="60" y1="23" x2="60" y2="50" stroke="#fff" strokeWidth="2" />
            <Line x1="60" y1="30" x2="45" y2="40" stroke="#fff" strokeWidth="2" />
            <Line x1="60" y1="30" x2="75" y2="40" stroke="#fff" strokeWidth="2" />
            <Line x1="60" y1="50" x2="45" y2="70" stroke="#fff" strokeWidth="2" />
            <Line x1="60" y1="50" x2="75" y2="70" stroke="#fff" strokeWidth="2" />
          </Svg>
        );
    }
  };

  return (
    <View style={styles.stickFigureContainer}>
      {getStickFigureAnimation()}
    </View>
  );
};

export default function ExerciseTimer() {
  // Timer settings (will be loaded from backend)
  const [workTime, setWorkTime] = useState(40); // 40 seconds work
  const [restTime, setRestTime] = useState(20); // 20 seconds rest
  const [setsPerExercise, setSetsPerExercise] = useState(3);
  const [circuits, setCircuits] = useState(2);

  // Current state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentCircuit, setCurrentCircuit] = useState(1);
  const [timerState, setTimerState] = useState<TimerState>('ready');
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [exercises, setExercises] = useState(EXERCISES);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Timer reference
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const EXPO_BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  // Load settings and exercises from backend
  useEffect(() => {
    loadSettings();
    loadExercises();
  }, []);

  // Update timeLeft when workTime changes
  useEffect(() => {
    if (timerState === 'ready') {
      setTimeLeft(workTime);
    }
  }, [workTime, timerState]);

  const loadSettings = async () => {
    try {
      const response = await fetch(`${EXPO_BACKEND_URL}/api/settings`);
      if (response.ok) {
        const settings = await response.json();
        setWorkTime(settings.workTime);
        setRestTime(settings.restTime);
        setSetsPerExercise(settings.setsPerExercise);
        setCircuits(settings.circuits);
        setTimeLeft(settings.workTime);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadExercises = async () => {
    try {
      const response = await fetch(`${EXPO_BACKEND_URL}/api/exercises`);
      if (response.ok) {
        const exercisesData = await response.json();
        setExercises(exercisesData);
      }
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get active exercises only
  const activeExercises = exercises.filter(ex => ex.isActive);
  const currentExercise = activeExercises[currentExerciseIndex];

  // Timer logic
  useEffect(() => {
    if (timerState === 'work' || timerState === 'rest') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState]);

  const handleTimerComplete = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    if (timerState === 'work') {
      // Work period completed, start rest
      setTimerState('rest');
      setTimeLeft(restTime);
    } else if (timerState === 'rest') {
      // Rest period completed, move to next
      moveToNext();
    }
  };

  const moveToNext = () => {
    if (currentSet < setsPerExercise) {
      // Next set of same exercise
      setCurrentSet(prev => prev + 1);
      setTimerState('work');
      setTimeLeft(workTime);
    } else if (currentExerciseIndex < activeExercises.length - 1) {
      // Next exercise
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setTimerState('work');
      setTimeLeft(workTime);
    } else if (currentCircuit < circuits) {
      // Next circuit
      setCurrentCircuit(prev => prev + 1);
      setCurrentExerciseIndex(0);
      setCurrentSet(1);
      setTimerState('work');
      setTimeLeft(workTime);
    } else {
      // Workout finished
      setTimerState('finished');
      Alert.alert('Workout Complete!', 'Great job! You finished your workout.');
    }
  };

  const startWorkout = () => {
    setTimerState('work');
    setTimeLeft(workTime);
  };

  const pauseWorkout = () => {
    setTimerState('paused');
  };

  const resumeWorkout = () => {
    setTimerState(timerState === 'work' ? 'work' : 'rest');
  };

  const resetWorkout = () => {
    setTimerState('ready');
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setCurrentCircuit(1);
    setTimeLeft(workTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timerState === 'work') return '#ff6b6b';
    if (timerState === 'rest') return '#4ecdc4';
    return '#6c5ce7';
  };

  const getStatusText = () => {
    switch (timerState) {
      case 'ready': return 'Ready to start!';
      case 'work': return 'WORK TIME!';
      case 'rest': return 'Rest Time';
      case 'paused': return 'Paused';
      case 'finished': return 'Workout Complete!';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Exercise Timer</Text>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Workout Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Circuit {currentCircuit} of {circuits} • Exercise {currentExerciseIndex + 1} of {activeExercises.length} • Set {currentSet} of {setsPerExercise}
            </Text>
          </View>

          {/* Current Exercise */}
          {currentExercise && (
            <View style={styles.exerciseContainer}>
              <Text style={styles.exerciseName}>{currentExercise.name}</Text>
              <Text style={styles.exerciseDescription}>{currentExercise.description}</Text>
              
              {/* Animated Stick Figure */}
              <StickFigure 
                exercise={currentExercise.name} 
                isAnimating={timerState === 'work'} 
              />
            </View>
          )}

          {/* Timer Display */}
          <View style={[styles.timerContainer, { backgroundColor: getTimerColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {timerState === 'ready' && (
              <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                <Ionicons name="play" size={32} color="#fff" />
                <Text style={styles.buttonText}>Start Workout</Text>
              </TouchableOpacity>
            )}

            {(timerState === 'work' || timerState === 'rest') && (
              <TouchableOpacity style={styles.pauseButton} onPress={pauseWorkout}>
                <Ionicons name="pause" size={32} color="#fff" />
                <Text style={styles.buttonText}>Pause</Text>
              </TouchableOpacity>
            )}

            {timerState === 'paused' && (
              <View style={styles.pausedControls}>
                <TouchableOpacity style={styles.resumeButton} onPress={resumeWorkout}>
                  <Ionicons name="play" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={resetWorkout}>
                  <Ionicons name="refresh" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {timerState === 'finished' && (
              <TouchableOpacity style={styles.resetButton} onPress={resetWorkout}>
                <Ionicons name="refresh" size={32} color="#fff" />
                <Text style={styles.buttonText}>Start New Workout</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workTime}s</Text>
              <Text style={styles.statLabel}>Work</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{restTime}s</Text>
              <Text style={styles.statLabel}>Rest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeExercises.length}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
          </View>
        </>
      )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  settingsButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  exerciseContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  exerciseName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  exerciseDescription: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 24,
  },
  stickFigureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerContainer: {
    marginHorizontal: 20,
    marginVertical: 24,
    paddingVertical: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  startButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 16,
  },
  resumeButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 16,
    paddingVertical: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 16,
    paddingVertical: 16,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
});