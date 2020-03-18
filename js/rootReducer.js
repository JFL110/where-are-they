import { combineReducers } from 'redux'
import { mapReducer } from './features/map-leaflet'

export default combineReducers({
  map : mapReducer
})
