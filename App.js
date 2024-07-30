import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import WebView from 'react-native-webview';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const [apina, apinasetter] = useState("");
  const [testilista, listasetter] = useState([]);

  const apinahandler = enteredText => {
    apinasetter(enteredText);
  }

  const tListHandler = () => 
  {
    listasetter(testilista => [...testilista, apina]);
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen apina={apina} apinahandler={apinahandler} tListHandler={tListHandler}/>;
      case 'Details':
        return <DetailsScreen testilista={testilista}/>;
      case 'Image':
        return <ImageScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <View style={styles.mainContent}>
          {renderScreen()}
        </View>
        <View style={styles.navbar}>
          <Button title="Home" onPress={() => setCurrentScreen('Home')} />
          <Button title="Details" onPress={() => setCurrentScreen('Details')} />
          <Button title="Image" onPress={() => setCurrentScreen('Image')} />
        </View>
      </View>
    </NavigationContainer>
  );
};

const HomeScreen = ({apina, apinahandler, tListHandler}) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Home Screen</Text>
    <TextInput value={apina} onChangeText={apinahandler}>

    </TextInput>
    <Button title='Apina' onPress={tListHandler}></Button>
  </View>
);

const DetailsScreen = ({testilista}) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Details Screen</Text>
    {testilista.length === 0 ? (
      <Text>No items in the list</Text>
    ) : (
      testilista.map((item, index) => (
        <View style={styles.listItemStyle} key={index}>
          <Text>
            {index + 1}: {item}
          </Text>
        </View>
      ))
    )}
  </View>
);

const ImageScreen = () => (
  <View style={styles.screenContainer}>
    <WebView
      source={{ uri: 'file:///android_asset/leaflet.html' }} // For Android
      // source={{ uri: 'file:///path/to/your/assets/leaflet.html' }} // For iOS
      style={styles.webvieww}
      onError={(error) => console.error('WebView error:', error)}
      onLoadStart={() => console.log('WebView loading started')}
      onLoadEnd={() => console.log('WebView loading ended')}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webvieww: {
    borderColor: 'red',
    borderWidth: 150,
    padding: 30,
  },
  navbar: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#def',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: "100%",
    borderColor: 'red',
    borderWidth: 5,
  },
  screenTitle: {
    fontSize: 20,
  },
});

export default App;
