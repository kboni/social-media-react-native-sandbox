import { AsyncStorage } from 'react-native';
import base64 from 'react-native-base64';
import { _processResponse, errorLog } from "../utils";

var jwtDecode = require('jwt-decode');

const REACT_APP_AUTH_API_BASE_URL = 'http://192.168.43.73:5001';

const LOGIN_URL = REACT_APP_AUTH_API_BASE_URL + '/login';
const REGISTER_URL = REACT_APP_AUTH_API_BASE_URL + '/register';
const PASSWORD_URL = REACT_APP_AUTH_API_BASE_URL + '/recover_password';
const TOKEN_URL = REACT_APP_AUTH_API_BASE_URL + '/token';

const registrationEmailKey = 'registrationEmail';
const registrationTokenKey = 'registrationToken';
const forgottenPasswordEmailKey = 'forgottenPasswordEmail';
const forgottenPasswordTokenKey = 'forgottenPasswordToken';
const accessTokenKey = 'accessToken';
const refreshTokenKey = 'refreshToken';

export const logIn = async (username, password) => {
  const response = await fetch(LOGIN_URL, {
    method: 'get',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic ' + base64.encode(username + ":" + password).toString("base64")
    }),
  });
  return _processResponse(response);
}

// Registration: First step
export const registerEmail = async (email) => {
  const response = await fetch(REGISTER_URL, {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "email": email
    })
  });
  return _processResponse(response);
}

// Registration: Second step
export const checkRegistrationCode = async (email, registrationCode) => {
  const response = await fetch(REGISTER_URL, {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "email": email,
      "registration_code": registrationCode
    })
  });
  return _processResponse(response);
}

// Registration: Third step
export const registerUsernameAndPassword = async (token, username, password) => {
  const response = await fetch(REGISTER_URL, {
    method: 'post',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "token": token,
      "username": username,
      "password": password
    })
  });
  return _processResponse(response);
}

// Forgotten password: First step
export const confirmEmail = async (email) => {
  const response = await fetch(PASSWORD_URL, {
    method: 'patch',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "email": email
    })
  });
  return _processResponse(response);
}

// Forgotten password: Second step
export const checkConfirmationCode = async (email, registrationCode) => {
  const response = await fetch(PASSWORD_URL, {
    method: 'patch',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "email": email,
      "registration_code": registrationCode
    })
  });
  return _processResponse(response);
}

// Forgotten password: Third step
export const changePassword = async (token, username, password) => {
  const response = await fetch(PASSWORD_URL, {
    method: 'patch',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify({
      "token": token,
      "username": username,
      "password": password
    })
  });
  return _processResponse(response);
}

export const checkAccessToken = (accessToken) => {
  tokenDecoded = jwtDecode(accessToken)
  timestampNowinSeconds = Date.now() / 1000

  // Token not expired
  if(tokenDecoded['exp'] && tokenDecoded['exp'] > timestampNowinSeconds) {
    return accessToken
  }

  // Token expired - refresh it
  return getUserRefreshToken()
  .then((refreshToken) => {
    return refreshAccessToken(refreshToken)
    .then((response) => {
      if((response.statusCode === 200) && response.data['access_token']){
        saveUserAccessToken(response.data['access_token'])
        return response.data['access_token']
      }
      return null
    })
  })
  .catch(errorLog)
}

export const refreshAccessToken = async (refreshToken) => {
  const response = await fetch(TOKEN_URL, {
    method: 'get',
    headers: new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': refreshToken
    })
  });
  return _processResponse(response);
}

export const saveUserRegistrationEmail = (email) => _storeData(registrationEmailKey, email);
    
export const getUserRegistrationEmail = () => _retrieveData(registrationEmailKey);

export const removeUserRegistrationEmail = () => _removeData(registrationEmailKey);

export const saveUserRegistrationToken = (token) => _storeData(registrationTokenKey, token);
    
export const getUserRegistrationToken = () => _retrieveData(registrationTokenKey);

export const removeUserRegistrationToken = () => _removeData(registrationTokenKey);

export const saveUserForgottenPasswordEmail = (email) => _storeData(forgottenPasswordEmailKey, email);
    
export const getUserForgottenPasswordEmail = () => _retrieveData(forgottenPasswordEmailKey);

export const removeUserForgottenPasswordEmail = () => _removeData(forgottenPasswordEmailKey);

export const saveUserForgottenPasswordToken = (token) => _storeData(forgottenPasswordTokenKey, token);
    
export const getUserForgottenPasswordToken = () => _retrieveData(forgottenPasswordTokenKey);

export const removeUserForgottenPasswordToken = () => _removeData(forgottenPasswordTokenKey);

export const saveUserAccessToken = (token) => _storeData(accessTokenKey, token);
    
export const getUserAccessToken = () => _retrieveData(accessTokenKey);

export const removeUserAccessToken = () => _removeData(accessTokenKey);

export const saveUserRefreshToken = (token) => _storeData(refreshTokenKey, token);
    
export const getUserRefreshToken = () => _retrieveData(refreshTokenKey);

export const removeUserRefreshToken = () => _removeData(refreshTokenKey);

_storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log(error);
  }
};

_retrieveData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
  } catch (error) {
    console.log(error);
  }
};

_removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log(error);
  }
};