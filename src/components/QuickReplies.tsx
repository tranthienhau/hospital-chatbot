import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

const QUICK_REPLIES = [
  'Book Appointment',
  'Emergency Contacts',
  'Visiting Hours',
  'Departments',
  'Pharmacy Hours',
  'Billing & Insurance',
];

interface QuickRepliesProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

export function QuickReplies({ onSelect, disabled }: QuickRepliesProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {QUICK_REPLIES.map((reply) => (
        <TouchableOpacity
          key={reply}
          style={[styles.chip, disabled && styles.chipDisabled]}
          onPress={() => onSelect(reply)}
          disabled={disabled}
        >
          <Text style={[styles.chipText, disabled && styles.chipTextDisabled]}>
            {reply}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: 48,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 13,
    color: '#1565C0',
    fontWeight: '500',
  },
  chipTextDisabled: {
    color: '#9E9E9E',
  },
});
