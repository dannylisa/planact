import {
  LoginProps,
  logout_api,
  login_api,
  signup_api,
  SignUpProps,
  validate_api,
  SetProfileProps,
  profile_api,
} from '@/api/auth';
import { AxiosError, AxiosResponse } from 'axios';
import { Dispatch } from 'react';
import { Alert } from 'react-native';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
  AuthActionProps,
  LOGIN,
  LOGOUT,
  SET_PROFILE,
  UserProfile,
  UserProps,
} from './reducer';
import { GlobalState } from '..';
import useTheme from '../theme/hooks';

export interface ITokenHeader {
  Authorization: string;
}

export const useUserState = () => {
  const user: UserProps | null = useSelector(
    (store: GlobalState) => store.authState
  );
  const dispatch: Dispatch<AuthActionProps> = useDispatch();

  const getToken = async () => {
    if (!user) return null;
    const token = {
      Authorization: `Token ${user.token}`,
    };
    return await validate_api(token)
      .then((res) => {
        if(res === 200)
          return token
        else if (res === 401)
          forceLogOut()
        else {
          Alert.alert('네트워크 오류입니다.')
          return null;
        }
      })
  };

  const forceLogOut = () => {
    dispatch({ type: LOGOUT });
    return null;
  };

  return { 
      username: user?.username, 
      profile: user?.profile || null, 
      getToken, 
      forceLogOut 
    };
};

export const useAuthorization = () => {
  const { getToken } = useUserState();
  const dispatch: Dispatch<AuthActionProps> = useDispatch();
  const logIn = async (props: LoginProps) => {
    if (!props.username) {
      Alert.alert('아이디를 입력해주세요.');
      return false;
    }
    if (!props.password) {
      Alert.alert('비밀번호를 입력해주세요.');
      return false;
    }

    let message: string = '';
    await login_api(props)
      .then((res: AxiosResponse<UserProps>) => {
        dispatch({
          type: LOGIN,
          userData: res.data,
        });
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        message = err.response
          ? '아이디 / 비밀번호가 잘못되었습니다.'
          : '네트워크 오류입니다.';
        return;
      });
    if (message) {
      Alert.alert(message);
      return false;
    }
  };

  const signUp = async (props: SignUpProps) => {
    if (!props.username) {
      Alert.alert('아이디를 입력해주세요.');
      return false;
    }
    if (!props.password) {
      Alert.alert('비밀번호를 입력해주세요.');
      return false;
    }

    let message: string = '';
    if (props.password !== props.password2) {
      Alert.alert('비밀번호를 확인해주세요.');
      return;
    }

    await signup_api(props)
      .then((res: AxiosResponse<UserProps>) => {
        dispatch({
          type: LOGIN,
          userData: res.data,
        });
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        message =
          err.response?.status === 409
            ? '중복된 아이디입니다.'
            : '네트워크 오류입니다.';
        return;
      });
    if (message) {
      Alert.alert(message);
      return false;
    }
    Alert.alert('회원가입이 완료되었습니다. 회원 정보를 입력해주세요.');
    return true;
  };

  const logOut = async () => {
    let message: string = '';
    const token = await getToken();
    if (!token) return;

    await logout_api(token)
      .then((res: AxiosResponse) => {
          dispatch({ type: LOGOUT });
        return true;
      })
      .catch((err) => {
        console.log(err.response);
        message = err.response;
        return;
      });
    if (message) {
      Alert.alert(message);
      return false;
    }
    return true;
  };

  return { logIn, signUp, logOut };
};

//0711 작업물
export const useProfile = () => {
  const user: UserProps | null = useSelector(
    (store: GlobalState) => store.authState
  );
  const { getToken } = useUserState();
  const dispatch: Dispatch<AuthActionProps> = useDispatch();

  const setProfile = async (profile: UserProfile) => {
    const token = await getToken();
    if (!user) return;
    if (!token) return;
    if (user.profile === profile) {
      Alert.alert('변경사항이 없습니다.');
      return false;
    }
    let message: string = '';
    await profile_api({ profile, tokenHeader: token })
      .then((res: AxiosResponse) => {
        dispatch({
          type: SET_PROFILE,
          profile: res.data,
        });
      })
      .catch((err: AxiosError) => {
        console.log(err.response);
        message = err.response
          ? '중복된 닉네임입니다.'
          : '네트워크 오류입니다.';
        return;
      });
  };
  return { setProfile };
};
