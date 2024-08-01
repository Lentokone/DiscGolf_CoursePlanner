import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Dimensions } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const [apina, apinasetter] = useState("");
  const [testilista, listasetter] = useState([]);

  //? Tänne kaksi listaa
  //? Yksi jossa on kaikki, joka sitten tallennetaan kanssa. biglista{name: "Perkele", list: {ratalista[]} }

  const discGolfCourse =
  {
    "ID": "89",
    "ParentID": "3813",
    "Name": "DGP-9 (2013)",
    "Fullname": "Karhumäki DiscGolfPark &rarr; DGP-9 (2013)",
    "Type": "2",
    "CountryCode": "FI",
    "Area": "Etelä-Karjala",
    "City": "Imatra",
    "Location": null,
    "X": "61.20124441148789",
    "Y": "28.741837766750848",
    "Enddate": "2019-02-19"
  };
  //! Eli varmaankin iso lista
  //! Ja siihen vaan lisätään {name: "Courses to go to", list: {}}
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
      case 'Map':
        return <MapScreen />;
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
          <Button title="Map" onPress={() => setCurrentScreen('Map')} />
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

const MapScreen = () => (
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
    flex: 0,
    minWidth: '100%', //Note to self. Jostain vitun syystä webview ei hyväksy width: prosentteja. Piti pakottaa min-width koko
    height: '100%',
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
    width: '100%',
    borderWidth: 0,
    borderColor: 'hotpink',
  },
  screenTitle: {
    fontSize: 20,
  },
});

export default App;
