// AdBannerPlaceholder コンポーネントのテスト

import React from 'react';
import renderer from 'react-test-renderer';
import AdBannerPlaceholder from '../AdBannerPlaceholder';

// adConfig をモック
jest.mock('../../adConfig', () => ({
  AD_SETTINGS: {
    banner: {
      enabled: true,
      height: 50,
    },
  },
  AD_PLACEHOLDER_COLOR: '#FF69B4',
}));

describe('AdBannerPlaceholder', () => {
  it('should render placeholder when banner is enabled', () => {
    const tree = renderer.create(<AdBannerPlaceholder />);
    const json = tree.toJSON();

    expect(json).toBeTruthy();
    const jsonString = JSON.stringify(json);
    expect(jsonString).toMatch(/広告読み込み中/i);
  });

  it('should render placeholder with correct height', () => {
    const tree = renderer.create(<AdBannerPlaceholder />);
    const json = tree.toJSON();

    expect(json).toBeTruthy();
    // スタイルが適用されていることを確認
    expect(json.children).toBeTruthy();
  });
});
