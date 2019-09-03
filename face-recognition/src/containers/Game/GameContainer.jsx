import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import GameRoutes from 'src/routes/game'
import { supportedExpressions as expressions } from 'src/config/recognition'
import * as scoreActions from 'src/actions/score-actions'

class GamePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      expressions: _.shuffle(expressions),
    }

    this.handleNextStep = this.handleNextStep.bind(this)
    this.handleRecognition = this.handleRecognition.bind(this)
  }

  componentDidMount() {
    const {
      actions: {
        onScoreFormClear,
        getScores,
      }
    } = this.props

    onScoreFormClear()
    getScores()
  }

  handleNextStep() {
    this.setState(state => {
      const { expressions } = state

      return {
        expressions: expressions.slice(1)
      }
    })
  }

  handleRecognition(expression, image, probability) {
    const {
      actions: {
        onScoreFormFieldChange,
        addScore,
      }
    } = this.props

    console.log(expression)

    onScoreFormFieldChange('expression', expression)
    onScoreFormFieldChange('probability', probability)
    onScoreFormFieldChange('image', image)

    addScore()
  }

  render() {
    const { t, trans } = this.props

    return (
      <Fragment>
        <GameRoutes
          t={t}
          trans={trans}
          handleNextStep={this.handleNextStep}
          handleRecognition={this.handleRecognition}
        />
      </Fragment>
    )
  }  
}

GamePage.propTypes = {
  t: PropTypes.func.isRequired,
  trans: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  const { score } = state

  return {
    score
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      ...scoreActions,
    }, dispatch),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GamePage)
