import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Picker,
  AppState,
  Clipboard,
  Platform,
  ScrollView,
  TouchableOpacity,
  AsyncStorage,
} from 'react-native';

import { StackNavigator } from 'react-navigation';
import FCM, { NotificationActionType, FCMEvent } from 'react-native-fcm';
import { registerKilledListener, registerAppListener, refreshTokenGroup } from './Listeners';
// import firebaseClient from './FirebaseClient';
import { firebaseClient, firebaseGroup } from './api';
import FirebaseConstants from './FirebaseConstants';

// import Block from './Block';
import StyledText from './StyledText';
// import { styles } from '../styles';


registerKilledListener();

const style = StyleSheet.create({
  picker: {
    flex: 1,
    width: 100,
  },
});

const sendRemoteNotification = (token = FirebaseConstants.TOKENS) => {
  let body;
  console.log('to token ', token);
  if (Platform.OS === 'android') {
    body = {
      // registration_ids: tokens,
      to: token,
      data: {
        custom_notification: {
          title: 'Simple FCM Client',
          body: 'Click me to go to detail',
          sound: 'default',
          priority: 'high',
          show_in_foreground: true,
          targetScreen: 'detail',
        },
      },
      priority: 10,
    };
  } else {
    body = {
      // registration_ids: tokens,
      to: token,
      notification: {
        title: 'Simple FCM Client',
        body: 'Click me to go to detail',
        sound: 'default',
      },
      data: {
        targetScreen: 'detail',
      },
      priority: 10,
    };
  }

  firebaseClient.send(body, 'notification');
};

const sendRemoteData = (token) => {
  const body = {
    to: token,
    data: {
      title: 'Simple FCM Client',
      body: 'This is a notification with only DATA.',
      sound: 'default',
    },
    priority: 'normal',
  };

  firebaseClient.send(body, 'data');
};

const showLocalNotification = () => {
  FCM.presentLocalNotification({
    id: new Date().valueOf().toString(), // (optional for instant notification)
    title: 'Test Notification with action', // as FCM payload
    body: 'Force touch to reply', // as FCM payload (required)
    sound: 'bell.mp3', // "default" or filename
    priority: 'high', // as FCM payload
    click_action: 'com.myapp.MyCategory', // as FCM payload - this is used as category identifier on iOS.
    badge: 10, // as FCM payload IOS only, set 0 to clear badges
    number: 10, // Android only
    ticker: 'My Notification Ticker', // Android only
    auto_cancel: true, // Android only (default true)
    large_icon: 'https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg', // Android only
    icon: 'ic_launcher', // as FCM payload, you can relace this with custom icon you put in mipmap
    big_text: 'Show when notification is expanded', // Android only
    sub_text: 'This is a subText', // Android only
    color: 'red', // Android only
    vibrate: 300, // Android only default: 300, no vibration if you pass 0
    wake_screen: true, // Android only, wake up screen when notification arrives
    group: 'group', // Android only
    picture: 'https://google.png', // Android only bigPicture style
    ongoing: true, // Android only
    my_custom_data: 'my_custom_field_value', // extra data you want to throw
    lights: true, // Android only, LED blinking (default false)
    show_in_foreground: true, // notification when app is in foreground (local & remote)
  });
};

const showLocalNotificationWithAction = () => {
  FCM.presentLocalNotification({
    title: 'Test Notification with action',
    body: 'Force touch to reply',
    priority: 'high',
    show_in_foreground: true,
    click_action: 'com.myidentifi.fcm.text', // for ios
    android_actions: JSON.stringify([{
      id: 'view',
      title: 'view',
    }, {
      id: 'dismiss',
      title: 'dismiss',
    }]), // for android, take syntax similar to ios's. only buttons are supported
  });
};


const scheduleLocalNotification = () => {
  FCM.scheduleLocalNotification({
    id: 'testnotif',
    fire_date: new Date().getTime() + 5000,
    vibrate: 500,
    title: 'Hello',
    body: 'Test Scheduled Notification',
    sub_text: 'sub text',
    priority: 'high',
    large_icon: 'https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg',
    show_in_foreground: true,
    picture: 'https://firebase.google.com/_static/af7ae4b3fc/images/firebase/lockup.png',
    wake_screen: true,
    extra1: { a: 1 },
    extra2: 1,
  });
};

class MainPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      seconds: 5,
      token: '',
      tokenCopyFeedback: '',
      groupToken: '',
    };
    this.setClipboardContent = this.setClipboardContent.bind(this);
    this.clearTokenCopyFeedback = this.clearTokenCopyFeedback.bind(this);
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    registerAppListener(this.props.navigation);
    FCM.getInitialNotification().then((notif) => {
      this.setState({
        initNotif: notif,
      });
      if (notif && notif.targetScreen === 'detail') {
        setTimeout(() => {
          this.props.navigation.navigate('Detail');
        }, 500);
      }
    });

    try {
      const result = await FCM.requestPermissions({
        badge: false, sound: true, alert: true });
    } catch (e) {
      console.error(e);
    }

    FCM.getFCMToken().then(async (token) => {
      console.log('TOKEN (getFCMToken)', token);
      this.setState({ token: token || '' });
      await refreshTokenGroup(token);
      AsyncStorage.getItem('groupToken')
        .then(JSON.parse)
        .then((groupToken) => {
          console.log('groupToken setState', groupToken);
          this.setState({ groupToken });
        });
    });

    if (Platform.OS === 'ios') {
      FCM.getAPNSToken().then((token) => {
        console.log('APNS TOKEN (getFCMToken)', token);
      });
    }

    // topic example
    // FCM.subscribeToTopic('sometopic')
    // FCM.unsubscribeFromTopic('sometopic')
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  setClipboardContent(text) {
    Clipboard.setString(text);
    this.setState({ tokenCopyFeedback: 'Token copied to clipboard.' });
    setTimeout(() => { this.clearTokenCopyFeedback(); }, 2000);
  }

  clearTokenCopyFeedback() {
    this.setState({ tokenCopyFeedback: '' });
  }

  handleAppStateChange = (appState) => {
    if (appState === 'background') {
      // todo schedule background notification
      console.log('app is in background', this.state.seconds);
    }
  }

  render() {
    const { token, groupToken, tokenCopyFeedback } = this.state;
    console.log('this.state ', this.state);
    return (
      <View style={[styles.block, styles.container]}>
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <View style={styles.container}>
            <StyledText>
              <Text style={styles.welcome}>
                Choose notification time in seconds.
              </Text>
            </StyledText>
            <Picker
              style={style.picker}
              selectedValue={this.state.seconds}
              onValueChange={seconds => this.setState({ seconds })}
            >
              <Picker.Item label='5' value={5} />
              <Picker.Item label='10' value={10} />
              <Picker.Item label='15' value={15} />
            </Picker>
          </View>
          <Text style={styles.welcome}>
            Welcome to Simple Fcm Client!
          </Text>

          <Text style={styles.feedback}>
            {tokenCopyFeedback}
          </Text>

          <Text style={styles.feedback}>
            Remote notif won't be available to iOS emulators
          </Text>
          <TouchableOpacity
            onPress={() => refreshTokenGroup(token)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Register token in group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => sendRemoteNotification(groupToken || token)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Send Remote Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => sendRemoteData(token)} style={styles.button}>
            <Text style={styles.buttonText}>Send Remote Data</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showLocalNotification()} style={styles.button}>
            <Text style={styles.buttonText}>Show Local Notification</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => showLocalNotificationWithAction(token)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Show Local Notification with Action</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => scheduleLocalNotification()} style={styles.button}>
            <Text style={styles.buttonText}>Schedule Notification in 5s</Text>
          </TouchableOpacity>
          <Text style={styles.instructions}>
            Init notif:
          </Text>
          <Text>
            {JSON.stringify(this.state.initNotif)}
          </Text>
          <Text style={styles.instructions}>
            Token:
          </Text>
          <Text selectable onPress={() => this.setClipboardContent(this.state.token)}>
            {this.state.token}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const DetailPage = props => (
  <View
    style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
  >
    <Text>Detail page</Text>
  </View>);

export default StackNavigator({
  Main: {
    screen: MainPage,
  },
  Detail: {
    screen: DetailPage,
  },
}, {
  initialRouteName: 'Main',
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 2,
  },
  feedback: {
    textAlign: 'center',
    color: '#996633',
    marginBottom: 3,
  },
  button: {
    backgroundColor: 'teal',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    backgroundColor: 'transparent',
  },
});
