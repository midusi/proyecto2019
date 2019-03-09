import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Webcam from 'react-webcam'
import { Container, Divider, Button } from 'semantic-ui-react'

const HomeContainer = props => {
  const {
    trans,
  } = props

  return (
    <Container textAlign='center'>
      <Webcam />
      <Divider hidden />
      <Button color='blue' as={Link} to='/recognize'>
        { trans('home:option.recognize') }
      </Button>
    </Container>
  )
}

HomeContainer.propTypes = {
  trans: PropTypes.func.isRequired,
}

export default HomeContainer
