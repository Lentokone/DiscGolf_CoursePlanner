import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dropdown } from 'react-native-element-dropdown';

import WebView from 'react-native-webview';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');

  const [userLists, setuserLists] = useState([]);
  const [newListName, setNewListName] = useState('');

  const [courseList, cListsetter] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const itemsPerPage = 20;
  
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  const displayedItems = courseList.slice(startIndex, endIndex);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const handleUserListAdd = () => {
    if (newListName.trim() !== '') {
      setuserLists([...userLists, { name: newListName, courses: [] }]);
      setNewListName('');
    }
  };

  const handleRemoveList = (index) => {
    setuserLists(userLists.filter((_, i) => i !== index));
    if (selectedListIndex === index) {
      setSelectedListIndex(null);
    }
  };

  const handleListChange = (item) => {
    setSelectedListIndex(item.value);
  };

  const handleAddCourseToList = (course) => {
    if (selectedListIndex !== null) {
      const updatedLists = [...userLists];
      updatedLists[selectedListIndex].courses.push(course);
      setuserLists(updatedLists);
    }
  };

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
        return <HomeScreen listings={displayedItems} screenChanging={setCurrentScreen} selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse}/>;
      case 'Details':
        return <CourseDetailsScreen Previous={handlePrevious} Next={handleNext} courses={displayedItems} fetchData={fetchCourseData}/>;
      case 'Map':
        return <MapScreen DGcourses={courseList}/>;
      case 'ListManagement':
        return <ListManagementScreen selectedList={selectedCourse}/>;
      default:
        return <HomeScreen listings={displayedItems}/>;
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

const HomeScreen = ({listings, screenChanging, setSelectedCourse, selectedCourse}) => {
  
  const paskareact = () => {
    screenChanging('ListManagement')
  }
  
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const dropdownData = listings?.map(course => ({
    label: course.Name,
    value: course.ID,
    course: course
  }));

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Course lists</Text>
      <Button title='Manage lists' onPress={() => paskareact()}></Button>
      <View style={styles.dropDown}>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData || []}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select item' : '...'}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setLabel(item.label)
            setValue(item.value)
            setSelectedCourse(item.course);
            setIsFocus(false);
          }}
        />
      </View>
      <Text>
        {selectedCourse ? `Selected Course: ${selectedCourse.Name}` : 'No course selected'}
      </Text>
    </View>
  );
};

const CourseDetailsScreen = ({Previous, Next, courses, fetchData}) => (
  <View style={styles.screenContainer}>
    <View style={styles.buttonRow}>
      <Button title='Prev' onPress={Previous}/>
      <Button title="Fetch Courses" onPress={fetchData} />
      <Button title='Next'onPress={Next}/>
    </View>
    <View style={styles.scrollView}>
      <ScrollView>
        {courses.map(course => (
          <TouchableOpacity
          key={course.ID}
          onPress={() => navigation.navigate('CourseDetail', { course })}
          >
            <View style={styles.courseItem}>
              <Text style={styles.courseName}>{course.Name}</Text>
              <Button
                title="Add to List"
                onPress={() => handleAddToCourseList('Courses to go to', course)}
                />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  </View>
);


const MapScreen = ({ DGcourses }) => {
  // Define the bounds for Finland
  const bounds = [
    [60.0, 20.0], // Southwest corner
    [71.5, 31.5]  // Northeast corner
  ];

  // Extract courses from the route parameters
  // Convert courses data to JSON string for WebView
  const courseMarkers = DGcourses
  .filter(course => course.X && course.Y)
  .map(course => ({
    lat: parseFloat(course.X),
    lng: parseFloat(course.Y),
    name: course.Name
  }))
  //This filters the courses that go out of bounds. Also a certain course that for some reason is in the middle of the ocean.
  .filter(course => 
    course.lat >= bounds[0][0] && course.lat <= bounds[1][0] && course.lat != 63.63193454567187 &&
    course.lng >= bounds[0][1] && course.lng <= bounds[1][1] && course.lng != 21.477857921289853
  );
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


const ListManagementScreen = ({selectedList}) => {
return (
  <View style={styles.screenContainer}>
    <Text>{selectedList.Name}</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
    <Text>Apina</Text>
  </View>)
}

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
    borderWidth: 1,
    borderColor: 'hotpink',
  },
  screenTitle: {
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropDown: {
    width: "80%"
  },
  courseItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    width: "100%"
  },
  dropdown: {
    padding: 5,
    backgroundColor: 'lightblue',
    borderWidth: 2,
    borderColor: 'hotpink'
  },
  courseName: {
    textAlign: 'center',
  },
});

export default App;