import React, {useState, useEffect} from 'react';
import {ScrollView, Modal, TouchableOpacity, StyleSheet, Image, View as RNView} from 'react-native';
import {Text, View, Colors} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';
import {Section} from '@app/components/section';
import {Row} from '@app/components/row';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {Bounceable} from 'rn-bounceable';
import {Icon, IconName} from '@app/components/icon';
import {useStores} from '@app/stores';
import { supabase } from '@app/lib/supabase';
import { ApiService } from '../../services/api';
import { ImagePicker } from '../../components/molecules/image-picker';
import { MediaApi } from '../../services/api/media';
import { BG_IMAGE_2 } from '../../assets';

export const Settings: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {navio, api} = useServices();
  const {ui} = useStores();
  const [isModalVisible, setModalVisible] = useState(false);

  // Profile image and user name state
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePickerVisible, setImagePickerVisible] = useState(false);
  const [userName, setUserName] = useState<string>('User');

  // Fetch user info on mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('UserDetails')
          .select('first_name, last_name, profile_pic_url')
          .eq('user_id', user.id)
          .single();
        if (data) {
          setUserName(`${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'User');
          setProfileImage(data.profile_pic_url ?? null);
        }
      }
    };
    fetchUserInfo();
  }, []);

  // Handle image pick and upload
  const handleProfileImageChange = async (img: any) => {
    // If img is null or empty, treat as remove
    if (!img) {
      setProfileImage(null);

      // Save the default image (BG_IMAGE_2) to Supabase
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!authError && user) {
        await supabase
          .from('UserDetails')
          .update({ profile_pic_url: null }) // Remove the URL from DB
          .eq('user_id', user.id);
      }
      setImagePickerVisible(false);
      return;
    }

    let imageUrl = typeof img === 'string' ? img : img.uri;
    // If the image is a new ImagePickerAsset, upload it
    if (img && img.base64) {
      try {
        imageUrl = await MediaApi.uploadImage(img);
        setProfileImage(imageUrl);

        // Save the image URL to Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("User not authenticated");

        const { error } = await supabase
          .from('UserDetails')
          .update({ profile_pic_url: imageUrl })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error saving profile image URL:', error);
        }
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    } else {
      setProfileImage(imageUrl);
    }
    setImagePickerVisible(false);
  };

  // State
  const [appearance] = useState(ui.appearance);

  // Computed
  const unsavedChanges = ui.appearance !== appearance;

  // Methods
  const handleEditAccount = () => {
    navio.push('EditAccount');
  };
  const handleDeleteAccount = () => {
    setModalVisible(true);
  };
  const confirmDeleteAccount = () => {
    console.log('Account deleted');
    setModalVisible(false);
  };
  const handleLogout = async () => {
    if (await api.auth.signout()) navio.setRoot('stacks', 'AuthFlow');
  };
  const handleRunTutorials = () => {
    console.log('Run Tutorials Pressed');
  };
  const handleDeactivateAccount = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Error fetching user:', authError);
      return;
    }

    try {
      const { error } = await supabase
        .from('UserDetails')
        .update({ activity_status: false })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deactivating account:', error);
        return;
      }

      console.log('Account deactivated successfully');
      setModalVisible(false);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  const accountActions: { title: string; icon: IconName; onPress: () => void }[] = [
    {
      title: 'Edit Account',
      icon: 'create-outline',
      onPress: handleEditAccount,
    },
    {
      title: 'Deactivate Account',
      icon: 'power-outline', // Updated icon
      onPress: () => setModalVisible(true), // Show confirmation modal
    },
    {
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: handleLogout,
    },
  ];

  return (
    <View flex>
      <ScrollView contentInsetAdjustmentBehavior="always">
        {/* Profile Picture Section */}
        <View style={{alignItems: 'center', marginTop: 32, marginBottom: 8}}>
          <TouchableOpacity onPress={() => setImagePickerVisible(true)} activeOpacity={0.7}>
            <RNView style={styles.profilePicWrapper}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage }
                    : BG_IMAGE_2 // fallback image
                }
                style={styles.profilePic}
                resizeMode="cover"
              />
              <View style={styles.editIconCircle}>
                <Icon name="camera-outline" color={Colors.primary} size={22} />
              </View>
            </RNView>
          </TouchableOpacity>
          <Text style={{marginTop: 8, fontWeight: 'bold', fontSize: 16}}>{userName}</Text>
        </View>

        {/* Image Picker Modal */}
        <Modal
          visible={imagePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImagePickerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { padding: 32 }]}>
              <Text style={{ color: Colors.primary, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
                Update Profile Picture
              </Text>
              <ImagePicker image={profileImage} setImage={handleProfileImageChange} />
              <TouchableOpacity
                onPress={() => setImagePickerVisible(false)}
                style={{
                  marginTop: 16,
                  backgroundColor: Colors.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 32,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* My Account Section */}
        <Section title={'My Account'}>
          {accountActions.map(action => (
            <View key={action.title} marginV-s1>
              <Bounceable onPress={action.onPress}>
                <View padding-s3 br30 style={{backgroundColor:Colors.rgba(240, 240, 240, 1),}}>
                  <Row>
                    <Icon name={action.icon} size={30}/>
                    <View flex marginH-s3>
                      <Text text60R textColor>
                         {action.title}
                      </Text>
                    </View>
                    <Icon name="chevron-forward" />
                  </Row>
                </View>
              </Bounceable>
            </View>            
          ))}
        </Section>
        <Section title={'Help'}>
          <View marginV-s1>
            <Bounceable onPress={handleRunTutorials}>
              <View padding-s3 br30 style={{backgroundColor:Colors.rgba(240, 240, 240, 1),}}>
                <Row>
                  <Icon name="play-circle-outline" size={30}/>
                  <View flex marginH-s3>
                    <Text text60R textColor>
                      Run Tutorials
                    </Text>
                  </View>
                  <Icon name="chevron-forward" />
                </Row>
              </View>
            </Bounceable>
          </View>
        </Section>
        <Modal
          transparent={true}
          visible={isModalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Are you sure?</Text>
              <Text style={styles.modalMessage}>Do you really want to deactivate your account?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDeactivateAccount} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Deactivate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* <Section title={'UI'}>
          <View paddingV-s1>
            <Row>
              <View flex>
                <Text textColor>
                  Appearance
                </Text>
              </View>
              <SegmentedControl
                initialIndex={appearanceInitialIndex}
                segments={appearanceSegments}
                backgroundColor={Colors.bgColor}
                activeColor={Colors.primary}
                inactiveColor={Colors.textColor}
                onChangeIndex={handleAppearanceIndexChange}
              />
            </Row>
          </View>
        </Section> */}
      </ScrollView>
    </View>
  );
});

Settings.options = props => ({
  title: 'Settings',
});

//Modal style... might be moved for modularization
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 400,
    padding: 20, // Increased padding for more space
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: Colors.primary,
  },
  profilePicWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'visible', // <-- allow icon to overflow
    borderWidth: 3,
    borderColor: Colors.primary, // <-- use your theme color
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconCircle: {
    position: 'absolute',
    bottom: -8, // <-- move icon further out
    right: -8,  // <-- move icon further out
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4, // for shadow on Android
    shadowColor: '#000', // for shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
