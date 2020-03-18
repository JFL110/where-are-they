import React from 'react'
import { Component } from 'react';
import { connect } from 'react-redux'
import timeSinceString from './timeSinceString'
import { mapActions , sliceName as mapSliceName } from './map-leaflet'

class TopBarComponent extends Component {
  render() {
      let pointsLoaded = this.props.mainLocationsFetched;
      let fetchError = this.props.fetchError || (this.props.mainLocationsFetched &&  this.props.points.length == 0);
      const _mostRecentPoint = this.props.points.find(p => p.isMostRecent);
      console.log(_mostRecentPoint);

      let centreMap = (() => {
        this.props.setNewCentre({ lat: _mostRecentPoint.lat , lng:  _mostRecentPoint.long, default : false});
      }).bind(this);

      let summary = (() => {
        return  <div onClick={centreMap}  className="clickToCentreButton"> <h2 className="appText">{"Updated " + timeSinceString(new Date(_mostRecentPoint.time)) + " ago"}</h2></div>;
      }).bind(this);

      return <div className="topBar">
      <div>
        <h2 className="appText">Where are they?</h2>
      </div>
      {fetchError || pointsLoaded ?  null : <div><div className="loader">Loading...</div></div>}
      {fetchError ?  (<div> <h2 className="appText">:( error - try refreshing</h2></div>) : (pointsLoaded ?  summary() : <div className="loadingText"> <h2 className="appText">Loading points </h2></div>)}

      </div>;
  }
}

export const TopBar = connect(state => {return { points : state[mapSliceName].points,
                                                 fetchError : state[mapSliceName].fetchError,
                                                 mainLocationsFetched : state[mapSliceName].mainLocationsFetched }},
                              {setNewCentre : mapActions.setNewCentre })(TopBarComponent);
