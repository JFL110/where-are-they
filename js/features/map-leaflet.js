import React, { useState }  from 'react'
import { Component } from 'react';
import { createSlice } from '@reduxjs/toolkit'
import { connect } from 'react-redux'
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import mergeByKey from "array-merge-by-key";
import timeSinceString from './timeSinceString'
import Carousel, { Modal, ModalGateway } from 'react-images';
import Control from 'react-leaflet-control';

const initialViewportObject = {};
const jsonFileAddr = "https://jfl110-my-location.s3.eu-west-2.amazonaws.com/my-location-points.json";
// const jsonFileAddr = "./dist/testing-points.json";

const mostRecentPointMarkerIcon = "./map-icons/icon_red.png";
const mapCss = {
  width: '100%',
  height: '100%',
};

function pointToCentre(point){
  return { lat: point.lat, lng: point.long, default:false};
}

const SimpleMap = ({centre, points, viewportObject, currentLightBoxImageIndex, setCurrentLightBoxImageIndex, setNewCentre, lastNonNullLightBoxImageIndex}) => {
    // Markers
    // const singleAutoPointMarkerIcon  = this._circleMarker("blue");
    // const singleManualPointMarkerIcon = this._circleMarker("red");
    const redDotIcon = L.divIcon({className: 'red-dot-marker'});
    const blueDotIcon = L.divIcon({className: 'blue-dot-marker'});
    const photoIcon = L.icon({
     iconUrl : 'camera-icon.png',
     iconSize:     [40, 40],
     iconAnchor:   [20, 20],
    });

    const onCentreToMostRecentLocation = () => {
      let _mostRecentPoint = points.find(p => p.isMostRecent);
      if(_mostRecentPoint != null){
        setNewCentre(pointToCentre(_mostRecentPoint));
      }
    };

    const photoUrls = points.filter(p => p.isPhoto).map(p => ({src :p.url}));
    const onModalClose = () => {setCurrentLightBoxImageIndex(null);};

    const setCentreToPhotoId = i => {
      setCurrentLightBoxImageIndex(i);
      let _imagePoint =  points.find(p => p.isPhoto && p.photoPointId == i);
      if(_imagePoint != null){
        setNewCentre(pointToCentre(_imagePoint));
      }
    };

    const onClickPhotoMarker = (point) => {
      setCurrentLightBoxImageIndex(point.photoPointId);
      setNewCentre(pointToCentre(point));
    }

    const onClickOpenPhotosControl = () => {
      if(lastNonNullLightBoxImageIndex == null){
        // Goto most recent
        let sortedPhotos = points.filter(p => p.isPhoto && p.time != null).sort((a, b) => b.time - a.time);
        if(sortedPhotos.length > 0){
          setCurrentLightBoxImageIndex(sortedPhotos[0].photoPointId);
          setNewCentre(pointToCentre(sortedPhotos[0]));
        }
      } else {
        setCentreToPhotoId(lastNonNullLightBoxImageIndex);
      }
    };

    return (
      <React.Fragment>
        {photoUrls.length > 0 && currentLightBoxImageIndex != null ? <ModalGateway>
          <Modal
          onClose={onModalClose}
          styles={{
               blanket: base => ({
                 ...base,
                 backgroundColor: 'rgba(0,0,0,0.4)',
               }),
             }}>
            <Carousel
            views={photoUrls}
            currentIndex={currentLightBoxImageIndex}
            trackProps={{
              onViewChange : setCentreToPhotoId
            }}
            />
          </Modal>
        </ModalGateway> : null}


        <LeafletMap
        center={[ centre.lat, centre.lng]}
        {...(initialViewportObject == viewportObject ? {zoom:10} : {})}
        minZoom={2}
        maxZoom={14}
        attributionControl={true}
        zoomControl={true}
        doubleClickZoom={true}
        scrollWheelZoom={true}
        dragging={true}
        animate={true}
        easeLinearity={0.35}
        viewport={viewportObject}
       >

       <Control position="topleft" className="leaflet-control-zoom leaflet-bar" >
        <a className="leaflet-control-zoom-in zoom-circle" href="#" onClick={onCentreToMostRecentLocation} title="Centre to most recent location"></a>
       </Control>
       <Control position="topleft" className="leaflet-control-zoom leaflet-bar" >
        <a className="leaflet-control-zoom-in" href="#" onClick={onClickOpenPhotosControl} title="Open photos">
          <img src="camera-icon.png" style={{width:"100%"}}/></a>
       </Control>
       <TileLayer
          url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {
          points.map(p =>   <Marker
            key={p.id}
            position={[p.lat, p.long]}
            icon={p.isPhoto ? photoIcon : (p.isMostRecent ? redDotIcon : blueDotIcon)}
            {...(p.isMostRecent ? {zIndexOffset : 1000} : {})}
            {...(p.isPhoto ? {onClick : () => onClickPhotoMarker(p)} : {})}
            />)
        }
       </LeafletMap>
    </React.Fragment>
  );
}
/* */
const mapSlice = createSlice({
  name: 'map',
  initialState: {points : [],
                 fetchError : false,
                 mainLocationsFetched : false,
                 centre : { lat: 47.444, lng: -1.5, default : true},
                 viewportObject : initialViewportObject,
                 currentLightBoxImageIndex : null,
                 lastNonNullLightBoxImageIndex : null},
  reducers: {
    setCurrentLightBoxImageIndex : (state, action) => {state.currentLightBoxImageIndex = action.payload; if(action.payload != null){state.lastNonNullLightBoxImageIndex = action.payload;}},
    setMainLocationsFetched : (state, action) => {state.mainLocationsFetched = action.payload;},
    setFetchError : (state, action) => {state.fetchError = action.payload;},
    setNewCentre : (state, action) => {state.centre = action.payload; state.viewportObject = {};},
    mergePoints : (state, action) => {

      // Merge
      state.points = mergeByKey("id", state.points, action.payload);

      if(state.points.length == 0) return;

      // Mark all points
      let _mostRecentPoint = state.points.find(p => p.isMostRecent);

      // Set map centre
      if(state.centre.default){
        state.centre = pointToCentre(_mostRecentPoint);
        state.viewportObject = initialViewportObject;
      }
    }
  }
});

export const LocationMap = connect(// State -> Props (it gets all the slice state)
                                state => ({ points : state[mapSlice.name].points,
                                                   centre :  state[mapSlice.name].centre,
                                                   viewportObject : state[mapSlice.name].viewportObject,
                                                   currentLightBoxImageIndex :  state[mapSlice.name].currentLightBoxImageIndex,
                                                   lastNonNullLightBoxImageIndex : state[mapSlice.name].lastNonNullLightBoxImageIndex}),
                                   // Dispatch -> Props
                                 {setNewCentre : mapSlice.actions.setNewCentre,
                                  setCurrentLightBoxImageIndex : mapSlice.actions.setCurrentLightBoxImageIndex})(SimpleMap)

export const mapReducer = mapSlice.reducer;
export const mapActions = mapSlice.actions;
export const sliceName = mapSlice.name;

export const onStoreCreated = store => {
  // Initial point load
  fetch(jsonFileAddr, {	method : 'GET' /*, mode: 'no-cors' */})
  .then(response => response.json())
  .then(response => {
    if(response == null || response.points == null || !Array.isArray(response.points)){
      console.log("Invalid points ", response)
      return ;
    }
   var points = response.points.map(i => ({id : i.l + "-" + i.g,
                                          lat : i.l,
                                          long : i.g,
                                          isPhoto : false,
                                          isMostRecent : false}));
   if(response.mostRecentPoint != null){
     points.push({id : response.mostRecentPoint.l + "-" + response.mostRecentPoint.g,
                  lat : response.mostRecentPoint.l,
                  long :response.mostRecentPoint.g,
                  isPhoto : false,
                  time : response.mostRecentPointTime,
                  isMostRecent : true});
  }

   if(response.photos != null && Array.isArray(response.photos)){
     var photoPointId = 0;
     points.push(...(response.photos.map(i => ({id : i.url,
                                            lat : i.point.l,
                                            long : i.point.g,
                                            time : i.time,
                                            url : i.url,
                                            isPhoto : true,
                                            photoPointId: photoPointId++,
                                            isMostRecent : false}))));
   }

   store.dispatch(mapActions.mergePoints(points));
   store.dispatch(mapActions.setFetchError(false));
   store.dispatch(mapActions.setMainLocationsFetched(true));
  })
  .catch(err => {store.dispatch(mapActions.setFetchError(true)); console.log(err);});
}
