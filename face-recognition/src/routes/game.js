import React from 'react'
import { Switch } from 'react-router-dom'

import GameSummaryPage from 'src/containers/Game/GameSummary'
import GameStepPage from 'src/containers/Game/GameStep'

import { PropsRoute } from 'src/components/PropsRoute'

const GameRoutes = props => {
  return (
    <Switch>
      <PropsRoute path='/game/step/:expression' component={GameStepPage} {...props} />
      <PropsRoute path='/game/summary' component={GameSummaryPage} {...props} />
    </Switch>
  )
}

export default GameRoutes
