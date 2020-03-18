import React from 'react'
import { Component } from 'react';
import { LocationMap, mapActions } from './features/map-leaflet'
import { TopBar } from './features/topBar'


export const App = () => (
 <div className="fullSize">
  <TopBar />
  <LocationMap/>
 </div>
)
