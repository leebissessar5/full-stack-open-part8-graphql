const { ApolloServer } = require('@apollo/server');
require("dotenv").config();
const { startStandaloneServer } = require("@apollo/server/standalone");

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const MONGODB_URI = process.env.MONGODB_URI;

const Author = require('./models/author')
const Book = require('./models/book');

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connection to MongoDB:", error.message);
  });

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    bookCount: Int
    born: Int
    id: ID!
  }

  type Query {
    allAuthors: [Author!]!
    allBooks(author: String, genre: String): [Book!]!
    authorCount: Int!
    bookCount: Int!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book!
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate("author");
      return authors.map(author => ({
        name: author.name,
        bookCount: books.filter(book => book.author.name === author.name).length,
        born: author.born,
        id: author._id
      }))
    },
    allBooks: async (root, args) => {
      let query = {};

      if (args.author) {
        const author = await Author.findOne({ name: args.author });
        if (!author) {
          return []
        }
        query.author = author._id;
      }
      if (args.genre) {
        query.genres = { $in: [args.genre] };
      }

      const books = await Book.find(query).populate('author');
      return books;
    },
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments()
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author, born: null })
        const authorValidationErrors = author.validateSync();
        if (authorValidationErrors) {
          throw new Error("Author validation failed");
        }
        await author.save()
      }
      const book = new Book({
        author,
        title: args.title,
        published: args.published,
        genres: args.genres,
      });
      const bookValidationErrors = book.validateSync();
      if (bookValidationErrors) {
        throw new Error("book validation failed");
      }
      await book.save();
      return book
    },
    editAuthor: async (root, args) => {
      const { name, setBornTo } = args
      const filter = { name: name };
      const author = await Author.findOne(filter)
      await Author.updateOne(filter,
        {
          $set: {
            ...author.document,
            born: setBornTo,
          },
        },
        {}
      );
      const updated = await Author.findOne(filter);
      const books = await Book.find({}).populate("author");
      updated.bookCount = books.filter((book) => book.author.name === updated.name).length
      return updated
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
