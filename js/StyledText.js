/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';

class StyledText extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Text style={styles.textFont}>
        {this.props.children}
      </Text>
    );
  }
}
const styles = StyleSheet.create({
  textFont: {
    fontFamily: 'Apple SD Gothic Neo',
    fontSize: 15,
    color: '#777',
  },
});

export default StyledText;
