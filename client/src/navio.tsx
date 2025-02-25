import {Navio} from 'rn-navio';
import {Ionicons} from '@expo/vector-icons'; 

import {Main as Home} from '@app/screens/main'; // Rename Main to Home
import {Playground as Itinerary} from '@app/screens/playground'; // Rename Playground to Itinerary
import {PlaygroundFlashList} from '@app/screens/playground/flash-list';
import {PlaygroundExpoImage} from '@app/screens/playground/expo-image';
import {Settings as Account} from '@app/screens/settings'; // Rename Settings to Account
import {Example} from '@app/screens/_screen-sample';

import {useAppearance} from '@app/utils/hooks';
import {
  screenDefaultOptions,
  tabScreenDefaultOptions,
  drawerScreenDefaultOptions,
} from '@app/utils/designSystem';
import {services} from '@app/services';
import {AuthLogin} from './screens/auth/login';
import {AuthSignup} from './screens/auth/signup';

// Function to get tab bar icons
const getTabBarIcon = (iconName: 'home-outline' | 'clipboard-outline' | 'person-outline') => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={iconName} color={color} size={size} />
);

// NAVIO
export const navio = Navio.build({
  screens: {
    Home, 
    Account, 
    Example,

    Itinerary, 
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
      screens: ['Itinerary', 'PlaygroundFlashList', 'PlaygroundExpoImage'],
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
            title: 'Home', // new name for main tab
            tabBarIcon: getTabBarIcon('home-outline'), 
          }),
        },
        ItineraryTab: { 
          drawer: 'DrawerForTabs',
          options: () => ({
            title: 'Itinerary', // new name for playground tab
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
