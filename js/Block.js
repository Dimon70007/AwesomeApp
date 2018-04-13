/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { PureComponent } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { styles } from '../styles';

class Block extends PureComponent {
  render() {
    return (
      <View style={styles.block}>
        <Text style={styles.instructions}>
          {this.props.text}
        </Text>
      </View>
    );
  }
}

export default Block;
