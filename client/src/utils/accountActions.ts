import {useServices} from '@app/services';
import {useStores} from '@app/stores';

export const useAccountActions = () => {
  const {navio} = useServices();
  const {ui} = useStores();

  const handleEditAccount = () => {
    navio.push('EditAccount');
  };

  const handleDeleteAccount = (setModalVisible: (visible: boolean) => void) => {
    setModalVisible(true);
  };

  const handleLogout = async () => {
    if (ui.state === 'logged-in') {
      ui.logout();
    } else {
      navio.setRoot('stacks', 'AuthFlow');
    }
  };

  return [
    {
      title: 'Edit Account',
      icon: 'create-outline',
      onPress: handleEditAccount,
    },
    {
      title: 'Delete Account',
      icon: 'trash-outline',
      onPress: handleDeleteAccount,
    },
    {
      title: 'Logout',
      icon: 'log-out-outline',
      onPress: handleLogout,
    },
  ];
};