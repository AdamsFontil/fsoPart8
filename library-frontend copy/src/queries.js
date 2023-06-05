import { gql } from "@apollo/client"

const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    title
    published
    genres
    author {
      name
      born
      bookCount
    }
  }
`

export const ALL_AUTHORS = gql`
query {
  allAuthors {
    name
    born
    bookCount
  }
}
`
export const USER = gql`
query {
  me {
    username
    favoriteGenre
  }
}
`

export const ALL_BOOKS = gql`
query {
  allBooks {
    author {
      name
    }
    published
    title
    genres
  }
}
`
export const SPECIFIC_BOOKS = gql`
  query ($genre: String) {
    allBooks(genre: $genre) {
      author {
        name
      }
      published
      title
      genres
    }
  }
`;

export const ADD_BOOK = gql`
mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
  addBook(
    title: $title,
    author: $author,
    published: $published,
    genres: $genres
  ) {
    title
    published
    genres

  }
}
`
export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
    name
    born
    }
  }
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`
