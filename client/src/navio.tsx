import {Navio} from 'rn-navio';
import {Main} from '@app/screens/main';
import {Playground} from '@app/screens/playground';
import {PlaygroundFlashList} from '@app/screens/playground/flash-list';
import {PlaygroundExpoImage} from '@app/screens/playground/expo-image';
import {Settings} from '@app/screens/settings/settings';
import {EditAccount} from '@app/screens/settings/editaccount';
import {Example} from '@app/screens/_screen-sample';
import {MyItineraries} from './screens/myitineraries';
import {Itinerary} from './screens/itinerary';
import { GetSuggestions } from './screens/getsuggestions';
import { ActivityForm } from './screens/itinerary/activity/activity-form';
import { ItineraryForm } from './screens/itinerary/add';

import {useAppearance} from '@app/utils/hooks';
import {
  screenDefaultOptions,
  tabScreenDefaultOptions,
  getTabBarIcon,
  drawerScreenDefaultOptions,
} from '@app/utils/designSystem';
import {AuthLogin} from './screens/auth/login';
import { AuthSignup } from './screens/auth/signup';

// NAVIO
export const navio = Navio.build({
  screens: {
    Main,

    Settings,
    EditAccount,

    Example,

    MyItineraries,
    Itinerary,
    ItineraryForm,
    GetSuggestions,
    ActivityForm,

    Playground,
    PlaygroundFlashList,
    PlaygroundExpoImage,

    // for .pushStack example
    ProductPage: {
      component: Example,
      options: {
        headerShown: false,
      },
    },

    // for auth flow
    AuthLogin,
    AuthSignup
  },
  stacks: {
    MainStack: ['Main', 'Example', 'GetSuggestions' , 'MyItineraries', 'Itinerary', 'ItineraryForm', 'ActivityForm'],
    MyItinerariesStack:['MyItineraries', 'Itinerary', 'ItineraryForm', 'ActivityForm'],
    SettingsStack:['Settings', 'EditAccount'],
    ExampleStack: {
      screens: ['Example'],
      navigatorProps: {
        screenListeners: {
          focus: () => {},
        },
      },
    },
    PlaygroundStack: {
      screens: ['Playground', 'PlaygroundFlashList', 'PlaygroundExpoImage'],
    },

    // for .pushStack example
    ProductPageStack: {
      screens: ['ProductPage'],
      containerOptions: {
        headerShown: true,
        title: 'Product page',
      },
    },

    // for auth flow
    AuthFlow: ['AuthLogin', 'AuthSignup'],
  },
  tabs: {
    // main 3 tabs
    AppTabs: {
      layout: {
        MainTab: {
          stack: 'MainStack',
          options: () => ({
            title: 'Home',
            tabBarIcon: getTabBarIcon('MainTab'),
          }),
        },
        MyItinerariesTab: {
          stack: 'MyItinerariesStack',
          options: () => ({
            title: 'My Itineraries',
            tabBarIcon: getTabBarIcon('PlaygroundTab'),
          }),
        },
        SettingsTab: {
          stack: 'SettingsStack',
          options: () => ({
            title: 'Account',
            tabBarIcon: getTabBarIcon('SettingsTab'),
            tabBarBadge: 23,
          }),
        },
      },
    },

    // tabs with drawer
    TabsWithDrawer: {
      layout: {
        MainTab: {
          stack: 'MainStack',
          options: () => ({
            title: 'Main',
            tabBarIcon: getTabBarIcon('MainTab'),
          }),
        },
        PlaygroundTab: {
          drawer: 'DrawerForTabs',
          options: () => ({
            title: 'Playground',
            tabBarIcon: getTabBarIcon('PlaygroundTab'),
          }),
        },
      },
    },
  },
  drawers: {
    // main drawer
    AppDrawer: {
      layout: {
        Main: {
          stack: 'MainStack',
          options: {
            drawerType: 'front',
          },
        },
        Example: {
          stack: ['Example'],
        },
        Playground: {
          stack: 'PlaygroundStack',
        },
        Tabs: {
          tabs: 'TabsWithDrawer',
        },
      },
    },

    // drawer inside tabs
    DrawerForTabs: {
      layout: {
        FlashList: {
          stack: ['PlaygroundFlashList'],
          options: {
            title: 'Flash List',
            drawerPosition: 'right',
          },
        },
        ExpoImage: {
          stack: ['PlaygroundExpoImage'],
          options: {
            title: 'Expo Image',
            drawerPosition: 'right',
          },
        },
      },
    },
  },
  modals: {
    ExampleModal: {stack: 'ExampleStack'},
  },
  root: 'stacks.AuthFlow',
  hooks: [useAppearance],
  defaultOptions: {
    stacks: {
      screen: screenDefaultOptions,
    },
    tabs: {
      screen: tabScreenDefaultOptions,
    },
    drawers: {
      screen: drawerScreenDefaultOptions,
    },
  },
});

export const getNavio = () => navio;
export const NavioApp = navio.App;