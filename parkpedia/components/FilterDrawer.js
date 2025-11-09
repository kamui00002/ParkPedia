import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  SafeAreaView,
} from 'react-native';

const FILTER_CATEGORIES = [
  {
    id: 'age',
    name: '対象年齢',
    options: ['0-2歳', '3-5歳', '6歳以上'],
  },
  {
    id: 'equipment',
    name: '遊具',
    options: ['すべり台', 'ブランコ', '砂場', '鉄棒', 'ジャングルジム', '水遊び'],
  },
  {
    id: 'facilities',
    name: '設備',
    options: ['トイレあり', 'オムツ交換台', '駐車場あり', '日陰が多い', 'ベビーカーOK', 'ボール遊び可'],
  },
  {
    id: 'distance',
    name: '距離で絞り込み',
    options: ['500m以内', '1km以内', '5km以内'],
    type: 'single', // 単一選択
  },
  {
    id: 'rating',
    name: '評価で絞り込み',
    options: ['⭐4.5以上', '⭐4.0以上'],
    type: 'single', // 単一選択
  },
];

export default function FilterDrawer({ visible, onClose, filters, onFilterChange }) {
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

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
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.drawer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <SafeAreaView style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>絞り込み検索</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
              {FILTER_CATEGORIES.map(category => (
                <View key={category.id} style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>{category.name}</Text>
                  {category.options.map(option => {
                    const isSelected = (filters[category.id] || []).includes(option);
                    return (
                      <TouchableOpacity
                        key={option}
                        style={styles.filterOption}
                        onPress={() => handleFilterChange(category.id, option)}
                      >
                        <View style={[
                          category.type === 'single' ? styles.radio : styles.checkbox,
                          isSelected && styles.checkboxSelected
                        ]}>
                          {isSelected && (
                            category.type === 'single' ? (
                              <View style={styles.radioInner} />
                            ) : (
                              <Text style={styles.checkmark}>✓</Text>
                            )
                          )}
                        </View>
                        <Text style={styles.filterOptionText}>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
              <View style={styles.resetButtonContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => {
                    onFilterChange({
                      age: [],
                      equipment: [],
                      facilities: [],
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  drawer: {
    width: 280,
    height: '100%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065F46',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#F9FAFB',
  },
  closeButtonText: {
    fontSize: 22,
    color: '#6B7280',
    lineHeight: 22,
  },
  filterContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 28,
  },
  filterSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
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
    fontSize: 13,
    fontWeight: '600',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '400',
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginRight: 12,
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
    marginTop: 20,
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
});

