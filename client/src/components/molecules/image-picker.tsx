import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';
import { View } from 'react-native-ui-lib';
import { ImagePickerAsset } from 'expo-image-picker';
import { Icon } from '../icon';
import { colors } from '../../utils/designSystem';
import { MediaApi } from '../../services/api/media';

type Props = {
  image: ImagePickerAsset | string | null;
  setImage: (image: ImagePickerAsset | string | null) => void;
};

export const ImagePicker: React.FC<Props> = (props) => {
  const {image, setImage} = props;

  const handlePickImage = async () => {
    const result = await MediaApi.pickImage();
    if (result) {
      setImage(result);
    }
  };

  return (
    <View center style={{ padding: 16 }}>
      <View style={styles.imageWrapper}>
        <TouchableOpacity
          onPress={handlePickImage}
          style={styles.imageContainer}
          activeOpacity={0.8}
        >
          {image ? (
            <Image
              source={{ uri: typeof(image) == 'string' ? image : image.uri }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholder}>
              <Icon name="image" size={96} color={colors.primary} />
              <Text style={styles.placeholderText}>Add image</Text>
            </View>
          )}
        </TouchableOpacity>

        {image && (
          <TouchableOpacity
            onPress={() => setImage(null)}
            style={styles.closeButton}
          >
            <Icon name="close" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    width: 300,
    height: 200,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECF2F0',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  placeholderText: {
    color: '#79767D',
    fontSize: 14,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 6,
    borderRadius: 999,
    zIndex: 10,
  },
});
