import { combineReducers } from 'redux'
import { mapReducer } from './features/map'

export default combineReducers({
  map : mapReducer
})
