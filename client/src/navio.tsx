// import { Navio } from 'rn-navio';
// import { Ionicons } from '@expo/vector-icons'; // Import Ionicons from @expo/vector-icons

// import { Main } from '@app/screens/main';
// import { Playground } from '@app/screens/playground';
// import { PlaygroundFlashList } from '@app/screens/playground/flash-list';
// import { PlaygroundExpoImage } from '@app/screens/playground/expo-image';
// import { Settings } from '@app/screens/settings';
// import { Example } from '@app/screens/_screen-sample';

// import { useAppearance } from '@app/utils/hooks';
// import {
//   screenDefaultOptions,
//   tabScreenDefaultOptions,
//   drawerScreenDefaultOptions,
// } from '@app/utils/designSystem';
// import { services } from '@app/services';
// import { AuthLogin } from './screens/auth/login';
// import { AuthSignup } from './screens/auth/signup';

// // Function to get tab bar icons
// const getTabBarIcon = (iconName: 'home-outline' | 'map-outline' | 'person-outline') => ({ color, size }: { color: string; size: number }) => (
//   <Ionicons name={iconName} color={color} size={size} />
// );

// // NAVIO
// export const navio = Navio.build({
//   screens: {
//     Main,
//     Settings,
//     Example,

//     Playground,
//     PlaygroundFlashList,
//     PlaygroundExpoImage,

//     // for .pushStack example
//     ProductPage: {
//       component: Example,
//       options: {
//         headerShown: false,
//       },
//     },

//     // for auth flow
//     AuthLogin,
//     AuthSignup,
//   },
//   stacks: {
//     MainStack: ['Main', 'Example'],
//     ExampleStack: {
//       screens: ['Example'],
//       navigatorProps: {
//         screenListeners: {
//           focus: () => {},
//         },
//       },
//     },
//     PlaygroundStack: {
//       screens: ['Playground', 'PlaygroundFlashList', 'PlaygroundExpoImage'],
//     },

//     // for .pushStack example
//     ProductPageStack: {
//       screens: ['ProductPage'],
//       containerOptions: {
//         headerShown: true,
//         title: 'Product page',
//       },
//     },

//     // for auth flow
//     AuthFlow: ['AuthLogin', 'AuthSignup'],
//   },
//   tabs: {
//     // main 3 tabs
//     AppTabs: {
//       layout: {
//         MainTab: {
//           stack: 'MainStack',
//           options: () => ({
//             title: 'Home',
//             tabBarIcon: getTabBarIcon('home-outline'), // Use Ionicons icon name
//           }),
//         },
//         PlaygroundTab: {
//           stack: 'PlaygroundStack',
//           options: () => ({
//             title: 'Itinerary',
//             tabBarIcon: getTabBarIcon('map-outline'), // Use Ionicons icon name
//           }),
//         },
//         SettingsTab: {
//           stack: ['Settings'],
//           options: () => ({
//             title: 'Account',
//             tabBarIcon: getTabBarIcon('person-outline'), // Use Ionicons icon name
//             tabBarBadge: 23,
//           }),
//         },
//       },
//     },

//     // tabs with drawer
//     TabsWithDrawer: {
//       layout: {
//         MainTab: {
//           stack: 'MainStack',
//           options: () => ({
//             title: 'Home', // new name for main tab
//             tabBarIcon: getTabBarIcon('home-outline'), // Use Ionicons icon name
//           }),
//         },
//         PlaygroundTab: {
//           drawer: 'DrawerForTabs',
//           options: () => ({
//             title: 'Itinerary', // new name for playground tab
//             tabBarIcon: getTabBarIcon('map-outline'), // Use Ionicons icon name
//           }),
//         },
//       },
//     },
//   },
//   drawers: {
//     // main drawer
//     AppDrawer: {
//       layout: {
//         Main: {
//           stack: 'MainStack',
//           options: {
//             drawerType: 'front',
//           },
//         },
//         Example: {
//           stack: ['Example'],
//         },
//         Playground: {
//           stack: 'PlaygroundStack',
//         },
//         Tabs: {
//           tabs: 'TabsWithDrawer',
//         },
//       },
//     },

//     // drawer inside tabs
//     DrawerForTabs: {
//       layout: {
//         FlashList: {
//           stack: ['PlaygroundFlashList'],
//           options: {
//             title: 'Flash List',
//             drawerPosition: 'right',
//           },
//         },
//         ExpoImage: {
//           stack: ['PlaygroundExpoImage'],
//           options: {
//             title: 'Expo Image',
//             drawerPosition: 'right',
//           },
//         },
//       },
//     },
//   },
//   modals: {
//     ExampleModal: { stack: 'ExampleStack' },
//   },
//   root: 'stacks.AuthFlow',
//   hooks: [useAppearance],
//   defaultOptions: {
//     stacks: {
//       screen: screenDefaultOptions,
//     },
//     tabs: {
//       screen: tabScreenDefaultOptions,
//     },
//     drawers: {
//       screen: drawerScreenDefaultOptions,
//     },
//   },
// });

// export const getNavio = () => navio;
// export const NavioApp = navio.App;


import { Navio } from 'rn-navio';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons 

import { Main as Home } from '@app/screens/main'; // Rename Main to Home
import { Playground as Itinerary } from '@app/screens/playground'; // Rename Playground to Itinerary
import { PlaygroundFlashList } from '@app/screens/playground/flash-list';
import { PlaygroundExpoImage } from '@app/screens/playground/expo-image';
import { Settings as Account } from '@app/screens/settings'; // Rename Settings to Account
import { Example } from '@app/screens/_screen-sample';

import { useAppearance } from '@app/utils/hooks';
import {
  screenDefaultOptions,
  tabScreenDefaultOptions,
  drawerScreenDefaultOptions,
} from '@app/utils/designSystem';
import { services } from '@app/services';
import { AuthLogin } from './screens/auth/login';
import { AuthSignup } from './screens/auth/signup';

// Function to get tab bar icons
const getTabBarIcon = (iconName: 'home-outline' | 'clipboard-outline' | 'person-outline') => ({ color, size }: { color: string; size: number }) => (
  <Ionicons name={iconName} color={color} size={size} />
);

// NAVIO
export const navio = Navio.build({
  screens: {
    Home, // Updated reference
    Account, // Updated reference
    Example,

    Itinerary, // Updated reference
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
    HomeStack: ['Home', 'Example'], // Updated reference
    ExampleStack: {
      screens: ['Example'],
      navigatorProps: {
        screenListeners: {
          focus: () => {},
        },
      },
    },
    ItineraryStack: { // Updated reference
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
        HomeTab: { // Updated reference
          stack: 'HomeStack', // Updated reference
          options: () => ({
            title: 'Home',
            tabBarIcon: getTabBarIcon('home-outline'), // Use Ionicons icon name
          }),
        },
        ItineraryTab: { // Updated reference
          stack: 'ItineraryStack', // Updated reference
          options: () => ({
            title: 'Itinerary',
            tabBarIcon: getTabBarIcon('clipboard-outline'), // Use Ionicons icon name
          }),
        },
        AccountTab: { // Updated reference
          stack: ['Account'], // Updated reference
          options: () => ({
            title: 'Account',
            tabBarIcon: getTabBarIcon('person-outline'), // Use Ionicons icon name
            tabBarBadge: 23,
          }),
        },
      },
    },

    // tabs with drawer
    TabsWithDrawer: {
      layout: {
        HomeTab: { // Updated reference
          stack: 'HomeStack', // Updated reference
          options: () => ({
            title: 'Home', // new name for main tab
            tabBarIcon: getTabBarIcon('home-outline'), // Use Ionicons icon name
          }),
        },
        ItineraryTab: { // Updated reference
          drawer: 'DrawerForTabs',
          options: () => ({
            title: 'Itinerary', // new name for playground tab
            tabBarIcon: getTabBarIcon('clipboard-outline'), // Use Ionicons icon name
          }),
        },
      },
    },
  },
  drawers: {
    // main drawer
    AppDrawer: {
      layout: {
        Home: { // Updated reference
          stack: 'HomeStack', // Updated reference
          options: {
            drawerType: 'front',
          },
        },
        Example: {
          stack: ['Example'],
        },
        Itinerary: { // Updated reference
          stack: 'ItineraryStack', // Updated reference
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