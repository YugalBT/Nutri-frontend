import { Constants } from '../../shared/utils/constants/constants';
import { User } from './auth.models';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  supplier?: any;
}

export const initialAuthState: AuthState = {
  user: JSON.parse(localStorage.getItem(Constants.USERDATA) || 'null'),
  token: localStorage.getItem(Constants.AUTHTOKEN) || null,
  loading: false,
  error: null
};
