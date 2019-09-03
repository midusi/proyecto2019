import React from 'react'
import { Switch } from 'react-router-dom'

// import GameOverPage from 'src/containers/Game/GameOver'
import GameStepPage from 'src/containers/Game/GameStep'

import { PropsRoute } from 'src/components/PropsRoute'

const GameRoutes = props => {
  return (
    <Switch>
      <PropsRoute path='/game/step/:expression' component={GameStepPage} {...props} />
      {/*<PropsRoute path='/game/finish' component={GameOverPage} {...props} />*/}
    </Switch>
  )
}

export default GameRoutes
