import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {Dropdown} from 'react-native-element-dropdown';
import WebView from 'react-native-webview';

const App = () => {
  // State variables
  const [currentScreen, setCurrentScreen] = useState('Lists');
  const [allUserLists, setAllUserLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedListIndex, setSelectedListIndex] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Handles adding a course to a list.
  const handleAddCourseToList = course => {
    if (selectedList) {
      const updatedLists = allUserLists.map((list, index) => {
        if (index === selectedList.index) {
          // Check if the course already exists in the list.
          const courseExists = list.list.some(
            existingCourse => existingCourse.ID === course.ID,
          );

          if (!courseExists) {
            // If course does not exist, add it to the list.
            return {...list, list: [...list.list, course]};
          } else {
            // If course exists, return the list as is.
            return list;
          }
        }
        return list;
      });

      // Sets the updatedLists as allUserLists.
      setAllUserLists(updatedLists);
    }
  };

  // Handles showing the course on a map.
  const handleShowOnMap = course => {
    setCurrentScreen('Map');
    setSelectedCourse(course);
  };

  // Fetches the course data from the API.
  const fetchCourseData = async () => {
    try {
      const response = await fetch(
        'https://discgolfmetrix.com/api.php?content=courses_list&country_code=FI',
      );
      const data = await response.json();
      // Filters out all the courses that have ended.
      const filteredData = data.courses.filter(
        course => course.Enddate === null,
      );
      setCourseList(filteredData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Handles screen rendering.
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Lists':
        return (
          <ListsScreen
            screenChanging={setCurrentScreen}
            userList={allUserLists}
            setUserList={setAllUserLists}
            selectedList={selectedList}
            setSelectedList={setSelectedList}
            setSelectedListIndex={setSelectedListIndex}
            screenSwitch={handleShowOnMap}
          />
        );
      case 'Courses':
        return (
          <CoursesScreen
            courses={courseList}
            fetchData={fetchCourseData}
            selectedList={selectedList}
            handleListAdd={handleAddCourseToList}
            screenSwitch={handleShowOnMap}
          />
        );
      case 'Map':
        return (
          <MapScreen DGcourses={courseList} selectedCourse={selectedCourse} />
        );
      case 'ListManagement':
        return (
          <ListManagementScreen
            allUserLists={allUserLists}
            setAllUserLists={setAllUserLists}
            setSelectedList={setSelectedList}
            screenChanging={setCurrentScreen}
          />
        );
      default:
        return <ListsScreen />;
    }
  };

  // Main render method.
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <View style={styles.mainContent}>{renderScreen()}</View>
        <View style={styles.navbar}>
          <Button title="Lists" onPress={() => setCurrentScreen('Lists')} />
          <Button
            title="Courses"
            onPress={() => setCurrentScreen('Courses')}
          />
          <Button 
          title="Map" 
          onPress={() => setCurrentScreen('Map')} />
        </View>
      </View>
    </NavigationContainer>
  );
};

// Screen for managing and viewing course lists
const ListsScreen = ({
  screenChanging,
  userList,
  setUserList,
  selectedList,
  setSelectedList,
  setSelectedListIndex,
  screenSwitch,
}) => {
  // State variables.
  const [label, setLabel] = useState(null);
  const [value, setValue] = useState(null);
  const [isFocus, setIsFocus] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);

  // Makes the data that is shown in the dropdown menu.
  const dropdownData = userList.map((list, index) => ({
    label: list.name,
    value: index,
  }));

  // Handles changing the screen to ListManagement.
  const buttonConst = () => {
    screenChanging('ListManagement');
  };

  useEffect(() => {
    if (selectedList) {
      setValue(selectedList.index); // Ensure value is set to the selected list index
      setLabel(selectedList.name);
      setSelectedList({
        ...userList[selectedList.index],
        index: selectedList.index,
      });
    }
  }, []);

  // Handles removing the course with the given courseID from the selected list.
  const handleRemoveCourse = courseId => {
    if (selectedList) {
      const updatedLists = userList.map((list, index) => {
        if (index === selectedList.index) {
          // Filters out the course to be removed
          const updatedList = list.list.filter(
            course => course.ID !== courseId,
          );
          return {...list, list: updatedList};
        }
        return list;
      });

      setUserList(updatedLists);

      // Update selectedList to reflect changes immediately
      setSelectedList({
        ...updatedLists[selectedList.index],
        index: selectedList.index,
      });
    }
  };

  // Function to handle expansion of a course item.
  const handleExpandItem = id => {
    setExpandedItemId(expandedItemId === id ? null : id);
  };

  // Renders each course item in the list.
  const renderCourseItem = ({item}) => {
    const isExpanded = expandedItemId === item.ID;

    return (
      <TouchableOpacity
        onPress={() => handleExpandItem(item.ID)}
        style={styles.courseItem}>
        <Text style={styles.courseName}>{item.Fullname}</Text>
        <Text>City : {item.City}</Text>
        <View style={styles.viewInRow}>
          <TouchableOpacity
            onPress={() => handleRemoveCourse(item.ID)}
            style={styles.ownButton}>
            <Text style={styles.ownButtonText}>Remove</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => screenSwitch(item)}
            style={styles.ownButton}>
            <Text style={styles.ownButtonText}>Show on map</Text>
          </TouchableOpacity>
        </View>
        {isExpanded && (
          <View style={styles.expandedView}>
            <Text>Area: {item.Area}</Text>
            <Text>Location: {!item.Location ? 'N/A' : item.Location}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Course lists</Text>
      <Button title="Manage lists" onPress={buttonConst} />

      <View style={styles.dropDown}>
        <Dropdown
          style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
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
            setSelectedList({...userList[selectedIndex], index: selectedIndex});
            setSelectedListIndex(selectedIndex);
            setIsFocus(false);
          }}
        />
      </View>

      {selectedList && (
        <FlatList
          data={selectedList.list}
          keyExtractor={item => item.ID.toString()}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </View>
  );
};

// Screen for viewing and managing courses
const CoursesScreen = ({
  courses,
  fetchData,
  selectedList,
  handleListAdd,
  screenSwitch,
}) => {
  // State variables for course management
  const [expandIndex, setExpandIndex] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 20;

  // Filters the course with the input from the search box.
  useEffect(() => {
    const filtered = courses.filter(course =>
      course.Name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredCourses(filtered);
    setCurrentPage(0); // Reset to first page on search
  }, [searchQuery, courses]);

  // Variables for handling pages for the courses
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedItems = filteredCourses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  // Handles moving to the previous page.
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  // Handles moving to the next page.
  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  // Renders all the items from the list.
  const renderItem = ({item, index}) => {
    const isExpanded = expandIndex === index;
    return (
      <TouchableOpacity
        onPress={() => setExpandIndex(isExpanded ? null : index)}>
        <View style={styles.courseItem}>
          <Text style={styles.courseName}>{item.Fullname}</Text>
          <Text>City : {item.City}</Text>
          {isExpanded && (
            <View style={styles.expandedView}>
              <Text>Area : {item.Area} </Text>
              <Text>Location : {item.Location} </Text>
            </View>
          )}
          <View style={styles.viewInRow}>
            <TouchableOpacity
              style={styles.ownButton}
              onPress={() => handleListAdd(item)}>
              <Text style={styles.ownButtonText}>Add to List</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ownButton}
              onPress={() => screenSwitch(item)}>
              <Text style={styles.ownButtonText}>Show on Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.buttonRow}>
        <View style={styles.buttonView}>
          <TouchableOpacity onPress={handlePrevious} style={styles.ownButton}>
            <Text style={styles.ownButtonText}>Prev</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={fetchData} style={styles.ownButton}>
            <Text style={styles.ownButtonText}>Fetch Courses</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNext} style={styles.ownButton}>
            <Text style={styles.ownButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search courses"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={displayedItems}
        renderItem={renderItem}
        keyExtractor={item => item.ID.toString()}
        extraData={expandIndex}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

// Screen for managing the map.
// The map is made by using webview items and with them using leaflet.
// It is done this way, because other maps required to get api keys and I was not familiar with that.
const MapScreen = ({DGcourses, courseOnMap, selectedCourse}) => {
  const bounds = [
    [60.0, 20.0],
    [71.5, 31.5],
  ];

  // Sets the data for the markers, which are given to leaflet.html.
  const courseMarkers = DGcourses.filter(course => course.X && course.Y)
    .map(course => ({
      lat: parseFloat(course.X),
      lng: parseFloat(course.Y),
      name: course.Name,
      Fullname: course.Fullname,
      area: course.Area || 'N/A',
      city: course.City || 'N/A',
    }))

    // This filters every course that is out of bounds.
    // It also filters out one specific course which is in the middle of an ocean for some reason.
    // ( The specific course in the middle of an ocean is not  )
    .filter(
      course =>
        course.lat >= bounds[0][0] &&
        course.lat <= bounds[1][0] &&
        course.lat != 63.63193454567187 &&
        course.lng >= bounds[0][1] &&
        course.lng <= bounds[1][1] &&
        course.lng != 21.477857921289853,
    );

  // Converts the courseMarkers data into JSON for the leaflet.html.
  const courseMarkersJson = JSON.stringify(courseMarkers);

  // Sets the data for the markers, which are given to leaflet.html.
  // This is for when the user presses the "Show on map" button on a course.
  const selectedMarkerJson = selectedCourse
    ? JSON.stringify({
        lat: parseFloat(selectedCourse.X),
        lng: parseFloat(selectedCourse.Y),
        Fullname: selectedCourse.Fullname,
        area: selectedCourse.Area,
        city: selectedCourse.City,
      })
    : null;

  // This script is injected into the WebView to pass course data and the selected marker
  const injectedJavaScript = `
    (function() {
      // Ensures that the 'window' object is available
      if (typeof window !== 'undefined') {
        // Sets 'window.courses' with the list of course markers to be displayed on the map
        window.courses = ${courseMarkersJson};

        // Sets 'window.selectedMarker' with the data of the currently selected course, if any
        window.selectedMarker = ${selectedMarkerJson};

        // Sends a message to the WebView indicating that the course data has been injected
        window.postMessage('Courses data injected');
      }
    })();
  `;

  return (
    <View style={styles.screenContainer}>
      <WebView
        source={{uri: 'file:///android_asset/leaflet.html'}} // For Android
        injectedJavaScript={injectedJavaScript}
        onMessage={event =>
          console.log('WebView message:', event.nativeEvent.data)
        }
        style={styles.webvieww}
        onError={error => console.error('WebView error:', error)}
        onLoadStart={() => console.log('WebView loading started')}
        onLoadEnd={() => console.log('WebView loading ended')}
      />
    </View>
  );
};

// Screen for managing the lists the user has made.
const ListManagementScreen = ({
  allUserLists,
  setAllUserLists,
  setSelectedList,
  screenChanging
}) => {
  // State variables for handling the name of a new list.
  const [newListName, setNewListName] = useState('');

  // Handles the making of a new list
  const handleAddUserMadeList = () => {
    // If the input is not empty
    if (newListName.trim() !== '') {
      setAllUserLists(prevLists => [
        ...prevLists,
        {name: newListName, list: []},
      ]);
      // Clears the input
      setNewListName('');
    }
  };

  // Handles removing a list from the allUserLists, which contains all the lists that user made.
  const handleRemoveUserMadeList = index => {
    setAllUserLists(prevLists => prevLists.filter((_, i) => i !== index));
    setSelectedList(null);
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.buttonView}>
        <TouchableOpacity onPress={() => screenChanging('Lists')} style={styles.ownButton}>
          <Text style={styles.ownButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.Management}>
        <TextInput
          style={styles.input}
          placeholder="List Name"
          value={newListName}
          onChangeText={setNewListName}
        />
        <Button title="Add List" onPress={handleAddUserMadeList} />
      </View>
      <ScrollView style={styles.scrollView}>
        {allUserLists.map((list, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listName}>{list.name}</Text>
            <Button
              title="Delete"
              onPress={() => handleRemoveUserMadeList(index)}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// A pile of messy styling items.
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
  },
  Management: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 5,
    width: '80%',
  },
  input: {
    width: "70%",
    borderColor: 'black',
    borderWidth: 2
  },
  listItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    width: '100%',
  },
  listName: {
    fontSize: 20,
  },
  screenTitle: {
    fontSize: 20,
  },
  buttonRow: {
    padding: 3,
  },
  viewInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonView: {
    flexDirection: 'row',
    width: '80%',
    borderColor: 'gray',
    borderWidth: 1,
  },
  searchBar: {
    width: '65%',
    padding: 15,
    backgroundColor: 'lightgray',
    fontSize: 20,
    borderColor: 'brown',
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  dropDown: {
    width: '80%',
  },
  scrollViewContent: {
    minWidth: '100%',
  },
  courseItem: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    backgroundColor: 'lightgray',
    width: '100%',
    minWidth: '100%',
  },
  courseName: {
    textAlign: 'center',
    fontSize: 20,
  },
  dropdown: {
    padding: 5,
    backgroundColor: 'lightblue',
    borderWidth: 2,
    borderColor: 'hotpink',
  },
  ownButton: {
    flex: 1,
    backgroundColor: 'lightblue',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 1,
  },
  ownButtonText: {
    fontSize: 20,
  },
});

export default App;