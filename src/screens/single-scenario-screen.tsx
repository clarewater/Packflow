import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';

import { PackingItemCard } from '@/src/components/ui';
import { hotelPackingScenarioMock } from '@/src/mocks';
import type { PackingItem } from '@/src/types';

const INITIAL_ITEMS = hotelPackingScenarioMock.items;
const listItemTransition = LinearTransition.springify()
  .damping(18)
  .stiffness(180);

export function SingleScenarioScreen() {
  const [items, setItems] = useState<PackingItem[]>(INITIAL_ITEMS);
  const [draftName, setDraftName] = useState('');

  const handleToggleItem = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  };

  const handleAddItem = () => {
    const normalizedName = draftName.trim();

    if (!normalizedName) {
      return;
    }

    const newItem: PackingItem = {
      id: `custom-${Date.now()}`,
      name: normalizedName,
      category: '临时添加',
      quantity: 1,
      isRequired: false,
      isPacked: false,
    };

    setItems((currentItems) => [...currentItems, newItem]);
    setDraftName('');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Your Needs</Text>

      <View style={styles.inputRow}>
        <TextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder="Add new item"
          placeholderTextColor="#97928b"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAddItem}
        />
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed,
          ]}
          onPress={handleAddItem}
          accessibilityRole="button"
          accessibilityLabel="Add item"
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <Animated.View
            key={item.id}
            layout={listItemTransition}
            entering={FadeInDown.duration(240).springify().damping(16)}
            style={styles.listItem}
          >
            <PackingItemCard
              item={item}
              onToggle={handleToggleItem}
              onDelete={handleDeleteItem}
            />
          </Animated.View>
        ))}
      </View>
      <Text style={styles.quote}>
        Travel light in your mind, not in your preparation.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f2ee',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 92,
    paddingBottom: 52,
  },
  title: {
    marginBottom: 34,
    fontSize: 30,
    fontWeight: '800',
    color: '#45474d',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderBottomWidth: 1.2,
    borderBottomColor: '#9a9a98',
    fontSize: 17,
    color: '#7d7f84',
    paddingHorizontal: 4,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66686d',
  },
  addButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.94 }],
  },
  addButtonText: {
    marginTop: -2,
    fontSize: 28,
    lineHeight: 28,
    color: '#f5f3ef',
  },
  list: {
    gap: 18,
  },
  listItem: {
    width: '100%',
  },
  quote: {
    marginTop: 34,
    fontSize: 14,
    lineHeight: 23,
    fontStyle: 'italic',
    color: '#ada8a1',
  },
});
