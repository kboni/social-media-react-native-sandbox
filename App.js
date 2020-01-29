import React from 'react';
import { KeyboardAvoidingView, StyleSheet, StatusBar } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { AppNavigator } from './src/router';

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return (
      <KeyboardAvoidingView style={ styles.main_container } behavior="padding" enabled>
          <AppContainer />
      </KeyboardAvoidingView> 
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1, 
    paddingTop: StatusBar.currentHeight
  }
});