import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../../../services/api';
import { useChatStore } from '../../../../stores/chat.store';
import { useAuthStore } from '../../../../stores/auth.store';
import MessageBubble from '../../../../components/chat/MessageBubble';
import ChatInput from '../../../../components/chat/ChatInput';
import type { MessageDTO, MatchDTO } from '@lehrstellen/shared';

export default function CompanyChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { messages, sendMessage, joinMatch, leaveMatch, connect, setMessages, isConnected } =
    useChatStore();
  const [match, setMatch] = useState<MatchDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  const matchMessages = messages[matchId!] || [];

  useEffect(() => {
    if (!matchId) return;

    const load = async () => {
      try {
        const [matchRes, messagesRes] = await Promise.all([
          api.get<MatchDTO>(`/matches/${matchId}`),
          api.get<MessageDTO[]>(`/matches/${matchId}/messages`),
        ]);
        setMatch(matchRes.data);
        setMessages(matchId, messagesRes.data);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    };

    load();

    if (accessToken && !isConnected) {
      connect(accessToken);
    }

    joinMatch(matchId);
    return () => {
      leaveMatch(matchId);
    };
  }, [matchId]);

  const handleSend = (content: string) => {
    if (!matchId) return;
    sendMessage(matchId, content);
  };

  const getStudentName = () => {
    if (match?.student) {
      return `${match.student.firstName} ${match.student.lastName}`;
    }
    return 'Bewerber';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4A90E2" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {getStudentName()}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {match?.listing?.title || ''}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={matchMessages}
          renderItem={({ item }) => (
            <MessageBubble message={item} isOwn={item.senderId === user?.id} />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Schreiben Sie die erste Nachricht!
              </Text>
            </View>
          }
        />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backText: {
    fontSize: 24,
    color: '#4A90E2',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyChatText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
