import React from 'react'
import { Component } from 'react';
import { LocationMap, mapActions } from './features/map'
import { TopBar } from './features/topBar'

// const endpointAddr ="http://127.0.0.1:3000/root";
const endpointAddr = "https://lfmezs1kca.execute-api.eu-west-2.amazonaws.com/default/MyLocation_Root_Handler";
export const App = () => (
 <div className="fullSize">
  <TopBar />
   <div id="mapOuterContainer">
      <LocationMap/>
   </div>
 </div>
)

export const onStoreCreated = store => {
  // Initial point load
  fetch(endpointAddr, {
  					method : 'GET',
  					headers : {"switch-destination" : "show-all-json" } })
  .then(response => response.json())
  .then(response => {
    if(response == null || response.locations == null || !Array.isArray(response.locations)){
      console.log("Invalid points ", points);
      return ;
    }
   var points = response.locations.map(i => {return {id : i.id,
                                                    lat : i.la,
                                                    long : i.lo,
                                                    altitude : i.al,
                                                    accuracy : i.ac,
                                                    type : i.ty,
                                                    title : i.ti == null ? "" : i.ti,
                                                    date : new Date(i.t).toString()};});
   store.dispatch(mapActions.mergePoints(points));
   store.dispatch(mapActions.setFetchError(false));
   store.dispatch(mapActions.setMainLocationsFetched(true));
  })
  .catch(err => {store.dispatch(mapActions.setFetchError(true)); console.log(err);});
}
