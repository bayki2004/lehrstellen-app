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
import { colors, typography, fontWeights, spacing } from '../../../../constants/theme';
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
          <ActivityIndicator size="large" color={colors.primary} />
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
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: fontWeights.semiBold,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
    marginTop: 1,
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingVertical: spacing.md,
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
    padding: spacing.xxl,
  },
  emptyChatText: {
    fontSize: typography.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
