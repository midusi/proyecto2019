import _ from 'underscore'
import React, { Component, Fragment } from 'react'
import { Redirect } from 'react-router-dom' 
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import Sound from 'react-sound'
import { Grid, Card, Image, Rating, Transition, Loader } from 'semantic-ui-react'

import { withWindowDimensions } from 'src/helpers/window-size'
import { supportedExpressions } from 'src/config/recognition'
import * as scoreActions from 'src/actions/score-actions'
import levelSuccess from 'src-static/sound/level-success.mp3'

const Player = ({player}) => !player ? null : (
  <Card
    style={{
      backgroundColor: 'transparent',
      boxShadow: 'none',
    }}
  >
    <Image src={player.image} fluid />
    <Card.Content style={{ position: 'absolute', bottom: 0, right: 0 }}>
      <Rating
        icon='star'
        size='massive'
        maxRating={5}
        rating={player.probability*5}
      />
    </Card.Content>
  </Card>
)

class GameSummaryPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      visible: false,
    }
  }

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

    this.setState({ visible: true })
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

    const { visible } = this.state

    if (_.isEmpty(scores)) {
      return <Loader />
    }

    const [first, second, third] = Array.from(scores || [])

    const expression = supportedExpressions.find(expr => expr.name === first.expression)

    if (!expression) {
      return <Redirect to='/game' />
    }

    void levelSuccess, Sound, trans, handleNextRound
    
    return (
      <Fragment>
        <div style={{ paddingTop: '6%' }}>
          <Grid columns={1 + Number(!!second)} padded centered>
            <Grid.Column width={16 / (1 + Number(!!second))}>
              <Player player={first} />
            </Grid.Column>
            {second && (
              <Grid.Column width={8}>
                <Grid.Row>
                  <Player player={second} />            
                </Grid.Row>
                <Grid.Row>
                  <Player player={third} />            
                </Grid.Row>
              </Grid.Column>
            )}
          </Grid>
        </div>
        <Transition animation='zoom' visible={visible} duration={500}>
          <center
            style={{
              position: 'absolute',
              top: 0,
              width: '100%',
              height: '100%',
              zIndex: 2001,
              overflowY: 'hidden',
            }}
          >
            <Image
              size='medium'
              src={expression.image}
              avatar
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: 0.653,
              }}
            />
          </center>
        </Transition>
      </Fragment>
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
