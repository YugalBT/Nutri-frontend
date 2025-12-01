import { Constants } from '../../shared/utils/constants/constants';
import { User } from './auth.models';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  user: JSON.parse(sessionStorage.getItem(Constants.USERDATA) || 'null'),
  token: sessionStorage.getItem(Constants.AUTHTOKEN) || null,
  loading: false,
  error: null
};
