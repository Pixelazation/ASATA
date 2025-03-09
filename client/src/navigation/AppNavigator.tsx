import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {Settings} from '../screens/settings/settings';
import {EditAccount} from '../screens/EditAccount';

const Stack = createStackNavigator();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Settings">
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="EditAccount" component={EditAccount} />
    </Stack.Navigator>
  </NavigationContainer>
);