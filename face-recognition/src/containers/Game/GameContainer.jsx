import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Modal, Icon, Image, Header, Button, Rating } from 'semantic-ui-react'

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
    const { expressions } = this.state
    const {
      history,
    } = this.props

    if (_.isEmpty(expressions)) {
      history.push('/game/summary')
    }

    this.setState(state => {
      const { expressions } = state

      return {
        expressions: expressions.slice(1),
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

    onScoreFormFieldChange('expression', expression)
    onScoreFormFieldChange('probability', probability)
    onScoreFormFieldChange('image', image)

    addScore()
  }

  render() {
    const {
      t,
      trans,
      history,
      score: {
        form: {
          fields: {
            image,
            expression,
            probability,
          }
        }
      },
    } = this.props

    return (
      <Fragment>
        <GameRoutes
          t={t}
          trans={trans}
          history={history}
          handleRecognition={this.handleRecognition}
        />
        <Modal dimmer='blurring' open={!!image}>
          <Modal.Header>{trans('recognize:winner')}</Modal.Header>
          <Modal.Content image>
            <Image wrapped size='medium' src={image} />
            <Modal.Description>
              <Header>{expression}</Header>
              <Rating
                icon='star'
                size='massive'
                maxRating={5}
                defaultRating={probability*5}
                rating={probability*5}
              />
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='blue' onClick={this.handleNextStep}>
              {trans('recognize:options.next')}
              <Icon name='chevron right' />
            </Button>
          </Modal.Actions>
        </Modal>
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
