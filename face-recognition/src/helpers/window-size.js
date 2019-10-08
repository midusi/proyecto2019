import React, { useEffect, useState, Component } from 'react'

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window
  return {
    width,
    height
  }
}

export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  )

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowDimensions
}

export const withWindowDimensions = WrappedComponent => {
  return class WindowDimensions extends Component {
    constructor(props) {
      super(props)

      this.state = { width: 0, height: 0 }

      this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
    }

    componentDidMount() {
      this.updateWindowDimensions()
      window.addEventListener('resize', this.updateWindowDimensions)
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateWindowDimensions)
    }

    updateWindowDimensions() {
      this.setState({ width: window.innerWidth, height: window.innerHeight })
    }

    render() {
      const { width, height } = this.state

      void width, height

      return (
        <WrappedComponent
          {...this.props}
          windowWidth={1920}
          windowHeight={1080}
          isMobileSized={width < 700}
        />
      )
    }
  }
}
