import React, { Component } from 'react'
import { ApolloProvider } from 'react-apollo'
import { Query } from 'react-apollo'
import client from './client.js'
import { ME } from './graphql'

class App extends Component {
  render () {
    return (
      <React.StrictMode>
        <ApolloProvider client={client}>
          <p>Hi</p>

          <Query query={ME}>
            {
              ({ loading, error, data }) => {
                if (loading) return 'Loading...'
                if (error) return `Error ${error.message}`

                return <div>{data.user.name}</div>
              }
            }

          </Query>
        </ApolloProvider>
      </React.StrictMode>
    )
  }
}

export default App;
