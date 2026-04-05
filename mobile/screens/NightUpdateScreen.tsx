import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { checkHealth, getAuditTime, setAuditTime, deleteAuditTime } from '../services/api';

interface FormData {
  updateTime: string;
}

export default function NightUpdateScreen() {
  const [formData, setFormData] = useState<FormData>({
    updateTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [currentAuditTime, setCurrentAuditTime] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from backend
  const loadData = useCallback(async () => {
    try {
      const healthy = await checkHealth();
      setIsConnected(healthy);

      if (healthy) {
        const audit = await getAuditTime();
        setCurrentAuditTime(audit.time);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    if (selectedTime) {
      setTime(selectedTime);
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setFormData({
        updateTime: `${hours}:${minutes}`,
      });
    }
    setShowTimePicker(false);
  };

  const handleSubmit = async () => {
    if (!formData.updateTime) {
      Alert.alert('Error', 'Please select a time');
      return;
    }

    try {
      await setAuditTime(formData.updateTime);
      setCurrentAuditTime(formData.updateTime);

      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          updateTime: '',
        });
        setTime(new Date());
        Alert.alert('Success', 'Night audit schedule has been updated successfully!');
      }, 1500);
    } catch (error) {
      console.error('Error scheduling audit:', error);
      Alert.alert(
        'Error',
        'Failed to schedule night update. Please check your backend connection.'
      );
    }
  };

  const handleDeleteAudit = () => {
    Alert.alert(
      'Delete Schedule',
      `Clear the night audit schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAuditTime();
              setCurrentAuditTime(null);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear schedule');
            }
          },
        },
      ]
    );
  };


  // Connection status badge
  const ConnectionBadge = () => (
    <View style={styles.connectionBadge}>
      <View
        style={[
          styles.connectionDot,
          {
            backgroundColor:
              isConnected === null
                ? '#ffa726'
                : isConnected
                ? '#4caf50'
                : '#ef5350',
          },
        ]}
      />
      <Text style={styles.connectionText}>
        {isConnected === null
          ? 'Checking...'
          : isConnected
          ? 'Connected'
          : 'Disconnected'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6b5344" />
        <Text style={styles.loadingText}>Connecting to backend...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6b5344"
              colors={['#6b5344']}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons
                name="moon-waning-crescent"
                size={36}
                color="#6b5344"
              />
              <Text style={styles.headerTitle}>Night Audit Schedule</Text>
              <Text style={styles.headerSubtitle}>
                Set the time for nightly audit to run
              </Text>
              <ConnectionBadge />
            </View>
          </View>

          {/* Disconnected Warning */}
          {isConnected === false && (
            <View style={styles.warningCard}>
              <MaterialCommunityIcons name="wifi-off" size={20} color="#ef5350" />
              <Text style={styles.warningText}>
                Cannot reach backend. Make sure the server is running on AWS EC2.
              </Text>
            </View>
          )}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={20} color="#b88a5f" />
              <Text style={styles.infoCardTitle}>How it works</Text>
            </View>
            <Text style={styles.infoCardText}>
              The night audit will be automatically triggered at the scheduled
              time every day. This automates the end-of-day process in eZee.
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Time Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Time for Night Audit</Text>
              <Text style={styles.sublabel}>
                The audit will run automatically at this time every day
              </Text>

              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowTimePicker(true)}
              >
                <View style={styles.timePickerContent}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={28}
                    color="#b88a5f"
                  />
                  <View style={styles.timeDisplay}>
                    <Text style={styles.timeLabel}>Selected Time</Text>
                    <Text style={styles.timeValue}>
                      {formData.updateTime || '--:--'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>

            {/* Confirmation Display */}
            {formData.updateTime && (
              <View style={styles.confirmationBox}>
                <View style={styles.confirmationHeader}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#4caf50"
                  />
                  <Text style={styles.confirmationTitle}>Time Selected</Text>
                </View>
                <Text style={styles.confirmationText}>
                  Night audit will be scheduled at{' '}
                  <Text style={styles.boldText}>{formData.updateTime}</Text> daily
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={isConnected === false}
              style={[
                styles.submitButton,
                submitted && styles.submitButtonSuccess,
              ]}
              labelStyle={styles.submitButtonLabel}
            >
              {submitted ? 'Schedule Updated!' : 'Schedule Night Audit'}
            </Button>
          </View>

          {/* Current Settings from Backend */}
          <View style={styles.settingsSection}>
            <Text style={styles.settingsTitle}>Current Settings</Text>

            <View style={styles.settingCard}>
              <View style={[styles.settingCardTop, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialCommunityIcons
                    name="moon-full"
                    size={24}
                    color="#6b5344"
                  />
                  <Text style={styles.settingCardTitle}>Night Audit Time</Text>
                </View>
                {currentAuditTime && (
                  <TouchableOpacity onPress={handleDeleteAudit} style={styles.deleteButton}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef5350" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.settingCardValue}>
                {currentAuditTime
                  ? `Scheduled at ${currentAuditTime}`
                  : 'Not configured'}
              </Text>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingCardTop}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color="#6b5344"
                />
                <Text style={styles.settingCardTitle}>Frequency</Text>
              </View>
              <Text style={styles.settingCardValue}>Daily</Text>
            </View>

            <View style={styles.settingCard}>
              <View style={styles.settingCardTop}>
                <MaterialCommunityIcons
                  name="server-network"
                  size={24}
                  color="#6b5344"
                />
                <Text style={styles.settingCardTitle}>Backend Status</Text>
              </View>
              <Text
                style={[
                  styles.settingCardValue,
                  { color: isConnected ? '#4caf50' : '#ef5350' },
                ]}
              >
                {isConnected ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.featuresTitle}>Features</Text>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={20} color="#4caf50" />
              <Text style={styles.featureText}>
                Automatic daily scheduling
              </Text>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={20} color="#4caf50" />
              <Text style={styles.featureText}>
                Email notification on completion
              </Text>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={20} color="#4caf50" />
              <Text style={styles.featureText}>Easy time adjustment</Text>
            </View>

            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="check" size={20} color="#4caf50" />
              <Text style={styles.featureText}>
                Push notification alerts
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f7f4',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ef5350',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#c62828',
    marginLeft: 12,
    lineHeight: 20,
  },
  infoCard: {
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#b88a5f',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  infoCardText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 16,
  },
  timePickerButton: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 20,
    backgroundColor: '#f9f7f4',
    marginBottom: 16,
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeDisplay: {
    marginLeft: 16,
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  confirmationBox: {
    backgroundColor: '#f1f8f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginLeft: 8,
  },
  confirmationText: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 6,
    backgroundColor: '#6b5344',
  },
  submitButtonSuccess: {
    backgroundColor: '#4caf50',
  },
  submitButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsSection: {
    marginBottom: 32,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff3f0',
  },
  settingCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 12,
  },
  settingCardValue: {
    fontSize: 14,
    color: '#b88a5f',
    fontWeight: '600',
    marginLeft: 36,
  },
  featuresSection: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#333333',
    marginLeft: 12,
  },
});
