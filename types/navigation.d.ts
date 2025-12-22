/**
 * ParkPedia - Navigation関連の型定義
 * React Navigationの画面遷移とパラメータの型を定義
 */

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Park } from './park';

/**
 * ルートパラメータの型定義
 * 各画面に渡されるパラメータを定義
 */
export type RootStackParamList = {
  Home: undefined;
  ParkDetail: {
    parkId: string;
    park?: Park;
  };
  AddReview: {
    parkId: string;
    parkName: string;
  };
  AddPark: {
    isEditMode?: boolean;
    parkData?: Park;
  };
  MyPage: undefined;
  Login: undefined;
  TermsOfService: undefined;
  Admin: undefined;
};

/**
 * Navigation Prop の型定義
 * 各画面で使用するnavigationオブジェクトの型
 */
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type ParkDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ParkDetail'
>;
export type AddReviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AddReview'
>;
export type AddParkScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddPark'>;
export type MyPageScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPage'>;
export type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;
export type TermsOfServiceScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TermsOfService'
>;
export type AdminScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Admin'>;

/**
 * Route Prop の型定義
 * 各画面で使用するrouteオブジェクトの型
 */
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type ParkDetailScreenRouteProp = RouteProp<RootStackParamList, 'ParkDetail'>;
export type AddReviewScreenRouteProp = RouteProp<RootStackParamList, 'AddReview'>;
export type AddParkScreenRouteProp = RouteProp<RootStackParamList, 'AddPark'>;
export type MyPageScreenRouteProp = RouteProp<RootStackParamList, 'MyPage'>;
export type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;
export type TermsOfServiceScreenRouteProp = RouteProp<RootStackParamList, 'TermsOfService'>;
export type AdminScreenRouteProp = RouteProp<RootStackParamList, 'Admin'>;

/**
 * Screen Props の型定義
 * 各画面のコンポーネントに渡されるpropsの型
 */
export interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: HomeScreenRouteProp;
}

export interface ParkDetailScreenProps {
  navigation: ParkDetailScreenNavigationProp;
  route: ParkDetailScreenRouteProp;
}

export interface AddReviewScreenProps {
  navigation: AddReviewScreenNavigationProp;
  route: AddReviewScreenRouteProp;
}

export interface AddParkScreenProps {
  navigation: AddParkScreenNavigationProp;
  route: AddParkScreenRouteProp;
}

export interface MyPageScreenProps {
  navigation: MyPageScreenNavigationProp;
  route: MyPageScreenRouteProp;
}

export interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
  route: LoginScreenRouteProp;
}

export interface TermsOfServiceScreenProps {
  navigation: TermsOfServiceScreenNavigationProp;
  route: TermsOfServiceScreenRouteProp;
}

export interface AdminScreenProps {
  navigation: AdminScreenNavigationProp;
  route: AdminScreenRouteProp;
}
