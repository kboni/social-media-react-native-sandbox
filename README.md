# React-Native Expo app

## Description
React Native Expo mobile app for managing user's posts, comments and subcomments.  
The user must be registered and logged in to see the posts.  


## Screens
### RegisterEmailScreen
First step of the registration process.
The user enters his/her e-mail address.

### RegistrationCodeScreen
Second step of the registration process.
The user enters the registration code received by e-mail.

### RegisterUsernameAndPasswordScreen
Third step of the registration process.
The user enters his/her new username and password.

### LoginScreen
Basic login form.
The user enters his/her username and password.

### PostListScreen
Main screen for showing users' posts in the form of scrollable list.
Users can choose to list all posts or only of a specific user.
Users can also add and delete comments and subcomments on posts.  
**Note:** Pagination is not implemented - all posts are loaded at the beggining

### PostDetailsScreen
Inserting or editing post details/information.

### EditProfileScreen
Editing and deleting user's profile information.

### ChangePasswordScreen
Regular password-change screen using old password.

## Services
### AuthService
Handling communication with the auth_api API service
regarding registration, login, token and password change.

### UserService
Handling communication with the web_api API service
regarding getting and setting user's profile data.

### PostService
Handling communication with the web_api API service
regarding post, comments and subcomments related actions.

## Registration process
1. Entering e-mail
2. Entering registration code received by e-mail
3. Create new username and password

## Login
Basic login with username and password,
after which the receuved Access and Refresh tokens 
are stored in AsyncStorage.

## Forgotten password recovery process
1. Entering e-mail
2. Entering confirmation code received by e-mail
3. Entering old username and new password

## Tokens
Access token is sent in the 'Authorization' header with every request to access a resource.  
If the Access token expires the Refresh token is going to be sent to the authorization server
to generate a new Access token.  
In order to save some network traffic and time the Access token expiration is (also) checked
in the app, by decoding the JWS token, andrefreshing it before trying to reach the main API.  
If the Refresh token expires the user will be logged out automatically.

## Features and restrictions
- Users can edit/delete only their own profile and password
- Users can list all posts, by touching on 'Show all posts'
- Users can list their own posts, by touching on their username at the top or in the post-list
- Users can list other's posts, by touching on a username in the post-list
- Users can edit/delete only their own posts
- When a user is deleted, all the related posts, comments and subcomments will be deleted (cascade)
- When a post is deleted, all the related comments and subcomments will be deleted (cascade)
- Users can add comments on any post
- Users can edit/delete only their own comment  
    (exception is when a parent [user or post] gets deleted)
- Users can add subcomments on any comment
- Users can edit/delete only their own subcomment  
    (exception is when a parent [user, post or comment] gets deleted)
- On Access token expiration it will be refreshed automatically and unnoticeably to the user
- 3-step registration
- Forgotten password recovery

## Run the app
### Locally
```bash
npm install expo-cli
npm install
npm start
```