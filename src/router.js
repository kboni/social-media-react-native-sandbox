import { createStackNavigator } from 'react-navigation-stack';
import { createSwitchNavigator } from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import RegisterEmailScreen from './screens/RegisterEmailScreen';
import RegistrationCodeScreen from './screens/RegistrationCodeScreen'
import RegisterUsernameAndPasswordScreen from './screens/RegisterUsernameAndPasswordScreen'
import PostListScreen from './screens/PostListScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import PostDetailsScreen from './screens/PostDetailsScreen';

const init_header_mode = { headerMode: 'none' };

export const AppStack = createStackNavigator({ 
  PostList: PostListScreen,
  PostDetails: PostDetailsScreen,
  ChangePassword: ChangePasswordScreen,
  EditProfile: EditProfileScreen,
  ChangePassword: ChangePasswordScreen
 }, init_header_mode);
export const AuthStack = createStackNavigator({ 
  Login: LoginScreen, 
  RegisterEmail: RegisterEmailScreen ,
  RegistrationCode: RegistrationCodeScreen,
  RegisterUsernameAndPassword: RegisterUsernameAndPasswordScreen
}, init_header_mode);

export const AppNavigator = createSwitchNavigator(
  {
    App: AppStack,
    Auth: AuthStack,
  }, { 
    initialRouteName: 'Auth',
    navigationOptions: {
        headerVisible: false,
    }
  }
);