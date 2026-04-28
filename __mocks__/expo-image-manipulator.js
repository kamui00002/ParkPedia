// expo-image-manipulator のモック
export const manipulateAsync = jest.fn();
export const SaveFormat = {
  JPEG: 'jpeg',
  PNG: 'png',
};

export default {
  manipulateAsync,
  SaveFormat,
};
