import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  Alert,
  Image
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Simple animated stick figure component with video for push-ups
const StickFigure: React.FC<{ exercise: string; isAnimating: boolean }> = ({ exercise, isAnimating }) => {
  const animationValue = useSharedValue(0);
  const videoRef = useRef<any>(null);

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

  // Handle video playback for push-ups
  useEffect(() => {
    if (exercise === 'Push-ups' && videoRef.current) {
      if (isAnimating) {
        try {
          videoRef.current.play();
        } catch (error) {
          console.log('Video play error:', error);
        }
      } else {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch (error) {
          console.log('Video pause error:', error);
        }
      }
    }
  }, [isAnimating, exercise]);

  // For push-ups, show your custom GIF
  if (exercise === 'Push-ups') {
    return (
      <View style={styles.stickFigureContainer}>
        <View style={styles.videoContainer}>
          <Image
            source={require('../assets/push-up-animation.gif')}
            style={styles.exerciseVideo}
            resizeMode="contain"
          />
        </View>
        <Text style={{color: '#4ecdc4', fontSize: 12, marginTop: 8, fontWeight: '600'}}>
          🎈 Your Push-up Animation
        </Text>
      </View>
    );
  }

  // For squats, show your custom balloon squat GIF
  if (exercise === 'Squats') {
    return (
      <View style={styles.stickFigureContainer}>
        <View style={styles.videoContainer}>
          <Image
            source={require('../assets/balloon-squat.gif')}
            style={styles.exerciseVideo}
            resizeMode="contain"
          />
        </View>
        <Text style={{color: '#4ecdc4', fontSize: 12, marginTop: 8, fontWeight: '600'}}>
          🎈 Your Squat Animation
        </Text>
      </View>
    );
  }

  // For jumping jacks, show your custom balloon jumping jack GIF
  if (exercise === 'Jumping Jacks') {
    return (
      <View style={styles.stickFigureContainer}>
        <View style={styles.videoContainer}>
          <Image
            source={require('../assets/balloon-jumping-jack.gif')}
            style={styles.exerciseVideo}
            resizeMode="contain"
          />
        </View>
        <Text style={{color: '#4ecdc4', fontSize: 12, marginTop: 8, fontWeight: '600'}}>
          🎈 Your Jumping Jack Animation
        </Text>
      </View>
    );
  }

  // For mountain climbers, show your custom balloon mountain climber GIF
  if (exercise === 'Mountain Climbers') {
    return (
      <View style={styles.stickFigureContainer}>
        <View style={styles.videoContainer}>
          <Image
            source={require('../assets/balloon-mountain-climber.gif')}
            style={styles.exerciseVideo}
            resizeMode="contain"
          />
        </View>
        <Text style={{color: '#4ecdc4', fontSize: 12, marginTop: 8, fontWeight: '600'}}>
          🎈 Your Mountain Climber Animation
        </Text>
      </View>
    );
  }

  // For any other exercises (fallback), use default stick figure  
  const getStickFigureAnimation = () => {
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

  // Audio setup and sound functions
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Set up audio mode for better mobile compatibility
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio mode configured for mobile');
      } catch (error) {
        console.log('Audio setup error:', error);
      }
    };
    setupAudio();
  }, []);

  // Create mobile-compatible beep sound using actual audio files
  const createMobileBeepSound = async (type: 'countdown' | 'final') => {
    try {
      console.log(`🎵 Loading ${type} sound file...`);
      
      // Use actual sound files for reliable mobile playback
      const soundFile = type === 'countdown' 
        ? require('../assets/sounds/countdown.wav')
        : require('../assets/sounds/final.wav');
      
      console.log(`📁 Sound file loaded: ${type}`);
      
      // Create sound instance with the file
      const { sound } = await Audio.Sound.createAsync(
        soundFile,
        { 
          shouldPlay: true, 
          volume: 0.7,
          isLooping: false 
        }
      );
      
      console.log(`🔊 Playing ${type} sound...`);
      
      // Set a timeout to unload the sound after it finishes
      const duration = type === 'countdown' ? 300 : 500; // Give extra time for playback
      setTimeout(async () => {
        try {
          await sound.unloadAsync();
          console.log(`🗑️ ${type} sound unloaded`);
        } catch (e) {
          console.log('Sound cleanup error:', e);
        }
      }, duration);
      
      console.log(`✅ ${type} beep sound played successfully`);
      
    } catch (error) {
      console.log(`❌ ${type} sound error:`, error);
      
      // Fallback for web preview only
      if (Platform.OS === 'web') {
        try {
          console.log(`🌐 Using web audio fallback for ${type}`);
          
          if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            const frequency = type === 'countdown' ? 800 : 1200;
            const duration = type === 'countdown' ? 200 : 400;
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
            
            console.log(`✅ Web fallback ${type} beep played`);
          }
        } catch (webError) {
          console.log('Web audio fallback error:', webError);
        }
      }
    }
  };

  // Play countdown beep with BOTH sound and vibration
  const playBeep = async (type: 'countdown' | 'final') => {
    if (!soundEnabled) return;
    
    console.log(`🔊 Attempting to play ${type} beep (sound enabled: ${soundEnabled})`);
    
    try {
      // Play mobile-compatible sound
      const soundPromise = createMobileBeepSound(type);
      
      // Haptic feedback (vibration)
      const hapticPromise = (async () => {
        if (Platform.OS === 'ios') {
          await Haptics.impactAsync(
            type === 'countdown' 
              ? Haptics.ImpactFeedbackStyle.Light 
              : Haptics.ImpactFeedbackStyle.Heavy
          );
        } else if (Platform.OS === 'android') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      })();
      
      // Execute both sound and haptic simultaneously
      await Promise.all([soundPromise, hapticPromise]);
      
    } catch (error) {
      console.log('Beep playback error:', error);
      // Always ensure haptic works as fallback
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (Platform.OS === 'android') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
  };

  // Load settings and exercises from local storage/backend
  useEffect(() => {
    const loadAppData = async () => {
      console.log('🔄 Starting to load app data...');
      
      try {
        // Load settings from local storage first
        const savedSettings = await AsyncStorage.getItem('workoutSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setWorkTime(settings.workTime || 40);
          setRestTime(settings.restTime || 20);
          setSetsPerExercise(settings.setsPerExercise || 3);
          setCircuits(settings.circuits || 2);
          setTimeLeft(settings.workTime || 40);
          console.log('⚙️ Settings loaded from local storage');
        }

        // Always use default exercises (no backend dependency for exercises in mobile)
        setExercises(EXERCISES);
        console.log('🏃 Using default exercises');
        
      } catch (error) {
        console.error('❌ Failed to load app data:', error);
        setExercises(EXERCISES);
      } finally {
        console.log('✅ Setting loading to false');
        setLoading(false);
      }
    };

    loadAppData();
  }, []);

  // Update timeLeft when workTime changes
  useEffect(() => {
    if (timerState === 'ready') {
      setTimeLeft(workTime);
    }
  }, [workTime, timerState]);

  // Get active exercises only
  const activeExercises = exercises.filter(ex => ex.isActive);
  const currentExercise = activeExercises[currentExerciseIndex];

  // Timer logic
  useEffect(() => {
    if (timerState === 'work' || timerState === 'rest') {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          // Play countdown beeps for last 3 seconds
          if (prev <= 3 && prev > 1) {
            playBeep('countdown');
            // Enhanced haptic feedback for countdown
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }
          
          if (prev <= 1) {
            // Final beep and strong haptic
            playBeep('final');
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
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
  }, [timerState, soundEnabled]);

  const handleTimerComplete = () => {
    // Timer complete logic (haptic feedback and sound handled in timer loop)
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

  const skipToNext = () => {
    // Clear current timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timerState === 'work') {
      // Skip work period, go to rest
      setTimerState('rest');
      setTimeLeft(restTime);
      console.log('⏭️ Skipped work period, starting rest');
    } else if (timerState === 'rest') {
      // Skip rest period, move to next stage (set/exercise/circuit)
      moveToNext();
      console.log('⏭️ Skipped rest period, moving to next stage');
    }
    
    // Provide haptic feedback for skip action
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
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
            <View style={styles.headerControls}>
              <TouchableOpacity 
                style={styles.soundButton}
                onPress={() => setSoundEnabled(!soundEnabled)}
              >
                <Ionicons 
                  name={soundEnabled ? "volume-high" : "volume-mute"} 
                  size={20} 
                  color={soundEnabled ? "#4ecdc4" : "#a0a0a0"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
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
          <View style={[
            styles.timerContainer, 
            { backgroundColor: getTimerColor() },
            (timeLeft <= 3 && (timerState === 'work' || timerState === 'rest')) && styles.countdownPulse
          ]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={[
              styles.timerText,
              (timeLeft <= 3 && (timerState === 'work' || timerState === 'rest')) && styles.countdownText
            ]}>
              {formatTime(timeLeft)}
            </Text>
            {timeLeft <= 3 && (timerState === 'work' || timerState === 'rest') && (
              <Text style={styles.countdownAlert}>
                {soundEnabled ? '🔊' : '📳'} {timeLeft === 1 ? 'GO!' : 'Get Ready!'}
              </Text>
            )}
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsContainer}>
            {timerState === 'ready' && (
              <TouchableOpacity style={styles.startButton} onPress={startWorkout}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.buttonText}>Start Workout</Text>
              </TouchableOpacity>
            )}

            {(timerState === 'work' || timerState === 'rest') && (
              <View style={styles.activeControls}>
                <TouchableOpacity style={styles.pauseButton} onPress={pauseWorkout}>
                  <Ionicons name="pause" size={24} color="#fff" />
                  <Text style={styles.buttonText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.skipButton} onPress={skipToNext}>
                  <Ionicons name="play-forward" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            )}

            {timerState === 'paused' && (
              <View style={styles.pausedControls}>
                <TouchableOpacity style={styles.resumeButton} onPress={resumeWorkout}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={resetWorkout}>
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {timerState === 'finished' && (
              <TouchableOpacity style={styles.resetButton} onPress={resetWorkout}>
                <Ionicons name="refresh" size={24} color="#fff" />
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

          {/* Ad Area - Placeholder */}
          <View style={styles.adContainer}>
            <Text style={styles.adPlaceholder}>Advertisement Area</Text>
            <Text style={styles.adSubtext}>320x50 Banner Ad Space</Text>
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
  headerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  settingsButton: {
    padding: 8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  progressText: {
    fontSize: 12,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  exerciseContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 12,
  },
  stickFigureContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  videoContainer: {
    backgroundColor: '#2d2d4a',
    borderRadius: 12,
    padding: 6,
    overflow: 'hidden',
  },
  exerciseVideo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  timerContainer: {
    marginHorizontal: 20,
    marginVertical: 12,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  countdownPulse: {
    borderWidth: 2,
    borderColor: '#fff',
  },
  countdownText: {
    fontSize: 52,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  countdownAlert: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.9,
  },
  controlsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  startButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    backgroundColor: '#ffa726',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pausedControls: {
    flexDirection: 'row',
    gap: 12,
  },
  resumeButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: '#a0a0a0',
    marginTop: 2,
  },
  adContainer: {
    backgroundColor: '#2d2d4a',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a6a',
    borderStyle: 'dashed',
  },
  adPlaceholder: {
    color: '#8a8a8a',
    fontSize: 14,
    fontWeight: '600',
  },
  adSubtext: {
    color: '#6a6a6a',
    fontSize: 11,
    marginTop: 2,
  },
});