// 管理者権限チェック用ユーティリティ
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

/**
 * 現在のユーザーが管理者かどうかをチェック
 * @returns {Promise<boolean>} 管理者の場合true
 */
export const checkIsAdmin = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }

    // adminsコレクションから現在のユーザーIDをドキュメントIDとして直接取得
    // ドキュメントIDがuserIdと一致する構造を想定
    const adminDocRef = doc(db, 'admins', currentUser.uid);
    const adminDocSnap = await getDoc(adminDocRef);

    return adminDocSnap.exists();
  } catch (error) {
    if (__DEV__) {
      console.error('管理者チェックエラー:', error);
    }
    return false;
  }
};

/**
 * 管理者UIDのリストを取得（管理者のみ）
 * @returns {Promise<string[]>} 管理者UIDの配列
 */
export const getAdminUserIds = async () => {
  try {
    const adminsRef = collection(db, 'admins');
    const querySnapshot = await getDocs(adminsRef);
    
    const adminIds = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId) {
        adminIds.push(data.userId);
      }
    });
    
    return adminIds;
  } catch (error) {
    if (__DEV__) {
      console.error('管理者リスト取得エラー:', error);
    }
    return [];
  }
};

