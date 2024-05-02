import { useEffect } from 'react'
import { getAllToken } from '@/components/tokens/TokensCRUD'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function TokenList({ tokens, setTokens }) {
	useEffect(() => {
		getAllToken().then(setTokens)
	}, [])

	// const handleDelete = async id => {
	// 	if (confirm('Are you sure you want to delete this token?')) {
	// 		await deleteToken(id)
	// 		setTokens(tokens.filter(token => token.id !== id))
	// 		toast.success('Token deleted successfully')
	// 	}
	// }

	return (
		<>
			<ToastContainer position="top-right" autoClose={3000} />
			<div className="relative overflow-x-auto shadow-md sm:rounded-lg">
				<table className="w-full text-left text-sm text-gray-500">
					<thead className="bg-gray-50 text-xs uppercase text-gray-700">
						<tr>
							<th scope="col" className="px-6 py-3">
								Token Name
							</th>
							<th scope="col" className="px-6 py-3">
								Created At
							</th>
							<th scope="col" className="px-6 py-3">
								Expired At
							</th>
							<th scope="col" className="px-6 py-3">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{tokens &&
							tokens.map((token, index) => (
								<tr
									key={token.id}
									className="border-b bg-white hover:bg-gray-50"
								>
									<td className="px-6 py-4">{token.name}</td>
									<td className="px-6 py-4">{token.createdAt.toString()}</td>
									<td className="px-6 py-4">{token.expiredAt.toString()}</td>
									<td className="px-6 py-4">
										<button
											onClick={() => handleDelete(token.id)}
											className="rounded-lg bg-red-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>
		</>
	)
}
