import { decode } from "base64-arraybuffer";
import * as ImagePicker from 'expo-image-picker';
import { supabase } from "../../lib/supabase";

export class MediaApi {
  static async pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      base64: true,
    });

    if (!result.canceled) {
      return result.assets[0];
    }

    return null;
  }

  static async uploadImage(imageData: ImagePicker.ImagePickerAsset) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("User not authenticated");

    const { base64, mimeType } = imageData;

    const fullPath = `${user.id}/${Date.now()}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(fullPath, decode(base64!), {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Upload error:', error);
      throw error;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from('images')
      .getPublicUrl(fullPath);

    return publicUrlData.publicUrl;
  }

}