import { useState } from "react"
import { EDIT_AUTHOR, ALL_AUTHORS } from "../queries"
import { useMutation } from "@apollo/client"
import Select from 'react-select';

const Authors = ( {authors, show} ) => {

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS } ],
    onError: (error) => {
      const messages = error.graphQLErrors[0].message
      console.log(messages)
    }
  })

  const [born, setBorn] = useState('')

  const options = authors.map(author => ({
    value: author.name,
    label: author.name
  }));

  const [selectedOption, setSelectedOption] = useState(null);


  if (!show) {
    return null
  }


  const submit = async (event) => {
    event.preventDefault()

    console.log('edit author...',selectedOption, born, authors)
    editAuthor({
      variables: {
        name: selectedOption.value,
        setBornTo: parseInt(born)
      }
    });
    setSelectedOption(null);
    setBorn('')
  }

  return (
    <div>
      <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <div>

     <h2>set birthyear</h2>
      <form onSubmit={submit}>
        {/* <div>
            name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div> */}
        <div className="select">
        <Select
          defaultValue={selectedOption}
          onChange={setSelectedOption}
          options={options}
        />
    </div>
        <div>
          born
          <input
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update Author</button>
      </form>
      </div>

    </div>
  )
}

export default Authors
