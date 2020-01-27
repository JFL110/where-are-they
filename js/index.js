import React from 'react'
import { render } from 'react-dom'
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import { App , onStoreCreated } from './app'
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
