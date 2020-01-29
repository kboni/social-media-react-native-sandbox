import { _processResponse } from "../utils";

const REACT_APP_MAIN_API_BASE_URL = 'http://192.168.43.73:5000';

const MAIN_API_URL = REACT_APP_MAIN_API_BASE_URL + '/user';


export const getUsersData = async (accessToken) => {
    const response = await fetch(MAIN_API_URL, {
      method: 'get',
      headers: new Headers({
        'Authorization': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
    return _processResponse(response);
};

export const setUsersData = async (accessToken, bodyData) => {
  const response = await fetch(MAIN_API_URL, {
    method: 'patch',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }),
    body: JSON.stringify(bodyData)
  });
  return _processResponse(response);
};

export const updateUsersData = async (accessToken, bodyFormData) => {
  const response = await fetch(MAIN_API_URL, {
    method: 'patch',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'multipart/form-data',
    }),
    body: bodyFormData
  });
  return _processResponse(response);
};

export const deleteUsersData = async (accessToken) => {
  const response = await fetch(MAIN_API_URL, {
    method: 'delete',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  return _processResponse(response);
};