import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FILTER_CATEGORIES } from '../constants/parkOptions';

export default function FilterDrawer({ visible, onClose, filters, onFilterChange }) {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;
  const [expandedCategories, setExpandedCategories] = useState({});

  const toggleCategory = categoryId => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleFilterChange = (category, option) => {
    const categoryData = FILTER_CATEGORIES.find(cat => cat.id === category);
    const isSingleSelect = categoryData?.type === 'single';

    if (isSingleSelect) {
      // 単一選択の場合、選択中のものと同じなら解除、違うなら置き換え
      const currentFilters = filters[category] || [];
      const newFilters = currentFilters.includes(option)
        ? [] // 同じものをクリックしたら解除
        : [option]; // 新しいものを選択

      onFilterChange({
        ...filters,
        [category]: newFilters,
      });
    } else {
      // 複数選択の場合
      const currentFilters = filters[category] || [];
      const newFilters = currentFilters.includes(option)
        ? currentFilters.filter(item => item !== option)
        : [...currentFilters, option];

      onFilterChange({
        ...filters,
        [category]: newFilters,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
          testID="filter-drawer"
          accessible={true}
          accessibilityLabel="filter-drawer"
          accessibilityRole="menu"
        >
          <SafeAreaView style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>絞り込み検索</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                testID="filter-close-button"
                accessible={true}
                accessibilityLabel="filter-close-button"
                accessibilityRole="button"
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {FILTER_CATEGORIES.map(category => {
                const selectedCount = (filters[category.id] || []).length;
                const isExpanded = expandedCategories[category.id] !== false; // デフォルトは展開
                return (
                  <View key={category.id} style={styles.filterSection}>
                    <TouchableOpacity
                      style={styles.filterSectionHeader}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <Text style={styles.filterSectionTitle}>
                        {category.name}
                        {selectedCount > 0 && (
                          <Text style={styles.filterCount}> ({selectedCount})</Text>
                        )}
                      </Text>
                      <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {isExpanded &&
                      category.options.map(option => {
                        const isSelected = (filters[category.id] || []).includes(option);
                        return (
                          <TouchableOpacity
                            key={option}
                            style={styles.filterOption}
                            onPress={() => handleFilterChange(category.id, option)}
                          >
                            <View
                              style={[
                                category.type === 'single' ? styles.radio : styles.checkbox,
                                isSelected && styles.checkboxSelected,
                              ]}
                            >
                              {isSelected &&
                                (category.type === 'single' ? (
                                  <View style={styles.radioInner} />
                                ) : (
                                  <Text style={styles.checkmark}>✓</Text>
                                ))}
                            </View>
                            <Text style={styles.filterOptionText}>{option}</Text>
                          </TouchableOpacity>
                        );
                      })}
                  </View>
                );
              })}
              <View style={styles.resetButtonContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    onFilterChange({
                      age: [],
                      equipment: [],
                      facilities: [],
                      ground: [],
                      scenery: [],
                      sports: [],
                      distance: [],
                      rating: [],
                    });
                  }}
                >
                  <Text style={styles.resetButtonText}>フィルターをリセット</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 78, 59, 0.15)',
  },
  drawer: {
    width: 300,
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    shadowColor: '#064E3B',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 0,
    backgroundColor: '#F5FBF8',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#064E3B',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    lineHeight: 20,
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 16,
    backgroundColor: '#F5FBF8',
    borderRadius: 14,
    padding: 14,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#064E3B',
    letterSpacing: -0.3,
  },
  filterCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expandIcon: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  resetButtonContainer: {
    marginTop: 16,
    marginBottom: 30,
    paddingTop: 16,
  },
  resetButton: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '700',
  },
});
