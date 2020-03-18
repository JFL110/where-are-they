import React from 'react'
import { Component } from 'react';
import { LocationMap, mapActions } from './features/map-leaflet'
import { TopBar } from './features/topBar'

const jsonFileAddr = "https://jfl110-my-location.s3.eu-west-2.amazonaws.com/my-location-points.json";
export const App = () => (
 <div className="fullSize">
  <TopBar />
  <LocationMap/>
 </div>
)
