import {Navio} from 'rn-navio';

import {Home} from '@app/screens/home'; 
import {Itinerary} from '@app/screens/itinerary'; 
import {ItineraryFlashList} from '@app/screens/itinerary/flash-list';
import {ItineraryExpoImage} from '@app/screens/itinerary/expo-image';
import {Account} from '@app/screens/account'; 
import {Example} from '@app/screens/_screen-sample';

import {useAppearance} from '@app/utils/hooks';
import {
  screenDefaultOptions,
  tabScreenDefaultOptions,
  drawerScreenDefaultOptions,
  getTabBarIcon, 
} from '@app/utils/designSystem';
import {services} from '@app/services';
import {AuthLogin} from './screens/auth/login';
import {AuthSignup} from './screens/auth/signup';

// NAVIO
export const navio = Navio.build({
  screens: {
    Home, 
    Account, 
    Example,

    Itinerary, 
    ItineraryFlashList,
    ItineraryExpoImage,

    // for .pushStack example
    ProductPage: {
      component: Example,
      options: {
        headerShown: false,
      },
    },

    // for auth flow
    AuthLogin,
    AuthSignup,
  },
  stacks: {
    HomeStack: ['Home', 'Example'],
    ExampleStack: {
      screens: ['Example'],
      navigatorProps: {
        screenListeners: {
          focus: () => {},
        },
      },
    },
    ItineraryStack: { 
      screens: ['Itinerary', 'ItineraryFlashList', 'ItineraryExpoImage'],
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
        HomeTab: { 
          stack: 'HomeStack', 
          options: () => ({
            title: 'Home',
            tabBarIcon: getTabBarIcon('home-outline'), 
          }),
        },
        ItineraryTab: { 
          stack: 'ItineraryStack', 
          options: () => ({
            title: 'Itinerary',
            tabBarIcon: getTabBarIcon('clipboard-outline'), 
          }),
        },
        AccountTab: { 
          stack: ['Account'], 
          options: () => ({
            title: 'Account',
            tabBarIcon: getTabBarIcon('person-outline'), 
            tabBarBadge: 23,
          }),
        },
      },
    },

    // tabs with drawer
    TabsWithDrawer: {
      layout: {
        HomeTab: { 
          stack: 'HomeStack', 
          options: () => ({
            title: 'Home',
            tabBarIcon: getTabBarIcon('home-outline'),
          }),
        },
        ItineraryTab: { 
          drawer: 'DrawerForTabs',
          options: () => ({
            title: 'Itinerary', 
            tabBarIcon: getTabBarIcon('clipboard-outline'), 
          }),
        },
      },
    },
  },
  drawers: {
    // main drawer
    AppDrawer: {
      layout: {
        Home: { 
          stack: 'HomeStack',
          options: {
            drawerType: 'front',
          },
        },
        Example: {
          stack: ['Example'],
        },
        Itinerary: {
          stack: 'ItineraryStack', 
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
          stack: ['ItineraryFlashList'],
          options: {
            title: 'Flash List',
            drawerPosition: 'right',
          },
        },
        ExpoImage: {
          stack: ['ItineraryExpoImage'],
          options: {
            title: 'Expo Image',
            drawerPosition: 'right',
          },
        },
      },
    },
  },
  modals: {
    ExampleModal: { stack: 'ExampleStack' },
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