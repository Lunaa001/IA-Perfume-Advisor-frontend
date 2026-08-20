import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundTexture } from '@/components/chat/background-texture';
import { ChatHeader, HEADER_CLEARANCE } from '@/components/chat/chat-header';
import { ChatInputBar } from '@/components/chat/chat-input-bar';
import { HeroLogo } from '@/components/chat/hero-logo';
import { HeroOverlay } from '@/components/chat/hero-overlay';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TopFade } from '@/components/chat/top-fade';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import type { ChatMessage } from '@/components/chat/types';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sendChatMessage } from '@/lib/chat';

export default function ChatScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const headerClearance = insets.top + HEADER_CLEARANCE;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [hasUserMessaged, setHasUserMessaged] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isWaitingReply, setIsWaitingReply] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [messages]);

  useEffect(() => {
    if (!isWaitingReply) return;
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    return () => clearTimeout(timer);
  }, [isWaitingReply]);

  useEffect(() => {
    const greetings: ChatMessage[] = [
      { id: 'greeting-1', role: 'assistant', text: 'Hola, ¿cómo estás?' },
      {
        id: 'greeting-2',
        role: 'assistant',
        text: 'Contame qué buscás y encontramos tu fragancia',
      },
    ];

    const timers = greetings.map((greeting, index) =>
      setTimeout(
        () => setMessages((prev) => [...prev, greeting]),
        500 + index * 900
      )
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { id: `${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setHasUserMessaged(true);
    setIsWaitingReply(true);

    try {
      const reply = await sendChatMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        { id: reply.id, role: 'assistant', text: reply.response, recommendations: reply.recommendations },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          role: 'assistant',
          text: 'No pude conectarme para responderte. Probá de nuevo en un momento.',
        },
      ]);
    } finally {
      setIsWaitingReply(false);
    }
  };

  const screenBackground = hasUserMessaged ? colors.chatBackground : colors.background;
  const textureColor = hasUserMessaged ? colors.textureOnChat : colors.texture;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: screenBackground }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackgroundTexture color={textureColor} />
      <TopFade />
      <HeroOverlay fadingOut={hasUserMessaged} />
      <ChatHeader />

      <View style={[styles.flex, hasUserMessaged && { marginTop: headerClearance }]}>
        <HeroLogo fadingOut={hasUserMessaged || inputFocused} />
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={
            hasUserMessaged ? styles.messagesContentChat : styles.messagesContentHero
          }
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isWaitingReply ? <TypingIndicator /> : null}
        />
      </View>

      <ChatInputBar
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        onFocus={() => setInputFocused(true)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  messagesContentHero: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 16,
    paddingBottom: 16,
  },
  messagesContentChat: { paddingTop: 12, paddingBottom: 16 },
});
