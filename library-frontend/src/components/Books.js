import { useQuery } from "@apollo/client";
import { ALL_BOOKS, BOOKS_BY_GENRE } from "../queries";
import { useState, useEffect } from "react";

const Books = (props) => {
  const result = useQuery(ALL_BOOKS);
  const filterByGenre = useQuery(BOOKS_BY_GENRE);
  const [books, setBooks] = useState([]);
  const [uniqueGenres, setUniqueGenres] = useState([]);

  useEffect(() => {
    if (result.data && !result.loading) {
      setBooks(result.data.allBooks);
      setUniqueGenres([
        ...new Set(result.data.allBooks.flatMap((book) => book.genres)),
      ]);
    }
  }, [result.data, result.loading]);

  if (!props.show) {
    return null;
  }

  if (result.loading) {
    return <div>loading...</div>;
  }

  const selectedGenre = async (genre) => {
    const filtered = await filterByGenre.refetch({ genre });
    setBooks(filtered.data.allBooks)
  };

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
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {uniqueGenres.map((genre) => (
          <button key={genre} onClick={() => selectedGenre(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={async () => {
          await result.refetch()
          setBooks(result.data.allBooks)
          }}>all genres</button>
      </div>
    </div>
  );
};

export default Books;
