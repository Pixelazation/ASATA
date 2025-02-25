import React, {useEffect, useState} from 'react';
import {ScrollView} from 'react-native';
import {Text, View, SegmentedControl, Colors} from 'react-native-ui-lib';
import {observer} from 'mobx-react';
import {NavioScreen} from 'rn-navio';
import {Section} from '@app/components/section';
import {Row} from '@app/components/row';
import {useServices} from '@app/services';
import {useAppearance} from '@app/utils/hooks';
import {useStores} from '@app/stores';
import {HeaderButton} from '@app/components/button';
import {
  appearances,
  appearancesUI,
  appearanceUIToInternal
} from '@app/utils/types/enums';
import {Bounceable} from 'rn-bounceable';
import {Icon, IconName} from '@app/components/icon';
import { colors } from '@app/utils/designSystem';

export const Settings: NavioScreen = observer(() => {
  useAppearance(); // for Dark Mode
  const {t, navio} = useServices();
  const navigation = navio.useN();
  const {ui} = useStores();

  // State
  const [appearance, setAppearance] = useState(ui.appearance);

  // Computed
  const unsavedChanges = ui.appearance !== appearance;
  const appearanceInitialIndex = appearances.findIndex(it => it === appearance);
  const appearanceSegments = appearancesUI.map(it => ({label: it}));

  // Methods
  const handleEditAccount = () => {
    console.log('Edit Account Pressed');
  };
  const handleDeleteAccount = () => {
    console.log('Delete Account Pressed');
  };
  const handleAppearanceIndexChange = (index: number) =>
    setAppearance(appearanceUIToInternal[appearancesUI[index]]);
  const handleSave = () => {
    ui.setMany({appearance});
  }

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
  ];
  
  // Start
  useEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        unsavedChanges ? <HeaderButton onPress={handleSave} label="Save" /> : null,
    });
  }, [unsavedChanges, appearance]);
  
  // UI Methods

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
        <Section title={'UI'}>
          <View paddingV-s1>
            <Row>
              <View flex>
                <Text textColor text60R>
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
                style={{width: 175, flexShrink: 0, alignSelf: 'flex-end'}}
              />
            </Row>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
});

Settings.options = props => ({
  title: 'Settings',
});
