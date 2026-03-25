import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Message } from '../models/message';
import { ChatBubble } from '../components/ChatBubble';
import { QuickReplies } from '../components/QuickReplies';
import { TypingIndicator } from '../components/TypingIndicator';
import { sendMessage, ConversationMessage } from '../services/claudeService';

const API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY ?? '';

const WELCOME_MESSAGE: Message = {
  id: '0',
  role: 'assistant',
  content:
    "Hello! I'm MedBot, your City General Hospital assistant. I can help with appointments, departments, visiting hours, pharmacy info, and more. How can I assist you today?",
  timestamp: new Date(),
};

function toConversationHistory(msgs: Message[]): ConversationMessage[] {
  return msgs
    .filter((m) => m.id !== '0')
    .map((m) => ({ role: m.role, content: m.content }));
}

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(
    async (text: string = inputText.trim()) => {
      if (!text || isLoading) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      };

      const historySnapshot = toConversationHistory(messages);
      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setIsLoading(true);

      const startTime = Date.now();

      try {
        const reply = await sendMessage(
          [...historySnapshot, { role: 'user', content: text }],
          API_KEY,
        );

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
          responseMs: Date.now() - startTime,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. For emergencies, please call 911 or visit our Emergency Department.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [inputText, isLoading, messages],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏥</Text>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>MedBot</Text>
          <Text style={styles.headerSubtitle}>City General Hospital</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={({ item }) => <ChatBubble message={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {isLoading && <TypingIndicator />}

      {/* Quick Replies */}
      <QuickReplies onSelect={handleSend} disabled={isLoading} />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor="#9E9E9E"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={() => handleSend()}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  headerEmoji: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#66BB6A',
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1A1A2E',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1565C0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  sendIcon: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});
