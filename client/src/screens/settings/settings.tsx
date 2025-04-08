import React, {useState, useEffect} from 'react';
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
import {HeaderButton} from '@app/components/button';
import {appearances, appearancesUI, appearanceUIToInternal} from '@app/utils/types/enums';
import {useAccountActions} from '../../utils/accountActions';

export const Settings: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const {ui} = useStores();
  const [isModalVisible, setModalVisible] = useState(false);

  // State
  const [appearance, setAppearance] = useState(ui.appearance);

  // Computed
  const unsavedChanges = ui.appearance !== appearance;
  const appearanceInitialIndex = appearances.findIndex(it => it === appearance);
  const appearanceSegments = appearancesUI.map(it => ({label: it}));

  // Methods
  const confirmDeleteAccount = () => {
    console.log('Account deleted');
    setModalVisible(false);
  };

  const handleRunTutorials = () => {
    console.log('Run Tutorials Pressed');
  };

  const handleAppearanceIndexChange = (index: number) => {
    setAppearance(appearanceUIToInternal[appearancesUI[index]]);
  };

  const handleSave = () => {
    ui.setMany({
      appearance,
    });
  };

  const accountActions = useAccountActions();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unsavedChanges ? <HeaderButton onPress={handleSave} label="Save" /> : null,
    });
  }, [unsavedChanges, appearance]);

  return (
    <View flex>
      <ScrollView contentInsetAdjustmentBehavior="always">
        <Section title={'My Account'}>
          {accountActions.map(action => (
            <View key={action.title} marginV-s1>
              <Bounceable onPress={() => action.onPress(setModalVisible)}>
                {/*Color might change*/}
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
          <View style={modalStyles.modalContainer}>
            <View style={modalStyles.modalContent}>
              <Text style={modalStyles.modalTitle}>Are you sure?</Text>
              <Text style={modalStyles.modalMessage}>Do you really want to delete your account?</Text>
              <View style={modalStyles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={modalStyles.modalButton}>
                  <Text style={modalStyles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDeleteAccount} style={modalStyles.modalButton}>
                  <Text style={modalStyles.modalButtonText}>Delete</Text>
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

export const modalStyles = StyleSheet.create({
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