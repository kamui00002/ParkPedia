import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { auth } from '../firebaseConfig';

export default function CustomHeader({
  navigation,
  searchQuery,
  onSearchChange,
  currentScreen = 'search',
  onMenuPress,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        {/* ロゴとナビゲーション */}
        <View style={styles.topRow}>
          <View style={styles.logoContainer}>
            {onMenuPress && (
              <TouchableOpacity
                onPress={onMenuPress}
                style={styles.menuButton}
                testID="filter-button"
                accessible={true}
                accessibilityLabel="filter-button"
                accessibilityRole="button"
              >
                <Text style={styles.menuIcon}>☰</Text>
              </TouchableOpacity>
            )}
            <Text
              style={styles.logo}
              testID="app-title"
              accessible={true}
              accessibilityLabel="app-title"
            >
              ParkPedia
            </Text>
          </View>
          <View style={styles.navButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'search' && styles.navButtonActive]}
              onPress={() => navigation.navigate('Home')}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentScreen === 'search' && styles.navButtonTextActive,
                ]}
              >
                公園検索
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'addPark' && styles.navButtonActive]}
              onPress={() => {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                  Alert.alert('ログインが必要です', '公園を投稿するにはログインが必要です。', [
                    {
                      text: 'ログイン',
                      onPress: () => navigation.navigate('Login'),
                    },
                    {
                      text: 'キャンセル',
                      style: 'cancel',
                    },
                  ]);
                } else {
                  navigation.navigate('AddPark');
                }
              }}
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentScreen === 'addPark' && styles.navButtonTextActive,
                ]}
              >
                公園を投稿
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentScreen === 'mypage' && styles.navButtonActive]}
              onPress={() => {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                  Alert.alert(
                    'ログインが必要です',
                    'マイページを表示するにはログインが必要です。',
                    [
                      {
                        text: 'ログイン',
                        onPress: () => navigation.navigate('Login'),
                      },
                      {
                        text: 'キャンセル',
                        style: 'cancel',
                      },
                    ]
                  );
                } else {
                  navigation.navigate('MyPage');
                }
              }}
              testID="mypage-button"
              accessible={true}
              accessibilityLabel="mypage-button"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.navButtonText,
                  currentScreen === 'mypage' && styles.navButtonTextActive,
                ]}
              >
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
            testID="search-input"
            accessible={true}
            accessibilityLabel="search-input"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 0,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
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
    marginRight: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
  },
  menuIcon: {
    fontSize: 20,
    color: '#059669',
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: -0.8,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 3,
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  navButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  navButtonTextActive: {
    color: '#059669',
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 10,
    color: '#10B981',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '400',
  },
});
