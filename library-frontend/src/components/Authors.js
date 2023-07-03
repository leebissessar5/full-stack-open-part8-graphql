import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import { useState } from "react";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [changeBirthYear] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const [ name, setName ] = useState("");
  const [ year, setYear ] = useState("");

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const authors = result.data.allAuthors;

  const submit = (event) => {
    event.preventDefault();

    changeBirthYear({ variables: { name, year: Number(year) } });

    setName("");
    setYear("");
  };

  return (
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
      {props.token && <form onSubmit={submit}>
        <h2>Set birthyear</h2>
        <label htmlFor="author-select">Choose an author:</label>
        <select
          name="authors"
          id="author-select"
          value={name}
          onChange={({ target }) => setName(target.value)}
        >
          {authors.map((author) => (
            <option key={author.name} value={author.name}>
              {author.name}
            </option>
          ))}
        </select>

        <div>
          born
          <input
            value={year}
            onChange={({ target }) => setYear(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>}
    </div>
  );
};

export default Authors;
