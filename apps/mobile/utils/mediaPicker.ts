import * as ImagePicker from 'expo-image-picker';

export async function pickImages(maxCount = 10): Promise<ImagePicker.ImagePickerAsset[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    selectionLimit: maxCount,
    quality: 0.7,
  });
  if (result.canceled) return [];
  return result.assets;
}

export async function pickVideo(): Promise<ImagePicker.ImagePickerAsset | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 0.7,
  });
  if (result.canceled) return null;
  return result.assets[0];
}
