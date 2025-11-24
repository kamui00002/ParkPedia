// 利用規約画面
// アプリの利用規約を表示

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function TermsOfServiceScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>利用規約</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>ParkPedia 利用規約</Text>
        <Text style={styles.lastUpdated}>最終更新日: 2025年11月25日</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第1条（適用）</Text>
          <Text style={styles.paragraph}>
            本利用規約（以下「本規約」といいます）は、ParkPedia（以下「本アプリ」といいます）の利用条件を定めるものです。
            本アプリを利用される全てのユーザー（以下「ユーザー」といいます）は、本規約に同意したものとみなされます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第2条（禁止事項）</Text>
          <Text style={styles.paragraph}>
            ユーザーは、本アプリの利用にあたり、以下の行為をしてはなりません：
          </Text>
          <Text style={styles.listItem}>• 法令または公序良俗に違反する行為</Text>
          <Text style={styles.listItem}>• 犯罪行為に関連する行為</Text>
          <Text style={styles.listItem}>• 他のユーザーや第三者の権利を侵害する行為</Text>
          <Text style={styles.listItem}>• 不適切、攻撃的、差別的、または暴力的なコンテンツの投稿</Text>
          <Text style={styles.listItem}>• 虚偽の情報を投稿する行為</Text>
          <Text style={styles.listItem}>• わいせつな表現や児童ポルノを含む内容の投稿</Text>
          <Text style={styles.listItem}>• スパムやその他の迷惑行為</Text>
          <Text style={styles.listItem}>• 他のユーザーへの嫌がらせやいじめ</Text>
          <Text style={styles.listItem}>• 本アプリの運営を妨害する行為</Text>
          <Text style={styles.listItem}>• 不正アクセスやコンピューターウイルスの送信</Text>
          <Text style={styles.listItem}>• その他、運営者が不適切と判断する行為</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第3条（ユーザー生成コンテンツ）</Text>
          <Text style={styles.paragraph}>
            本アプリでは、ユーザーが公園のレビューや写真を投稿できます。
            ユーザーは投稿したコンテンツについて責任を負い、不適切なコンテンツを投稿しないことに同意するものとします。
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>重要：</Text> 不適切なコンテンツや悪質なユーザーは、一切容認されません。
            不適切なコンテンツを発見した場合は、報告機能を使用してご報告ください。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第4条（コンテンツのモデレーション）</Text>
          <Text style={styles.paragraph}>
            運営者は、不適切なコンテンツの報告を受けた場合、24時間以内に以下の対応を行います：
          </Text>
          <Text style={styles.listItem}>• 報告されたコンテンツの削除</Text>
          <Text style={styles.listItem}>• 違反したユーザーのアカウント停止または削除</Text>
          <Text style={styles.paragraph}>
            ユーザーは、不適切なコンテンツを報告する機能および悪質なユーザーをブロックする機能を利用できます。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第5条（アカウントの削除）</Text>
          <Text style={styles.paragraph}>
            ユーザーは、いつでもアカウントを削除することができます。
            アカウント削除は、マイページから実行できます。
            アカウントを削除すると、すべてのユーザーデータ（お気に入り、レビュー、写真など）が完全に削除されます。
            この操作は取り消せませんのでご注意ください。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第6条（プライバシー）</Text>
          <Text style={styles.paragraph}>
            ユーザーの個人情報の取り扱いについては、別途プライバシーポリシーに定めるところによります。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第7条（免責事項）</Text>
          <Text style={styles.paragraph}>
            運営者は、本アプリに掲載される情報の正確性、完全性、有用性等について保証するものではありません。
            本アプリの利用により生じた損害について、運営者は一切の責任を負いません。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第8条（規約の変更）</Text>
          <Text style={styles.paragraph}>
            運営者は、必要に応じて本規約を変更することができます。
            変更後の利用規約は、本アプリ上に掲載された時点で効力を生じるものとします。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>第9条（お問い合わせ）</Text>
          <Text style={styles.paragraph}>
            本規約に関するお問い合わせは、アプリ内のお問い合わせフォームまたはApp Storeのレビューにてお願いいたします。
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#064E3B',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#064E3B',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  listItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 8,
  },
  bold: {
    fontWeight: '700',
    color: '#DC2626',
  },
  bottomSpace: {
    height: 40,
  },
});
