import React from 'react'
import { Component } from 'react';
import { createSlice } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
import mergeByKey from "array-merge-by-key";
import timeSinceString from './timeSinceString'
import mapStyles from './mapStyles'

var centreSetKeyCounter = 0;

const mostRecentPointMarkerIcon = "./map-icons/icon_red.png";
const mapCss = {
  width: '100%',
  height: '100%',
};

class SimpleMap extends Component {

  state = {
    currentCentreKey : -100
  };

  _pointTitle(p){
    return p.title + (p.title == null || p.title == "" ? "" : " ") + "["
    + timeSinceString(new Date(p.date)) + " ago, to " + Math.round(p.accuracy) + "m accuracy ]";
  }

  _circleMarker(colour){
    return {
        path: this.props.google.maps.SymbolPath.CIRCLE,
        fillColor: colour,
        fillOpacity: .7,
        scale: 4.5,
        strokeColor: 'white',
        strokeWeight: 1
    };
  }

  render(){
    const onMarkerClick = ((props, marker, e) => {
      this.props.setNewCentre({ lat: marker.position.lat(), lng: marker.position.lng(), default : false});
    }).bind(this);

    // Force re-centering
    let forceCentre = this.state.currentCentreKey != this.props.centreSetKey;
    this.state.currentCentreKey = this.props.centreSetKey;

    // Markers
    const singleAutoPointMarkerIcon  = this._circleMarker("blue");
    const singleManualPointMarkerIcon = this._circleMarker("red");

    return (
        <Map
          id="abc"
          google={this.props.google}
          zoom={8.01}
          style={mapCss}
          styles={mapStyles}
          mapTypeControl={false}
          fullscreenControl={false}
          initialCenter={this.props.centre}
          // TODO this throws an error when removing after setting
          {...(forceCentre ? {center:this.props.centre} : {})}
          minZoom={3}
        >
        {this.props.points.map(p => <Marker
           title={this._pointTitle(p)}
           name={p.id}
           position={{lat: p.lat, lng: p.long}}
           key={p.id}
           icon={p.isMostRecent ? mostRecentPointMarkerIcon : (p.type == "M" ? singleManualPointMarkerIcon : singleAutoPointMarkerIcon)}
           onClick={onMarkerClick}
           />
         )}
        </Map>)
      }
}

const WrappedSimpleMapComponent = GoogleApiWrapper({
  apiKey: 'AIzaSyC-fwqU90KKVz92z61vXUe1Vdaiwl9MefE'
})(SimpleMap);

export const mostRecentPoint = pointsObject => {
  let points = Array.from(pointsObject);
  return points.length == 0 ? null : points.sort(function(a,b){
      return new Date(b.date) - new Date(a.date);
    })[0];
}

const mapSlice = createSlice({
  name: 'map',
  initialState: {points : [],
                 fetchError : false,
                 mainLocationsFetched : false,
                 centre : { lat: 47.444, lng: -1.5, default : true},
                 centreSetKey : 0}, // Incrementing number to identify when to recentre the map
  reducers: {
    setMainLocationsFetched : (state, action) => {state.mainLocationsFetched = action.payload;},
    setFetchError : (state, action) => {state.fetchError = action.payload;},
    setNewCentre : (state, action) => {state.centre = action.payload; centreSetKeyCounter++; state.centreSetKey = centreSetKeyCounter;},
    mergePoints : (state, action) => {

      // Merge
      state.points = mergeByKey("id", state.points, action.payload);

      if(state.points.length == 0) return;

      // Identify most recent point
      let _mostRecentPoint = mostRecentPoint(state.points);

      // Mark all points
      state.points.forEach(p => {
        p.isMostRecent = p.id == _mostRecentPoint.id;
      });

      // Set map centre
      if(state.centre.default){
        state.centre = { lat: _mostRecentPoint.lat, lng: _mostRecentPoint.long, default:false};
        centreSetKeyCounter++;
        state.centreSetKey = centreSetKeyCounter;
      }
    }
  }
});

export const LocationMap = connect(// State -> Props (it gets all the slice state)
                                state => {return { points : state[mapSlice.name].points,
                                                   centre :  state[mapSlice.name].centre,
                                                   centreSetKey : state[mapSlice.name].centreSetKey }},
                                   // Dispatch -> Props
                                 {setNewCentre : mapSlice.actions.setNewCentre})(WrappedSimpleMapComponent)

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const sliceName = mapSlice.name;
