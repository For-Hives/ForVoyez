export const metadata = {
	description:
		"View ForVoyez's legal notice and company information. Find details about our business registration, contact information, and regulatory compliance.",
	alternates: {
		canonical: '/app/legals/legal-notice',
	},
	title: 'Legal Notice',
}

export default function LegalNoticePage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto px-6">
			<h1 className="mb-8 text-3xl font-bold text-slate-800">Legal Notice</h1>

			<p className="mt-1 text-sm text-slate-600">
				ForVoyez, a SaaS operated by the auto-entreprise Cinquin Andy
			</p>

			<p className="mt-4 text-sm text-slate-600">
				<strong>SIRET</strong>: 880 505 276 00019
				<br />
				<strong>Registered office</strong>: 4 Impasse de la marchaisière, 44115,
				France
				<br />
				<strong>VAT number</strong>: FR 35 880505276
				<br />
				<strong>Director of publication</strong>: Andy Cinquin
				<br />
				<strong>Hosted by</strong>: Contabo GmbH, Aschauer Straße 32a, 81549
				Munich, Germany
			</p>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">Address</h2>
				<p className="mt-1 text-sm text-slate-600">
					72 Avenue Camus
					<br />
					44000, Nantes
					<br />
					France
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">Contact</h2>
				<p className="mt-1 text-sm text-slate-600">
					<a
						className="text-forvoyez_orange-600 hover:text-forvoyez_orange-500"
						href="mailto:contact@forvoyez.com"
					>
						contact@forvoyez.com
					</a>
					<br />
					+33 (0)6 21 58 26 84
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">Abuse</h2>
				<p className="mt-1 text-sm text-slate-600">
					To report contentious content or if you are a victim of fraudulent use
					of a ForVoyez service, please contact us via the{' '}
					<a
						className="text-forvoyez_orange-600 hover:text-forvoyez_orange-500"
						href="mailto:contact@forvoyez.com"
					>
						contact@forvoyez.com
					</a>{' '}
					email.
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">
					Intellectual Property
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					This website and all its contents (including data, information,
					photos, logos, and trademarks) are the exclusive property of ForVoyez
					or its partners. Any reproduction, representation, translation,
					adaptation, or quotation, in whole or in part, whatever the process or
					medium, is strictly prohibited except as provided by law or expressly
					authorized by their owner. Photos are not contractual.
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">
					Personal Data
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					You can visit our website on the Internet without having to disclose
					your identity or to provide any personal information about yourself.
					However, we may sometimes request information to process an order,
					identify a support request, establish correspondences, provide a
					subscription, or apply for a position.
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">
					Notice and Procedure for Making Claims of Copyright Infringement
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					If you believe that your work has been copied in a way that
					constitutes copyright infringement, please provide our copyright agent
					the written information specified below. Please note that this
					procedure is exclusively for notifying ForVoyez that your copyrighted
					material has been infringed.
				</p>
				<ul className="mt-4 list-disc pl-6 text-sm text-slate-600">
					<li>
						An electronic or physical signature of the person authorized to act
						on behalf of the owner of the copyright interest;
					</li>
					<li>
						A description of the copyrighted work that you claim has been
						infringed upon;
					</li>
					<li>
						A description of where the material that you claim is infringing is
						located on the Site;
					</li>
					<li>Your address, telephone number, and e-mail address;</li>
					<li>
						A statement by you that you have a good-faith belief that the
						disputed use is not authorized by the copyright owner, its agent, or
						the law;
					</li>
					<li>
						{`A statement by you, made under penalty of perjury, that the above
							information in your notice is accurate and that you are the
							copyright owner or authorized to act on the copyright owner's
							behalf.`}
					</li>
				</ul>
				<p className="mt-4 text-sm text-slate-600">
					{`ForVoyez's Copyright Agent for notice of claims of copyright
						infringement can be reached as follows:`}
				</p>
				<p className="mt-4 text-sm text-slate-600">
					E-mail:{' '}
					<a
						className="text-forvoyez_orange-600 hover:text-forvoyez_orange-500"
						href="mailto:contact@forvoyez.com?subject=Abuse"
					>
						contact@forvoyez.com
					</a>
				</p>
				<p className="mt-4 text-sm text-slate-600">
					Courier address:
					<br />
					Copyright Agent/ForVoyez
					<br />
					ForVoyez Legal Department
					<br />
					4 Impasse de la marchaisière
					<br />
					44115, France
					<br />
					France
				</p>
			</section>

			<section>
				<h2 className="mb-4 mt-8 text-2xl font-bold text-slate-800">Update</h2>
				<p className="mt-1 text-sm text-slate-600">
					Should we update, amend, or make any changes to this document, those
					changes will be prominently posted here.
				</p>
			</section>
		</div>
	)
}
