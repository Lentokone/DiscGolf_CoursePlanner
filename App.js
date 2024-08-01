import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import WebView from 'react-native-webview';

const { width, height } = Dimensions.get('window');
const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const [testilista, listasetter] = useState([]);
  const [courseList, cListsetter] = useState([])
  
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 20;
  
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const displayedItems = courseList.slice(startIndex, endIndex);
  const handleNext = () => {
    if (endIndex < courseList.length) {
      setCurrentPage(currentPage + 1);
      console.log(displayedItems)
    }
  };

  const handlePrevious = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  //? Tänne kaksi listaa
  //? Yksi jossa on kaikki, joka sitten tallennetaan kanssa. biglista{name: "Perkele", list: {ratalista[]} }

  
  const fetchCourseData = async () => {
    try {
      const response = await fetch('https://discgolfmetrix.com/api.php?content=courses_list&country_code=FI');
      const data = await response.json();
      const filteredData = data.courses.filter(course => course.Enddate === null)
      cListsetter(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  //! Eli varmaankin iso lista
  //! Ja siihen vaan lisätään {name: "Courses to go to", list: {}}
  
  

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return <HomeScreen/>;
      case 'Details':
        return <CourseDetailsScreen Previous={handlePrevious} Next={handleNext} courses={displayedItems} fetchData={fetchCourseData}/>;
      case 'Map':
        return <MapScreen route={displayedItems}/>;
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
          <Button title="Course Details" onPress={() => setCurrentScreen('Details')} />
          <Button title="Map" onPress={() => setCurrentScreen('Map')} />
        </View>
      </View>
    </NavigationContainer>
  );
};

const HomeScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Home Screen</Text>
  </View>
);

const CourseDetailsScreen = ({Previous, Next, courses, fetchData}) => (
  <View style={styles.screenContainer}>
    <View style={styles.buttonRow}>
      <Button title='Prev' onPress={Previous}/>
      <Button title="Fetch Courses" onPress={fetchData} />
      <Button title='Next'onPress={Next}/>
    </View>
      <ScrollView style={styles.scrollView}>
        {courses.map(course => (
          <TouchableOpacity
            key={course.ID}
            onPress={() => navigation.navigate('CourseDetail', { course })}
          >
            <View style={styles.courseItem}>
              <Text style={styles.courseName}>{course.Name} - {course.X} </Text>
              <Button
                title="Add to List"
                onPress={() => handleAddToCourseList('Courses to go to', course)}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
  </View>
);

const DetailsScreenButton = () => {
  fetchCourseData();
};



const MapScreen = ({ route }) => {
  // Extract courses from the route parameters
  // Convert courses data to JSON string for WebView
  const courseMarkers = route.map(course => ({
    lat: parseFloat(course.X),
    lng: parseFloat(course.Y),
    name: course.Name
  }));
  const courseMarkersJson = JSON.stringify(courseMarkers);
  
  const injectedJavaScript = `
    (function() {
      if (typeof window !== 'undefined') {
        window.courses = ${courseMarkersJson};
        window.postMessage('Courses data injected');
      }
    })();
  `;

  return (
    <View style={styles.screenContainer}>
      <WebView
        source={{ uri: 'file:///android_asset/leaflet.html' }} // For Android
        // source={{ uri: 'file:///path/to/your/assets/leaflet.html' }} // For iOS
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => console.log('WebView message:', event.nativeEvent.data)}
        style={styles.webvieww}
        onError={(error) => console.error('WebView error:', error)}
        onLoadStart={() => console.log('WebView loading started')}
        onLoadEnd={() => console.log('WebView loading ended')}
      />
    </View>
  );
};

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
    minWidth: '100%',
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
  buttonRow: {
    flexDirection: 'row',
  }
});

export default App;