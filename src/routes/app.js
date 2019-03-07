import React from 'react'
import { Switch } from 'react-router-dom'

import AppContainer from 'src/containers/App'
import HomePage from 'src/containers/Home'
import RecognizePage from 'src/containers/Recognize'

import { PropsRoute } from 'src/components/PropsRoute'

const AppRoutes = props => {
  return (
    <AppContainer {...props}>
      <Switch>
        <PropsRoute path='/recognize' component={RecognizePage} {...props} />
        <PropsRoute exact path='/' component={HomePage} {...props} />
      </Switch>
    </AppContainer>
  )
}

export default AppRoutes
