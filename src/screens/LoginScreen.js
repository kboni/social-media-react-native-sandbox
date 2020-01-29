import React from 'react';
import { StyleSheet, 
  Alert,
  View, 
  Button } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { logIn, 
  saveUserRefreshToken, 
  saveUserAccessToken } from '../services/AuthService';


export default class LoginScreen extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      username: null,
      password: null,
      access_token: null,
      refresh_token: null
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.top_container}>
          <TextInput style={styles.textfields} placeholder={'Username'} autoCompleteType='username'
            onChangeText={(text) => this.setState({username:text})}/>
          <TextInput style={styles.textfields} placeholder={'Password'} autoCompleteType='password' 
              secureTextEntry={true} onChangeText={(text) => this.setState({password:text})}/>
          <View style={styles.buttons}>
              <Button title="Login"
                  onPress={() => this._logInAsync()}/>
          </View>
          <View style={styles.buttons}>
              <Button style={styles.buttons} title="Forgot password" 
                  onPress={() => this.props.navigation.navigate("RegisterEmail", {forgottenPassword: true})}/>
          </View>
          <View style={styles.buttons}>
              <Button style={styles.buttons} title="Register" 
                  onPress={() => this.props.navigation.navigate("RegisterEmail")}/>
          </View>
        </View>
      </View>
    );
  }


  _logInAsync = () => {
    if (!this.state.username || !this.state.password) {
      Alert.alert('Validation', 'Emtpy field!');
      return;
    }

    let username = this.state.username.toLowerCase().trim();
    let password = this.state.password.trim();

    logIn(username, password)
    .then(res => {
      const { data, statusCode } = res;
      if(statusCode === 200 && data.message && data.access_token && data.refresh_token) {
        let refreshTokenSaved = saveUserRefreshToken(data.refresh_token);
        let accessTokenSaved = saveUserAccessToken(data.access_token);
        Promise.all([refreshTokenSaved, accessTokenSaved]) 
        .then(() => this.props.navigation.navigate('App')); 
      }
      else {
        Alert.alert('Error', 'Login error!');
        throw 'Login else error with response: ' + res;
      }
    })
    .catch((error) => {
      console.log('Login error: ' + error);
      this.setState({ error })
    });
  };
} 


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555',
    justifyContent: 'center',
    alignContent: 'center',
  },
  top_container: {
    justifyContent: 'center',
  },
  textfields: {
    borderColor: '#FFF',
    borderWidth: 2,
    alignSelf: 'center',
    width: '80%',
    marginBottom: 15
  },
  buttons: {
    margin: 30
  }
});