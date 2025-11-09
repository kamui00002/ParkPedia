import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';

export default function CustomHeader({ navigation, searchQuery, onSearchChange, currentScreen = 'search', onMenuPress }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* ロゴとナビゲーション */}
        <View style={styles.topRow}>
          <View style={styles.logoContainer}>
            {onMenuPress && (
              <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.logo}>ParkPedia</Text>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'search' && styles.navButtonActive]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={[styles.navButtonText, currentScreen === 'search' && styles.navButtonTextActive]}>
                公園検索
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'addPark' && styles.navButtonActive]}
              onPress={() => navigation.navigate('AddPark')}
            >
              <Text style={[styles.navButtonText, currentScreen === 'addPark' && styles.navButtonTextActive]}>
                公園を投稿
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'mypage' && styles.navButtonActive]}
              onPress={() => navigation.navigate('MyPage')}
            >
              <Text style={[styles.navButtonText, currentScreen === 'mypage' && styles.navButtonTextActive]}>
                マイページ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 検索バー */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="公園名、地域名で検索..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerContent: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
    padding: 6,
  },
  menuIcon: {
    fontSize: 22,
    color: '#4B5563',
  },
  logo: {
    fontSize: 20,
    fontWeight: '600',
    color: '#059669',
    letterSpacing: -0.5,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  navButtonActive: {
    backgroundColor: '#D1FAE5',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  navButtonTextActive: {
    color: '#059669',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#9CA3AF',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
});

