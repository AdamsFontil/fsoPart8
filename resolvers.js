const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      console.log('looking for BOOKS----')
      if (args.author) {
        let books = await Book.find().populate('author');
        return books.filter(book => book.author.name === args.author);
      } else if (args.genre) {
        return await Book.find({ genres: args.genre }).populate('author');
      } else {
        return await Book.find().populate('author');
      }
    },

    allAuthors: async () => {
      const authors = await Author.find({});
      const books = await Book.find().populate('author');

      return authors.map(author => {
        const bookCount = books.filter(book => book.author.name === author.name).length;
        return { ...author.toObject(), bookCount };
      });
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }
      try {
        const authorExists = await Author.findOne({ name: args.author });

        if (authorExists) {
          const book = new Book({ ...args, author: authorExists._id });
          await book.save();
          pubsub.publish('BOOK_ADDED', { bookAdded: book })
          return book;
        } else {
          const newAuthor = new Author({ name: args.author });
          await newAuthor.save();
          const book = new Book({ ...args, author: newAuthor._id });
          await book.save();
          pubsub.publish('BOOK_ADDED', { bookAdded: book })
          return book;
        }
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error,
          },
        });
      }
    },

    editAuthor: async (root, args, context) => {
      const author = await Author.findOne({ name: args.name });
      const currentUser = context.currentUser

      if (!currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'BAD_USER_INPUT',
          }
        })
      }

      if (!author) {
        return null;
      }
      author.born = args.setBornTo;
      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError('Editing author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author;
    },

    createUser: async (root, args) => {
      try {
        const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre });
        await user.save();
        return user;
      } catch (error) {
        if (error.code === 11000) {
          throw new UserInputError('Username already exists');
        } else {
          throw new ApolloError('Failed to create user');
        }
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
};

module.exports = resolvers
