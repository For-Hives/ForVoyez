// Lightweight mock for @clerk/nextjs used in unit tests (client-side exports)
// Tests that import `@clerk/nextjs` will get these named exports.

export const ClerkProvider = ({ children }) => children
export const SignIn = () => null
export const SignUp = () => null
export const UserProfile = () => null
export const SignedIn = ({ children }) => children
export const SignedOut = ({ children }) => children
export const SignInButton = () => null
export const UserButton = () => null
export const useAuth = () => ({ userId: null })
export const useUser = () => ({ user: null })

export default {
	ClerkProvider,
	SignInButton,
	UserProfile,
	UserButton,
	SignedOut,
	SignedIn,
	useAuth,
	useUser,
	SignIn,
	SignUp,
}
