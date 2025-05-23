import {makeAutoObservable} from 'mobx';
import {hydrateStore, makePersistable} from 'mobx-persist-store';
import { UserApi } from '../services/api/user';

type AuthState = 'logged-in' | 'logged-out';
export class AuthStore implements IStore {
  state: AuthState = 'logged-out';
  email = '';
  userId = '';
  firstName = '';
  lastName = '';

  // getters
  get stateStr() {
    return this.state === 'logged-in' ? `Email: ${this.email}\nPress to logout` : 'Press to login';
  }

  // methods
  logout() {
    this.setMany({
      state: 'logged-out',
      email: '',
      userId: '',
      firstName: '',
      lastName: '',
    });
  }

  async login() {
    const {first_name, last_name, email, user_id} = await UserApi.getDetails()

    this.setMany({
      state: 'logged-in',
      email: email,
      userId: user_id,
      firstName: first_name,
      lastName: last_name,
    })
  }

  constructor() {
    makeAutoObservable(this);

    makePersistable(this, {
      name: AuthStore.name,
      properties: [
        'email',
        'state',
        'userId',
        'firstName',
        'lastName',
      ],
    });
  }

  // Unified set methods
  set<T extends StoreKeysOf<AuthStore>>(what: T, value: AuthStore[T]) {
    (this as AuthStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<AuthStore>>(obj: Record<T, AuthStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as AuthStore[T]);
    }
  }

  // Hydration
  hydrate = async (): PVoid => {
    await hydrateStore(this);
  };
}
