import React, { Component } from 'react'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client.js'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

const StarButton = props => {
  console.log(props)
  const node = props.node;
  // props.viewerHasStarred
  const totalCount = node.stargazers.totalCount
  const viewerHasStarred = node.viewerHasStarred
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
  const StarStatus = ({addOrRemoveStar}) => {
    return (
      <button
        onClick={
          () => addOrRemoveStar({
              variables: { input: { starrableId: node.id }}
            })
          }
      >
        {starCount} | { viewerHasStarred ? 'stared' : '-' }
      </button>
    )
  }

  return (
    <Mutation mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}>
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar}/>
      }
    </Mutation>
  )
}

const PER_PAGE = 5
const DEFAULT_STATE = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア"
};

class App extends Component {
  constructor(props) {
    super(props)
    this.state = DEFAULT_STATE

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    this.setState({
      ...DEFAULT_STATE,
      query: event.target.value
    })
  }

  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
    })
  }

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    })
  }

  render () {
    const { query, first, last, before, after } = this.state
    return (
      <React.StrictMode>
        <ApolloProvider client={client}>
          <form onSubmit={this.handleSubmit}>
            <input value={query} onChange={this.handleChange}></input>
          </form>
          <Query
            query={SEARCH_REPOSITORIES}
            variables={{query, first, last, before, after}}
          >
            {
              ({ loading, error, data }) => {
                if (loading) return 'Loading...'
                if (error) return `Error ${error.message}`

              const search = data.search
              const repositoryCount = search.repositoryCount
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
              const title = `Github Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
              return (
                <React.Fragment>
                  <div>{title}</div>
                  <ul>
                    {
                      search.edges.map(edge => {
                        const node = edge.node

                        return (
                          <li key={node.id}>
                            <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                            <StarButton node={node}></StarButton>
                          </li>
                        )
                      })
                    }
                  </ul>


                  {
                    search.pageInfo.hasPreviousPage === true ?
                    <button
                      onClick={this.goPrevious.bind(this, search)}
                    >
                      Previous
                    </button>
                    :
                    null
                  }

                  {
                    search.pageInfo.hasNextPage === true ?
                    <button
                      onClick={this.goNext.bind(this, search)}
                    >
                      Next
                    </button>
                    :
                    null
                  }

                </React.Fragment>
              )
              }
            }

          </Query>
        </ApolloProvider>
      </React.StrictMode>
    )
  }
}

export default App;
