import { _processResponse } from "../utils";

const REACT_APP_MAIN_API_BASE_URL = 'http://192.168.43.73:5000';

const MAIN_API_URL = REACT_APP_MAIN_API_BASE_URL + '/post';


export const getPost = async (accessToken, urlPath) => {
    const response = await fetch(MAIN_API_URL + urlPath, {
      method: 'get',
      headers: new Headers({
        'Authorization': accessToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
    return _processResponse(response);
};

export const insertPost = async (accessToken, formBodyData) => {
    const response = await fetch(MAIN_API_URL, {
      method: 'post',
      headers: new Headers({
        'Authorization': accessToken,
        'Content-Type': 'multipart/form-data'
      }),
      body: formBodyData
    });
    return _processResponse(response);
  };

export const updatePost = async (accessToken, urlPath, formBodyData) => {
  const response = await fetch(MAIN_API_URL + urlPath, {
    method: 'patch',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'multipart/form-data',
    }),
    body: formBodyData
  });
  return _processResponse(response);
};

export const deletePost = async (accessToken, urlPath) => {
  const response = await fetch(MAIN_API_URL + urlPath, {
    method: 'delete',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
  return _processResponse(response);
};

export const insertComment = async (accessToken, urlPath, formBodyData) => {
  const response = await fetch(MAIN_API_URL + urlPath, {
    method: 'post',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'multipart/form-data'
    }),
    body: formBodyData
  });
  return _processResponse(response);
};

export const insertSubComment = async (accessToken, urlPath, formBodyData) => {
  const response = await fetch(MAIN_API_URL + urlPath, {
    method: 'post',
    headers: new Headers({
      'Authorization': accessToken,
      'Content-Type': 'multipart/form-data'
    }),
    body: formBodyData
  });
  return _processResponse(response);
};