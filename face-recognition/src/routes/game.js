import React, { Component } from 'react'
import { Switch } from 'react-router-dom'

import GameSummaryPage from 'src/containers/Game/GameSummary'
import GameStepPage from 'src/containers/Game/GameStep'

import { PropsRoute } from 'src/components/PropsRoute'

class GameStart extends Component {
  componentDidMount() {
    const { handleNextStep } = this.props

    handleNextStep(true, false)
  }

  render() {
    return null
  }
}

const GameRoutes = props => {
  return (
    <Switch>
      <PropsRoute exact path='/game' component={GameStart} {...props} />
      <PropsRoute path='/game/step/:expression' component={GameStepPage} {...props} />
      <PropsRoute path='/game/summary' component={GameSummaryPage} {...props} />
    </Switch>
  )
}

export default GameRoutes
