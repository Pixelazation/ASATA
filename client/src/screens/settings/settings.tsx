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

export const Settings: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {navio} = useServices();
  const {ui} = useStores();
  const [isModalVisible, setModalVisible] = useState(false);

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
    if (ui.state === 'logged-in') {
      ui.logout();
    } else {
      navio.setRoot('stacks', 'AuthFlow');
    }
  };
  const handleRunTutorials = () => {
    console.log('Run Tutorials Pressed');
  };

  const accountActions: {title: string; icon: IconName; onPress: () => void}[] = [
    {
      title: 'Edit Account',
      icon: 'create-outline', // Use a valid icon name
      onPress: handleEditAccount,
    },
    {
      title: 'Delete Account',
      icon: 'trash-outline', // Use a valid icon name
      onPress: handleDeleteAccount,
    },
    {
      title: 'Logout',
      icon: 'log-out-outline', // Use a valid icon name
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
                {/*Color might change*/}
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
              <Text style={styles.modalMessage}>Do you really want to delete your account?</Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDeleteAccount} style={styles.modalButton}>
                  <Text style={styles.modalButtonText}>Delete</Text>
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
