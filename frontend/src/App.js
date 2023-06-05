import { useQuery, useApolloClient, useSubscription} from '@apollo/client'
import { useState, useEffect } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'

export const updateCache = (cache, query, addedBook) => {
  // helper that is used to eliminate saving the same book twice
  const uniqByTitle = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    console.log('updating cache', allBooks)
    console.log('new book---', addedBook)

    const updatedBooks = uniqByTitle(allBooks.concat(addedBook))
    console.log('new allBooks', updatedBooks)

    return {
      allBooks: updatedBooks,
    }
  })
}



const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const authors = useQuery(ALL_AUTHORS)
  const books = useQuery(ALL_BOOKS)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      console.log(`${addedBook.title} added`)

      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
    }
  })



  useEffect(() => {
    const storedToken = localStorage.getItem('library-user-token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const user = token

  if (authors.loading)  {
    return <div>loading authors...</div>
  }
  if (books.loading) {
    return <div>loading books...</div>
  }
  console.log('AUTHORS---', authors.data)
  console.log('BOOKS---', books.data)


  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  const allBooks = books.data.allBooks

  const uniqueGenres = [];
  allBooks.forEach(book => {
  book.genres.forEach(genre => {
    if (!uniqueGenres.includes(genre)) {
      uniqueGenres.push(genre);
    }
  });
});

const genreButtons = uniqueGenres.map(genre => (
  <button key={genre} onClick={() => handleGenreClick(genre)} style={{ border: genre === selectedGenre ? '2px solid black' : 'none' }}>
    {genre}
  </button>
));


const handleGenreClick = (genre) => {
  console.log('testing genre---',genre);
  setSelectedGenre(genre);
};


  if (!token) {
    return (
      <div>
        <button onClick={() => setPage('authors')}>Authors</button>
        <button onClick={() => setPage('books')}>Books</button>
        <button onClick={() => setPage('login')}>Login</button>
      <Authors authors={authors.data.allAuthors} show={page === 'authors'} />
      <Books books={books.data.allBooks} genreButtons={genreButtons} selectedGenre={selectedGenre} show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <LoginForm setToken={setToken} show={page === 'login'} />
      </div>
    );
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommend')}>recommendations</button>
        <button onClick={handleLogout}>logout</button>
      </div>
      <Authors authors={authors.data.allAuthors} show={page === 'authors'} />
      <Books books={books.data.allBooks} genreButtons={genreButtons} selectedGenre={selectedGenre} show={page === 'books'} />
      <NewBook show={page === 'add'} />
      <LoginForm setToken={setToken} show={page === 'login'} />
      <Recommend user={user} books={books.data.allBooks} show={page === 'recommend'} />
    </div>
  )
}

export default App
