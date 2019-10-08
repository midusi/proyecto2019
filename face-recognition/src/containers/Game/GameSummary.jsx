import _ from 'underscore'
import React, { Component } from 'react'
import { Redirect } from 'react-router-dom' 
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Sound from 'react-sound'

import { withWindowDimensions } from 'src/helpers/window-size'
import * as scoreActions from 'src/actions/score-actions'
import levelSuccess from 'src-static/sound/level-success.mp3'

class GameSummaryPage extends Component {
  componentDidMount() {
    const {
      setPictureHandler,
      setActive,
      actions: {
        onScoreFormClear,
        getScores,
      }
    } = this.props

    setActive('summary')
    setPictureHandler(() => null)
    onScoreFormClear()
    getScores()
  }

  render() {
    const {
      handleNextRound,
      trans,
      score: {
        collections: {
          scores,
        }
      },
    } = this.props

    void levelSuccess, Sound

    if (!_.isNull(scores) && _.isEmpty(scores)) {
      return <Redirect to="/game" />
    }

    const arrayedScores = Array.from(scores || [])

    return (
      null
    )
  }  
}

GameSummaryPage.propTypes = {
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

export default withWindowDimensions(connect(mapStateToProps, mapDispatchToProps)(GameSummaryPage))
