import { USER } from '../queries';
import { useQuery } from '@apollo/client';
import { SPECIFIC_BOOKS } from '../queries';

const Recommend = ({ show }) => {
  const userQuery = useQuery(USER);
  const specificBooksQuery = useQuery(SPECIFIC_BOOKS, {
    variables: {
      genre: userQuery.data?.me?.favoriteGenre || '',
    },
    onError: (error) => {
      console.log('error----', error);
    }
  });

  if (!show) {
    return null;
  }

  if (userQuery.loading || specificBooksQuery.loading) {
    return <div>Loading...</div>;
  }

  const favoriteGenre = userQuery.data?.me?.favoriteGenre || '';
  const specificBooks = specificBooksQuery.data?.allBooks || [];

  if (specificBooks.length === 0) {
    return (
      <div>
        <h2>Recommendations</h2>
        <p>Your favorite genre is {favoriteGenre}</p>
        <div>Sorry, we don't have any books to recommend.</div>
      </div>
    );
  }

  console.log('user---', userQuery.data)

  return (
    <div>
      <h2>Recommendations</h2>
      <p>Your favorite genre is {favoriteGenre}</p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>Author</th>
            <th>Published</th>
          </tr>
          {specificBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
