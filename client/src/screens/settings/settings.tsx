import React, {useState} from 'react';
import {ScrollView, Modal, TouchableOpacity, StyleSheet} from 'react-native';
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

export const Settings: NavioScreen = observer(() => {
  useAppearance(); 
  const {navio} = useServices();
  const {ui} = useStores();
  const [isModalVisible, setModalVisible] = useState(false);

  // Methods
  const handleEditAccount = () => {
    navio.push('EditAccount');
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
      if (ui.state === 'logged-in') {
        ui.logout();
      } else {
        navio.setRoot('stacks', 'AuthFlow');
      }
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
        <Section title={'My Account'}>
          {accountActions.map(action => (
            <View key={action.title} marginV-s1>
              <Bounceable onPress={action.onPress}>
                <View padding-s3 br30 style={{backgroundColor:Colors.rgba(240, 240, 240, 1),}}>
                  <Row>
                    <Icon name={action.icon as IconName} size={30}/>
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
      </ScrollView>
    </View>
  );
});

Settings.options = props => ({
  title: 'Settings',
});

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
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
});