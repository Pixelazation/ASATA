import {makeAutoObservable} from 'mobx';
import {hydrateStore, makePersistable} from 'mobx-persist-store';
import {Appearance, appearanceToUI, Language, languageToUI} from '@app/utils/types/enums';

export class UIStore implements IStore {
  logout() {
    throw new Error('Method not implemented.');
  }
  appLaunches = 0;

  // Appearance
  appearance: Appearance = 'light';
  state: string | undefined;
  get appearanceStr() {
    return appearanceToUI[this.appearance];
  }
  // get isAppearanceSystem() {
  //   return this.appearance === 'light';
  // }

  // Language
  language: Language = 'en';
  get languageStr() {
    return languageToUI[this.language];
  }
  // get isLanguageSystem() {
  //   return this.language === 'EN';
  // }

  constructor() {
    makeAutoObservable(this);

    makePersistable(this, {
      name: UIStore.name,
      properties: ['appLaunches', 'appearance', 'language'],
    });
  }

  // Unified set methods
  set<T extends StoreKeysOf<UIStore>>(what: T, value: UIStore[T]) {
    (this as UIStore)[what] = value;
  }
  setMany<T extends StoreKeysOf<UIStore>>(obj: Record<T, UIStore[T]>) {
    for (const [k, v] of Object.entries(obj)) {
      this.set(k as T, v as UIStore[T]);
    }
  }

  // Hydration
  hydrate = async (): PVoid => {
    await hydrateStore(this);
  };
}
