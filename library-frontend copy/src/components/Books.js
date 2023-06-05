import { SPECIFIC_BOOKS } from "../queries";
import { useQuery } from "@apollo/client";
const Books = ( { books, show, genreButtons, selectedGenre } ) => {
  const genre = selectedGenre
   const specificBooks = useQuery(SPECIFIC_BOOKS, {
    variables: {
      genre,
    },
    onError: (error) => {
      console.log('error----', error)
    }
  });

  if (specificBooks.loading) {
    return <div>loading specific books...</div>
  }

  if (!show) {
    return null
  }

  const specific = specificBooks.data.allBooks
  console.log('genre from books---', selectedGenre)
  const filteredBooks = selectedGenre ? books.filter(book => book.genres.includes(selectedGenre)) : books;


  console.log('Specific books:', specific); // Process the retrieved data as needed


  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genreButtons}
    </div>
  )
}

export default Books
