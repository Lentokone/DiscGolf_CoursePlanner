import React, {useState} from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

const App=()=>{
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Image" component={ImageScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen=(props)=>{
  return (
    <View style={{flex:1}}>
      <View style={{ flex: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Home Screen</Text>
      </View>
      <NavButtons params={props}/>
    </View>
  );
}
const DetailsScreen=(props)=>{
  return (
    <View style={{flex:1}}>
      <View style={{ flex: 8, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20,}}>Details Screen</Text>
      </View>
      <NavButtons params={props}/>
    </View>
  );
}
const ImageScreen=(props)=>{
  return (
    <View style={{flex:1}}>
      <View style={{ flex: 8, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.imageContainer}>
          <Text>Apina</Text>
        </View> 
      </View>
      <NavButtons params={props}/>
    </View>
  );
}

const NavButtons=({params})=>{
  return(
    <View style={styles.navbuttonstyle}>
      <Button onPress={()=>params.navigation.navigate("Details")} title="Details"/>
      <Button onPress={()=>params.navigation.navigate("Home")} title="Home"/>
      <Button onPress={()=>params.navigation.navigate("Image")} title="Image"/>
    </View>
  );
}

const styles=StyleSheet.create({
  navbuttonstyle:{
    flex:2,
    flexDirection:"row",
    backgroundColor:"#def",
    alignItems:"center",
    justifyContent:"space-around",    
  },
  imageContainer:{
    height:200,
    width:'50%',
    borderRadius:200,
    overflow:'hidden',
    borderWidth:3,
    borderColor:'red',
  },
  image:{
    height:'100%',
    width:'100%'
  },
});
export default App;