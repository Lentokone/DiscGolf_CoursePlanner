import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dropdown } from 'react-native-element-dropdown';
import WebView from 'react-native-webview';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [allUserLists, setAllUserLists] = useState([]);
  const [userList, setUserList] = useState([]);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListIndex, setSelectedListIndex] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = courseList.slice(startIndex, endIndex);

  const handleUserListAdd = () => {
    if (newListName.trim() !== '') {
      setUserList([...userList, { name: newListName, courses: [] }]);
      setNewListName('');
    }
  };

  const handleRemoveList = (index) => {
    setUserList(userList.filter((_, i) => i !== index));
    if (selectedList?.index === index) {
      setSelectedList(null);
    }
  };

  const handleListChange = (item) => {
    setSelectedList(userList[item.value]);
  };

  const handleAddCourseToList = (course) => {
    if (selectedList) {
      const updatedLists = allUserLists.map((list, index) => {
        if (index === selectedList.index) {
          return { ...list, list: [...list.list, course] };
        }
        return list;
      });
      setAllUserLists(updatedLists);
    }
  };

  const handleNext = () => {
    if (endIndex < courseList.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (startIndex > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch('https://discgolfmetrix.com/api.php?content=courses_list&country_code=FI');
      const data = await response.json();
      const filteredData = data.courses.filter(course => course.Enddate === null);
      setCourseList(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home':
        return (
          <HomeScreen
            listings={displayedItems}
            screenChanging={setCurrentScreen}
            userList={allUserLists}
            selectedList={selectedList}
            setSelectedList={setSelectedList}
            selectedListIndex={selectedListIndex}
            setSelectedListIndex={setSelectedListIndex}
          />
        );
      case 'Details':
        return (
          <CourseDetailsScreen
            Previous={handlePrevious}
            Next={handleNext}
            courses={displayedItems}
            fetchData={fetchCourseData}
            selectedList={selectedList}
            handleListAdd={handleAddCourseToList}
          />
        );
      case 'Map':
        return <MapScreen DGcourses={courseList} />;
      case 'ListManagement':
        return <ListManagementScreen allUserLists={allUserLists} setAllUserLists={setAllUserLists} setSelectedList={setSelectedList}/>;
      default:
        return <HomeScreen listings={displayedItems} />;
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

const HomeScreen = ({ listings, screenChanging, userList, selectedList, setSelectedList , selectedListIndex, setSelectedListIndex}) => {
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);

  const dropdownData = userList.map((list, index) => ({
    label: list.name,
    value: index,
  }));

  const buttonConst = () => {
    screenChanging('ListManagement');
    console.log(selectedList)
  };

  useEffect(() => {
    if (selectedList) {
      setValue(selectedList.index); // Ensure value is set to the selected list index
      setLabel(selectedList.name);
      setSelectedList({ ...userList[selectedList.index], index: selectedList.index });
    }
  }, []);

  const renderCourseList = (selectedList) => {
    return (
      selectedList && (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {selectedList.list.map((course, index) => (
            <View key={index} style={styles.courseItem}>
              <Text style={styles.courseName}>{course.Name}</Text>
              <Text>{course.City}</Text>
            </View>
          ))}
        </ScrollView>
      )
    );
  };
  

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Course lists</Text>
      <Button title='Manage lists' onPress={buttonConst} />

      <View style={styles.dropDown}>
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          data={dropdownData}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select list' : '...'}
          value={value}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            const selectedIndex = item.value;
            setLabel(item.label);
            setValue(item.value);
            setSelectedList({ ...userList[selectedIndex], index: selectedIndex });
            setSelectedListIndex(selectedIndex);
            console.log(selectedList)
            setIsFocus(false);
          }}
        />
      </View>

      {renderCourseList(selectedList)}
    </View>
  );
};

const CourseDetailsScreen = ({ Previous, Next, courses, fetchData, selectedList, handleListAdd }) => (
  <View style={styles.screenContainer}>
    <View style={styles.buttonRow}>
      <Button title='Prev' onPress={Previous} />
      <Button title="Fetch Courses" onPress={fetchData} />
      <Button title='Next' onPress={Next} />
    </View>
    <ScrollView style={styles.scrollView}>
      {courses.map(course => (
        <TouchableOpacity
          key={course.ID}
          // Assuming you need navigation for CourseDetail
          onPress={() => console.log('Navigate to Course Detail')}
        >
          <View style={styles.courseItem}>
            <Text style={styles.courseName}>{course.Name}</Text>
            <Text>{course.City}</Text>
            <Button
              title="Add to List"
              onPress={() => handleListAdd(course)}
            />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const MapScreen = ({ DGcourses }) => {
  const bounds = [
    [60.0, 20.0],
    [71.5, 31.5]
  ];

  const courseMarkers = DGcourses
    .filter(course => course.X && course.Y)
    .map(course => ({
      lat: parseFloat(course.X),
      lng: parseFloat(course.Y),
      name: course.Name
    }))
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

const ListManagementScreen = ({ allUserLists, setAllUserLists, setSelectedList }) => {
  const [newListName, setNewListName] = useState('');

  const handleAddUserMadeList = () => {
    if (newListName.trim() !== '') {
      setAllUserLists(prevLists => [
        ...prevLists,
        { name: newListName, list: [] }
      ]);
      setNewListName('');
    }
  };

  const handleRemoveUserMadeList = (index) => {
    setAllUserLists(prevLists => prevLists.filter((_, i) => i !== index));
    setSelectedList(null);
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.Management}>
        <TextInput
          style={styles.input}
          placeholder="List Name"
          value={newListName}
          onChangeText={setNewListName}
        />
        <Button title='Add List' onPress={handleAddUserMadeList} />
      </View>
      <ScrollView style={styles.scrollView}>
        {allUserLists.map((list, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listName}>{list.name}</Text>
            <Button title="Delete" onPress={() => handleRemoveUserMadeList(index)} />
          </View>
        ))}
      </ScrollView>
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
    flex: 1,
    width: '100%',
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
  },
  Management: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    width: '80%',
  },
  listItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    width: "100%",
  },
  listName: {
    fontSize: 20
  },
  screenTitle: {
    fontSize: 20,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  dropDown: {
    width: "80%"
  },
  scrollViewContent: {
    minWidth: "100%",
  },
  courseItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    width: "100%",
  },
  courseName: {
    textAlign: 'center',
    fontSize: 20,
  },
  dropdown: {
    padding: 5,
    backgroundColor: 'lightblue',
    borderWidth: 2,
    borderColor: 'hotpink'
  },
});

export default App;
