import React from 'react'
import { render } from 'react-dom'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { App } from './app'
import { onStoreCreated } from './features/map-leaflet'
import rootReducer from './rootReducer'

const store = configureStore({
  reducer: rootReducer,
  middleware: [...getDefaultMiddleware()],
})

onStoreCreated(store);

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
