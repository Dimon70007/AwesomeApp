/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
} from 'react-native';
// import { Block, StyledText } from './js';
// import { styles } from './styles';

export default class AwesomeApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [
        (<Block key='To get1' text='To get started, edit index.android.js' />),
        (<Block key='To get2' text='To get started, edit index.android.js' />),
        (<Block key='To get3' text='To get started, edit index.android.js' />),
        (<Block key='To get4' text='To get started, edit index.android.js' />),
        (<Block key='To get5' text='To get started, edit index.android.js' />),
        (<Block
          key='Double tap'
          text={'Double tap R on your keyboard to reload,\n
          Shake or press menu button for dev menu'}
         />)
      ],
    };
    this.moveItems = ::this.moveItems;
  }
  componentDidMount() {
    this.blink = setInterval(() => {
      this.moveItems();
    }, 2000);
  }
  componentWillUnmount() {
    clearInterval(this.blink);
  }
  moveItems() {
    this.setState(({ items: prevItems }) => ({
      items: [
        prevItems[prevItems.length - 1],
        ...prevItems.slice(0, -1),
      ],
    }));
  }
  render() {
    return (
      <View style={[styles.block, styles.container]}>
        <View style={styles.container}>
          <StyledText>
            <Text style={styles.welcome}>
              Welcome to React Native!
            </Text>
          </StyledText>
        </View>
        {this.state.items}
      </View>
    );
  }
}


AppRegistry.registerComponent('AwesomeApp', () => AwesomeApp);
