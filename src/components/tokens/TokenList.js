import { useEffect } from 'react'
import { getAllToken } from '@/app/actions/tokens/TokensCRUD'
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
			{/*<div className="relative overflow-x-auto shadow-md sm:rounded-lg">*/}
			{/*	<table className="w-full text-left text-sm text-slate-500">*/}
			{/*		<thead className="bg-slate-50 text-xs uppercase text-slate-700">*/}
			{/*			<tr>*/}
			{/*				<th scope="col" className="px-6 py-3">*/}
			{/*					Token Name*/}
			{/*				</th>*/}
			{/*				<th scope="col" className="px-6 py-3">*/}
			{/*					Created At*/}
			{/*				</th>*/}
			{/*				<th scope="col" className="px-6 py-3">*/}
			{/*					Expired At*/}
			{/*				</th>*/}
			{/*				<th scope="col" className="px-6 py-3">*/}
			{/*					Actions*/}
			{/*				</th>*/}
			{/*			</tr>*/}
			{/*		</thead>*/}
			{/*		<tbody>*/}
			{/*			{tokens &&*/}
			{/*				tokens.map((token, index) => (*/}
			{/*					<tr*/}
			{/*						key={token.id}*/}
			{/*						className="border-b bg-white hover:bg-slate-50"*/}
			{/*					>*/}
			{/*						<td className="px-6 py-4">{token.name}</td>*/}
			{/*						<td className="px-6 py-4">{token.createdAt.toString()}</td>*/}
			{/*						<td className="px-6 py-4">{token.expiredAt.toString()}</td>*/}
			{/*						<td className="px-6 py-4">*/}
			{/*							<button*/}
			{/*								onClick={() => handleDelete(token.id)}*/}
			{/*								className="rounded-lg bg-red-500 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700"*/}
			{/*							>*/}
			{/*								Delete*/}
			{/*							</button>*/}
			{/*						</td>*/}
			{/*					</tr>*/}
			{/*				))}*/}
			{/*		</tbody>*/}
			{/*	</table>*/}
			{/*</div>*/}
			<div className="w-full">
				<div className="sm:flex sm:items-center">
					<div className="sm:flex-auto">
						<p className="mt-2 text-sm text-slate-700">
							A list of all the tokens you have created. You can create a new
							token, and delete existing ones.
						</p>
					</div>
					<div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
						<button
							type="button"
							className="block rounded-md bg-forvoyez_orange-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-forvoyez_orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forvoyez_orange-600"
						>
							Add token
						</button>
					</div>
				</div>
				<div className="mt-8 flow-root">
					<div className="">
						<div className="flex min-w-full rounded-xl align-middle sm:px-6 lg:px-8">
							<div className="rounded-xl shadow-xl ring-1 ring-black ring-opacity-5">
								<table className="m-0 min-w-full divide-y divide-slate-300 rounded-xl">
									<thead className="bg-slate-50">
										<tr>
											<th
												scope="col"
												className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
											>
												Name
											</th>
											<th
												scope="col"
												className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
											>
												Title
											</th>
											<th
												scope="col"
												className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
											>
												Email
											</th>
											<th
												scope="col"
												className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900"
											>
												Role
											</th>
											<th
												scope="col"
												className="relative py-3.5 pl-3 pr-4 sm:pr-6"
											>
												<span className="sr-only">Edit</span>
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-200 bg-white">
										<tr>
											<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
												Lindsay Walton
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
												Front-end Developer
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
												lindsay.walton@example.com
											</td>
											<td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
												Member
											</td>
											<td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
												<a
													href="#"
													className="text-forvoyez_orange-600 hover:text-forvoyez_orange-900"
												>
													Edit<span className="sr-only">, Lindsay Walton</span>
												</a>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
