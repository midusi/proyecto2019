import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as faceapi from 'face-api.js'

import {
  MODEL_URL,
} from 'src/config/recognition'
import DevTools from 'src/components/DevTools'

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({}, dispatch),
  }
}

class App extends Component {
  static async loadModels() {
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL)
    await faceapi.loadFaceExpressionModel(MODEL_URL)
    await faceapi.loadFaceLandmarkModel(MODEL_URL)
  }

  async componentDidMount() {
    await App.loadModels()
  }

  render() {
    const { children } = this.props

    return (
      <div style={{ height: '100%' }}>
        {React.cloneElement(children, {...this.props})}
        {process.env.NODE_ENV === 'development' && <DevTools />}
      </div>
    )
  }
}

App.propTypes = {
  children: PropTypes.node.isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
