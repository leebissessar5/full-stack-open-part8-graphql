import { useQuery } from "@apollo/client";
import { BOOKS_BY_GENRE } from "../queries";
import { useState, useEffect } from "react";

const Recommend = ({ show, user }) => {
  const filterByGenre = useQuery(BOOKS_BY_GENRE);
  const [books, setBooks] = useState([]);
  const [genre, setGenre] = useState(null);

useEffect(() => {
    const favoriteGenre = async (genre) => {
        const filtered = await filterByGenre.refetch({ genre });
        setBooks(filtered.data.allBooks);
    };
    if (user && user.favoriteGenre) {
        setGenre(user.favoriteGenre)
        void favoriteGenre(user.favoriteGenre);
    }
}, [filterByGenre, user]);

  if (!show) {
    return null;
  }

  return (
    <div>
      <h2>recommendations</h2>
      {genre && <div>books in your favorite genre <b>{genre}</b></div>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books && books.Length !==0 && books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
