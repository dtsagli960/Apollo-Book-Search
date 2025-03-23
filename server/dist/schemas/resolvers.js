import User from '../models/User.js';
import { AuthenticationError } from 'apollo-server-express';
import { signToken } from "../services/auth.js";
const resolvers = {
    Query: {
        me: async (_parent, _args, context) => {
            if (!context.user) {
                throw new AuthenticationError('Not logged in');
            }
            return await User.findById(context.user._id).populate('savedBooks');
        },
    },
    Mutation: {
        login: async (_parent, { email, password }) => {
            const user = await User.findOne({ email }).exec();
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        addUser: async (_parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        saveBook: async (_parent, { bookData }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in to save books');
            }
            const updatedUser = await User.findByIdAndUpdate(context.user._id, { $addToSet: { savedBooks: bookData } }, { new: true, runValidators: true }).populate('savedBooks');
            return updatedUser;
        },
        removeBook: async (_parent, { bookId }, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in to remove books');
            }
            const updatedUser = await User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true }).populate('savedBooks');
            return updatedUser;
        },
    },
    User: {
        bookCount: (parent) => parent.savedBooks.length,
    },
};
export { resolvers };
