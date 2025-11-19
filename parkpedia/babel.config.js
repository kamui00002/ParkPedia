module.exports = function(api) {
  api.cache(true);
  
  // プラットフォームを判定（Web版を検出）
  const isWeb = process.env.EXPO_PLATFORM === 'web' || 
                process.env.BABEL_ENV === 'web' ||
                process.argv.includes('--web');
  
  const plugins = [];
  
  // Web版ではreact-native-reanimatedプラグインを無効化
  // ネイティブ版でのみ有効化
  if (!isWeb) {
    try {
      plugins.push('react-native-reanimated/plugin');
    } catch (e) {
      // プラグインが利用できない場合は無視
    }
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins: plugins,
  };
};

