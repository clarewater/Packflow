import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Reanimated, {
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { PackingItemCard } from '@/src/components/ui';
import { packingScenarioMocks } from '@/src/mocks';
import type { PackingItem, PackingScenario } from '@/src/types';

const INITIAL_SCENARIOS = packingScenarioMocks;
const SCENARIOS_STORAGE_KEY = 'packflow.scenarios';
const SELECTED_SCENARIO_STORAGE_KEY = 'packflow.selectedScenarioId';
const listItemTransition = LinearTransition.springify()
  .damping(18)
  .stiffness(180);

export function ScenarioScreen() {
  const [scenarios, setScenarios] = useState<PackingScenario[]>(INITIAL_SCENARIOS);
  const [selectedScenarioId, setSelectedScenarioId] = useState(
    INITIAL_SCENARIOS[0]?.id ?? ''
  );
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftScenarioName, setDraftScenarioName] = useState('');
  const [isAddingScenario, setIsAddingScenario] = useState(false);

  const selectedScenario =
    scenarios.find((scenario) => scenario.id === selectedScenarioId) ??
    scenarios[0];
  const items = selectedScenario?.items ?? [];

  useEffect(() => {
    let isMounted = true;

    const hydrateSavedState = async () => {
      try {
        const [savedScenariosJson, savedSelectedScenarioId] =
          await Promise.all([
            AsyncStorage.getItem(SCENARIOS_STORAGE_KEY),
            AsyncStorage.getItem(SELECTED_SCENARIO_STORAGE_KEY),
          ]);

        if (!isMounted) {
          return;
        }

        const savedScenarios = parseSavedScenarios(savedScenariosJson);

        if (savedScenarios) {
          setScenarios(savedScenarios);

          const hasSavedSelectedScenario =
            typeof savedSelectedScenarioId === 'string' &&
            savedScenarios.some(
              (scenario) => scenario.id === savedSelectedScenarioId
            );
          setSelectedScenarioId(
            hasSavedSelectedScenario
              ? savedSelectedScenarioId
              : savedScenarios[0]?.id ?? ''
          );
        }
      } catch (error) {
        console.warn('Failed to load saved packing scenarios.', error);
      } finally {
        if (isMounted) {
          setHasHydratedStorage(true);
        }
      }
    };

    hydrateSavedState();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) {
      return;
    }

    const persistState = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(scenarios)),
          AsyncStorage.setItem(
            SELECTED_SCENARIO_STORAGE_KEY,
            selectedScenario?.id ?? ''
          ),
        ]);
      } catch (error) {
        console.warn('Failed to save packing scenarios.', error);
      }
    };

    persistState();
  }, [hasHydratedStorage, scenarios, selectedScenario?.id]);

  const handleToggleItem = (itemId: string) => {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id !== selectedScenarioId
          ? scenario
          : {
              ...scenario,
              items: scenario.items.map((item) =>
                item.id === itemId ? { ...item, isPacked: !item.isPacked } : item
              ),
            }
      )
    );
  };

  const handleDeleteItem = (itemId: string) => {
    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id !== selectedScenarioId
          ? scenario
          : {
              ...scenario,
              items: scenario.items.filter((item) => item.id !== itemId),
            }
      )
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

    setScenarios((currentScenarios) =>
      currentScenarios.map((scenario) =>
        scenario.id !== selectedScenarioId
          ? scenario
          : {
              ...scenario,
              items: [...scenario.items, newItem],
            }
      )
    );
    setDraftName('');
  };

  const handleAddScenario = () => {
    const normalizedName = draftScenarioName.trim();

    if (!normalizedName) {
      return;
    }

    const newScenario: PackingScenario = {
      id: `scenario-${Date.now()}`,
      name: normalizedName,
      description: `${normalizedName} 场景清单。`,
      items: [],
    };

    setScenarios((currentScenarios) => [...currentScenarios, newScenario]);
    setSelectedScenarioId(newScenario.id);
    setDraftScenarioName('');
    setIsAddingScenario(false);
  };

  const handleDeleteScenario = (scenarioId: string) => {
    if (scenarios.length <= 1) {
      return;
    }

    const nextScenarios = scenarios.filter((scenario) => scenario.id !== scenarioId);
    setScenarios(nextScenarios);

    if (selectedScenarioId === scenarioId) {
      setSelectedScenarioId(nextScenarios[0]?.id ?? '');
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Animatable.View
        animation="fadeInDown"
        duration={420}
        easing="ease-out-cubic"
        style={styles.headerRow}
        useNativeDriver
      >
        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Your Needs</Text>
          <View style={styles.currentScenarioRow}>
            <Text style={styles.currentScenarioIcon}>
              {getScenarioIcon(selectedScenario?.id ?? '')}
            </Text>
            <Text style={styles.currentScenarioText}>
              {selectedScenario?.name ?? '场景'}
            </Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.headerAction,
            pressed && styles.headerActionPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Add scenario"
          onPress={() => setIsAddingScenario((currentValue) => !currentValue)}
        >
          <Feather
            name={isAddingScenario ? 'x' : 'plus-circle'}
            size={19}
            color="#8d9199"
          />
        </Pressable>
      </Animatable.View>

      <Animatable.View
        animation="fadeInRight"
        duration={460}
        delay={60}
        easing="ease-out-cubic"
        useNativeDriver
      >
        <FlatList
          horizontal
          data={scenarios}
          keyExtractor={(scenario) => scenario.id}
          contentContainerStyle={styles.scenarioList}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: scenario }) => {
            const isActive = scenario.id === selectedScenarioId;

            return (
              <ScenarioChip
                scenario={scenario}
                isActive={isActive}
                canDelete={scenarios.length > 1}
                onPress={() => setSelectedScenarioId(scenario.id)}
                onDelete={handleDeleteScenario}
              />
            );
          }}
        />
      </Animatable.View>

      {isAddingScenario ? (
        <Animatable.View
          animation="fadeInDown"
          duration={280}
          easing="ease-out-cubic"
          style={styles.addScenarioRow}
          useNativeDriver
        >
          <TextInput
            value={draftScenarioName}
            onChangeText={setDraftScenarioName}
            placeholder="Add new scenario"
            placeholderTextColor="#aaa39a"
            style={styles.addScenarioInput}
            returnKeyType="done"
            onSubmitEditing={handleAddScenario}
          />
          <Pressable
            style={({ pressed }) => [
              styles.addScenarioButton,
              pressed && styles.addScenarioButtonPressed,
            ]}
            onPress={handleAddScenario}
            accessibilityRole="button"
            accessibilityLabel="Confirm add scenario"
          >
            <Text style={styles.addScenarioButtonText}>Add</Text>
          </Pressable>
        </Animatable.View>
      ) : null}

      <Animatable.View
        animation="fadeInUp"
        duration={380}
        delay={100}
        easing="ease-out-cubic"
        style={styles.inputRow}
        useNativeDriver
      >
        <TextInput
          value={draftName}
          onChangeText={setDraftName}
          placeholder="Add new item"
          placeholderTextColor="#97928b"
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAddItem}
        />
        <Animatable.View
          animation="pulse"
          duration={220}
          iterationCount={1}
          easing="ease-out-cubic"
          useNativeDriver
        >
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
        </Animatable.View>
      </Animatable.View>

      <View style={styles.list}>
        {items.map((item, index) => (
          <Reanimated.View
            key={item.id}
            layout={listItemTransition}
            style={styles.listItem}
          >
            <Animatable.View
              animation="fadeInUp"
              duration={260}
              delay={120 + index * 28}
              easing="ease-out-cubic"
              useNativeDriver
            >
              <PackingItemCard
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            </Animatable.View>
          </Reanimated.View>
        ))}
      </View>
      <Animatable.Text
        animation="fadeInUp"
        duration={420}
        delay={160}
        easing="ease-out-cubic"
        style={styles.quote}
        useNativeDriver
      >
        {selectedScenario?.description ??
          'Travel light in your mind, not in your preparation.'}
      </Animatable.Text>
    </ScrollView>
  );
}

interface ScenarioChipProps {
  scenario: PackingScenario;
  isActive: boolean;
  canDelete: boolean;
  onPress: () => void;
  onDelete: (scenarioId: string) => void;
}

function ScenarioChip({
  scenario,
  isActive,
  canDelete,
  onPress,
  onDelete,
}: ScenarioChipProps) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const SWIPE_THRESHOLD = -42;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .failOffsetX([-16, 16])
    .onUpdate((event) => {
      if (!canDelete) {
        return;
      }

      translateY.value = Math.min(0, event.translationY);
    })
    .onEnd(() => {
      if (!canDelete) {
        translateY.value = withSpring(0);
        return;
      }

      if (translateY.value < SWIPE_THRESHOLD) {
        translateY.value = withTiming(-62, { duration: 140 });
        opacity.value = withTiming(0, { duration: 140 }, (finished) => {
          if (finished) {
            runOnJS(onDelete)(scenario.id);
          }
        });
      } else {
        translateY.value = withSpring(0, { damping: 14, stiffness: 180 });
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <Reanimated.View style={animatedStyle}>
        <Pressable
          style={({ pressed }) => [
            styles.scenarioChip,
            isActive && styles.scenarioChipActive,
            pressed && styles.scenarioChipPressed,
          ]}
          onPress={onPress}
        >
          <Text
            style={[
              styles.scenarioChipText,
              isActive && styles.scenarioChipTextActive,
            ]}
          >
            {getScenarioIcon(scenario.id)} {scenario.name}
          </Text>
        </Pressable>
      </Reanimated.View>
    </GestureDetector>
  );
}

function parseSavedScenarios(savedScenariosJson: string | null) {
  if (!savedScenariosJson) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(savedScenariosJson);

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return null;
    }

    const hasValidScenarios = parsedValue.every(isPackingScenario);
    return hasValidScenarios ? parsedValue : null;
  } catch {
    return null;
  }
}

function isPackingScenario(value: unknown): value is PackingScenario {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const scenario = value as Partial<PackingScenario>;

  return (
    typeof scenario.id === 'string' &&
    typeof scenario.name === 'string' &&
    typeof scenario.description === 'string' &&
    Array.isArray(scenario.items) &&
    scenario.items.every(isPackingItem)
  );
}

function isPackingItem(value: unknown): value is PackingItem {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<PackingItem>;

  return (
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.category === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.isRequired === 'boolean' &&
    typeof item.isPacked === 'boolean' &&
    (item.note === undefined || typeof item.note === 'string')
  );
}

function getScenarioIcon(scenarioId: string) {
  switch (scenarioId) {
    case 'exam':
      return '✓';
    case 'business-trip':
      return '▣';
    case 'travel':
      return '✈';
    case 'concert':
      return '♪';
    default:
      return '◇';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4f2ee',
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 74,
    paddingBottom: 52,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
  },
  headerTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    marginBottom: 10,
    fontSize: 31,
    fontWeight: '800',
    color: '#1f2738',
  },
  currentScenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentScenarioIcon: {
    fontSize: 14,
    color: '#4d5563',
  },
  currentScenarioText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#66696f',
  },
  headerAction: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: '#f2efea',
  },
  headerActionPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.95 }],
  },
  scenarioList: {
    paddingBottom: 10,
    gap: 14,
  },
  scenarioChip: {
    minWidth: 92,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fffdfa',
    borderWidth: 1,
    borderColor: '#d8d2c8',
    shadowColor: '#cec6bb',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 0.5,
  },
  scenarioChipActive: {
    backgroundColor: '#101c33',
    borderColor: '#101c33',
    shadowColor: '#101c33',
    shadowOpacity: 0.24,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  scenarioChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7b818d',
  },
  scenarioChipPressed: {
    opacity: 0.82,
  },
  scenarioChipTextActive: {
    color: '#ffffff',
  },
  addScenarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 6,
    gap: 10,
  },
  addScenarioInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#dfd9d0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#faf8f4',
    fontSize: 15,
    color: '#63676d',
  },
  addScenarioButton: {
    height: 42,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17233b',
  },
  addScenarioButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.96 }],
  },
  addScenarioButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f8f7f2',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
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
