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
import { TextInput, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  checkHealth,
  getSchedules,
  addSchedule,
  deleteSchedule,
  PriceSchedule,
} from '../services/api';

interface FormData {
  categoryA: string;
  categoryB: string;
  categoryC: string;
  categoryD: string;
  updateTime: string;
}

export default function PriceUpdateScreen() {
  const [formData, setFormData] = useState<FormData>({
    categoryA: '',
    categoryB: '',
    categoryC: '',
    categoryD: '',
    updateTime: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [schedules, setSchedules] = useState<PriceSchedule[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check connection + load data
  const loadData = useCallback(async () => {
    try {
      const healthy = await checkHealth();
      setIsConnected(healthy);

      if (healthy) {
        const data = await getSchedules();
        setSchedules(data);
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }

    if (selectedTime) {
      setTime(selectedTime);
      const hours = String(selectedTime.getHours()).padStart(2, '0');
      const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
      setFormData((prev) => ({
        ...prev,
        updateTime: `${hours}:${minutes}`,
      }));
    }
    setShowTimePicker(false);
  };

  const handleSubmit = async () => {
    if (
      !formData.categoryA ||
      !formData.categoryB ||
      !formData.categoryC ||
      !formData.categoryD ||
      !formData.updateTime
    ) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const payload: PriceSchedule = {
        time: formData.updateTime,
        prices: {
          A: parseInt(formData.categoryA, 10),
          B: parseInt(formData.categoryB, 10),
          C: parseInt(formData.categoryC, 10),
          D: parseInt(formData.categoryD, 10),
        },
      };

      const result = await addSchedule(payload);
      setSchedules(result.data);

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          categoryA: '',
          categoryB: '',
          categoryC: '',
          categoryD: '',
          updateTime: '',
        });
        setTime(new Date());
        Alert.alert('Success', 'Price schedule saved successfully!');
      }, 1500);
    } catch (error: any) {
      console.error('Error updating prices:', error);
      Alert.alert(
        'Error',
        'Failed to update prices. Please check your connection to the backend.'
      );
    }
  };

  const handleDeleteSchedule = (scheduleTime: string) => {
    Alert.alert(
      'Delete Schedule',
      `Remove the schedule at ${scheduleTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteSchedule(scheduleTime);
              setSchedules(result.data);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete schedule');
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
        <ActivityIndicator size="large" color="#b88a5f" />
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
              tintColor="#b88a5f"
              colors={['#b88a5f']}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons name="currency-inr" size={36} color="#b88a5f" />
              <Text style={styles.headerTitle}>Room Price Management</Text>
              <Text style={styles.headerSubtitle}>
                Update pricing for all room categories
              </Text>
              <ConnectionBadge />
            </View>
          </View>

          {/* Disconnected Warning */}
          {isConnected === false && (
            <View style={styles.warningCard}>
              <MaterialCommunityIcons name="wifi-off" size={20} color="#ef5350" />
              <Text style={styles.warningText}>
                Cannot reach backend. Make sure the server is running and your
                phone is on the same Wi-Fi network.
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Category A */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Deluxe Queen AC Room</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#b88a5f" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={formData.categoryA}
                  onChangeText={(value) => handleInputChange('categoryA', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Category B */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Standard Queen AC Room</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#b88a5f" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={formData.categoryB}
                  onChangeText={(value) => handleInputChange('categoryB', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Category C */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Single AC Room</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#b88a5f" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={formData.categoryC}
                  onChangeText={(value) => handleInputChange('categoryC', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Category D */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Single Non AC Room</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons name="currency-inr" size={20} color="#b88a5f" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={formData.categoryD}
                  onChangeText={(value) => handleInputChange('categoryD', value)}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Time Picker */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Time to Update Price</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <MaterialCommunityIcons name="clock-outline" size={20} color="#b88a5f" />
                <Text style={styles.timeButtonText}>
                  {formData.updateTime || 'Select time'}
                </Text>
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
              {submitted ? 'Prices Updated Successfully!' : 'Update All Prices'}
            </Button>
          </View>

          {/* Active Schedules from Backend */}
          <View style={styles.schedulesSection}>
            <Text style={styles.sectionTitle}>
              Active Schedules ({schedules.length})
            </Text>

            {schedules.length === 0 ? (
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="calendar-blank"
                  size={40}
                  color="#ccc"
                />
                <Text style={styles.emptyText}>No active schedules</Text>
                <Text style={styles.emptySubtext}>
                  Add a schedule above to get started
                </Text>
              </View>
            ) : (
              schedules.map((schedule, index) => (
                <View key={`${schedule.time}-${index}`} style={styles.scheduleCard}>
                  <View style={styles.scheduleHeader}>
                    <View style={styles.scheduleTimeRow}>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={20}
                        color="#b88a5f"
                      />
                      <Text style={styles.scheduleTime}>{schedule.time}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteSchedule(schedule.time)}
                      style={styles.deleteButton}
                    >
                      <MaterialCommunityIcons
                        name="trash-can-outline"
                        size={20}
                        color="#ef5350"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.priceGrid}>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Cat A</Text>
                      <Text style={styles.priceValue}>₹{schedule.prices.A}</Text>
                    </View>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Cat B</Text>
                      <Text style={styles.priceValue}>₹{schedule.prices.B}</Text>
                    </View>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Cat C</Text>
                      <Text style={styles.priceValue}>₹{schedule.prices.C}</Text>
                    </View>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Cat D</Text>
                      <Text style={styles.priceValue}>₹{schedule.prices.D}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Category Info Cards */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Room Categories</Text>
            <View style={styles.categoryGrid}>
              <View style={[styles.categoryCard, { borderLeftColor: '#b88a5f' }]}>
                <Text style={styles.categoryName}>Deluxe Queen AC Room</Text>
                <Text style={styles.categoryDesc}>Category A</Text>
              </View>
              <View style={[styles.categoryCard, { borderLeftColor: '#d4a574' }]}>
                <Text style={styles.categoryName}>Standard Queen AC Room</Text>
                <Text style={styles.categoryDesc}>Category B</Text>
              </View>
              <View style={[styles.categoryCard, { borderLeftColor: '#c4955c' }]}>
                <Text style={styles.categoryName}>Single AC Room</Text>
                <Text style={styles.categoryDesc}>Category C</Text>
              </View>
              <View style={[styles.categoryCard, { borderLeftColor: '#a37447' }]}>
                <Text style={styles.categoryName}>Single Non AC Room</Text>
                <Text style={styles.categoryDesc}>Category D</Text>
              </View>
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingLeft: 12,
    backgroundColor: '#f9f7f4',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#1a1a1a',
    backgroundColor: 'transparent',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f7f4',
  },
  timeButtonText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 6,
    backgroundColor: '#b88a5f',
  },
  submitButtonSuccess: {
    backgroundColor: '#4caf50',
  },
  submitButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  schedulesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 4,
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#b88a5f',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff3f0',
  },
  priceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceItem: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#b88a5f',
  },
  infoSection: {
    marginBottom: 32,
  },
  categoryGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  categoryDesc: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});
