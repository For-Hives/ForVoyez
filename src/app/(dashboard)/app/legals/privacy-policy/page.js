export const metadata = {
	description:
		'Learn how ForVoyez handles your data. Our privacy policy outlines our data collection, usage, and protection practices.',
	alternates: {
		canonical: '/app/legals/privacy-policy',
	},
	title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto px-6">
			<h1 className="mb-8 text-3xl font-bold text-slate-800">
				Privacy Policy of ForVoyez
			</h1>

			<p className="mt-1 text-sm text-slate-600">
				{`ForVoyez("ForVoyez", "we", "our" or "us") operates several websites
                    including forvoyez.com and related subdomains. It is ForVoyez's policy
                    to respect your privacy regarding any information we may collect while
                    operating our websites.`}
			</p>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Website Visitors
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					{`Like most website operators, ForVoyez collects
						non-personally-identifying information of the sort that web browsers
						and servers typically make available, such as the browser type,
						language preference, referring site, and the date and time of each
						visitor request. ForVoyez's purpose in collecting non-personally
						identifying information is to better understand how ForVoyez's
						visitors use its website. From time to time, ForVoyez may release
						non-personally-identifying information in the aggregate, e.g., by
						publishing a report on trends in the usage of its website.`}
				</p>
				<p className="mt-4 text-sm text-slate-600">
					ForVoyez also collects potentially personally-identifying information
					like Internet Protocol (IP) addresses for logged-in users. ForVoyez
					only discloses logged-in user IP addresses under the same
					circumstances that it uses and discloses personally-identifying
					information as described below.
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Gathering of Personally-Identifying Information
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					{`Certain visitors to ForVoyez's websites choose to interact with
						ForVoyez in ways that require ForVoyez to gather
						personally-identifying information. The amount and type of information
						that ForVoyez gathers depend on the nature of the interaction. For
						example, we ask visitors who sign up for an account at forvoyez.com to
						provide an email address and a password, or to sign in with Google or
						GitHub, and they may add a first and last name. Those who engage in
						transactions with ForVoyez – by purchasing access to the ForVoyez paid
						service, for example – are asked to provide additional information,
						including as necessary the personal and financial information required
						to process those transactions. In each case, ForVoyez collects such
						information only insofar as is necessary or appropriate to fulfill the
						purpose of the visitor's interaction with ForVoyez. ForVoyez does not
						disclose personally-identifying information other than as described
						below. And visitors can always refuse to supply personally-identifying
						information, with the caveat that it may prevent them from engaging in
						certain website-related activities.`}
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Aggregated Statistics
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					ForVoyez may collect statistics about the behavior of visitors to its
					websites. ForVoyez may display this information publicly or provide it
					to others. However, ForVoyez does not disclose personally-identifying
					information other than as described below.
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Protection of Certain Personally-Identifying Information
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					{`ForVoyez discloses potentially personally-identifying and
						personally-identifying information only to those of its employees,
						contractors, and affiliated organizations that (i) need to know that
						information in order to process it on ForVoyez's behalf or to provide
						services available at ForVoyez's websites, and (ii) that have agreed
						not to disclose it to others. Some of those employees, contractors,
						and affiliated organizations may be located outside of your home
						country; by using ForVoyez's websites, you consent to the transfer of
						such information to them. ForVoyez will not rent or sell potentially
						personally-identifying and personally-identifying information to
						anyone. Other than to its employees, contractors, and affiliated
						organizations, as described above, ForVoyez discloses potentially
						personally-identifying and personally-identifying information only in
						response to a subpoena, court order, or other governmental requests,
						or when ForVoyez believes in good faith that disclosure is reasonably
						necessary to protect the property or rights of ForVoyez, third
						parties, or the public at large. If you are a registered user of a
						ForVoyez website and have supplied your email address, ForVoyez may
						occasionally send you an email to tell you about new features, solicit
						your feedback, or just keep you up to date with what's going on with
						ForVoyez and our products. If you send us a request (for example via a
						support email or via one of our feedback mechanisms), we reserve the
						right to publish it in order to help us clarify or respond to your
						request or to help us support other users. ForVoyez takes all measures
						reasonably necessary to protect against the unauthorized access, use,
						alteration, or destruction of potentially personally-identifying and
						personally-identifying information.`}
				</p>
			</section>

			<section id="service-providers">
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Service Providers
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					ForVoyez relies on the following service providers to run its websites
					and services:
				</p>
				<ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
					<li>
						<strong>netcup GmbH</strong> (Germany): hosting of forvoyez.com, its
						API and doc.forvoyez.com.
					</li>
					<li>
						<strong>Contabo GmbH</strong> (Germany): hosting of the database
						(account, credits, API keys, usage history and order details).
					</li>
					<li>
						<strong>OpenAI</strong> (United States): generation of the alt
						texts, titles and captions from the images you submit.
					</li>
					<li>
						<strong>Clerk</strong> (United States): accounts and sign-in (email
						address, name, session cookies).
					</li>
					<li>
						<strong>Lemon Squeezy</strong> (United States): payments and
						subscriptions, as merchant of record.
					</li>
					<li>
						<strong>Mailgun</strong> (United States): delivery of the messages
						sent through the contact form.
					</li>
					<li>
						<strong>OVH</strong> (France): domain name and the mailboxes that
						receive our emails.
					</li>
					<li>
						<strong>Umami</strong> (European Union): cookieless audience
						measurement, self-hosted.
					</li>
				</ul>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">Cookies</h2>
				<p className="mt-1 text-sm text-slate-600">
					{`A cookie is a string of information that a website stores on a
						visitor's computer, and that the visitor's browser provides to the
						website each time the visitor returns. ForVoyez only uses cookies
						that are strictly necessary to provide its service: our
						authentication provider, Clerk, sets cookies that sign you in and
						keep your session secure. Our audience measurement tool, Umami, does
						not use cookies; it only reads your browser's local storage to check
						whether you have opted out. ForVoyez visitors who do not wish to have
						cookies placed on their computers can set their browsers to refuse
						cookies, with the drawback that they will not be able to sign in to
						ForVoyez. Cookies set by third-party content are described below.`}
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Business Transfers
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					If ForVoyez, or substantially all of its assets, were acquired, or in
					the unlikely event that ForVoyez goes out of business or enters
					bankruptcy, user information would be one of the assets that are
					transferred or acquired by a third party. You acknowledge that such
					transfers may occur, and that any acquirer of ForVoyez may continue to
					use your personal information as set forth in this policy.
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Third-Party Content
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					The WordPress plugin page embeds a YouTube video, and you can choose
					to sign in with Google or GitHub. These services may set their own
					cookies and process your data under their own privacy policies, which
					this Privacy Policy does not cover.
				</p>
			</section>

			<section>
				<h2 className="mt-8 mb-4 text-2xl font-bold text-slate-800">
					Privacy Policy Changes
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					{`Although most changes are likely to be minor, ForVoyez may change its
						Privacy Policy from time to time, and in ForVoyez's sole discretion.
						ForVoyez encourages visitors to frequently check this page for any
						changes to its Privacy Policy. Your continued use of this site after
						any change in this Privacy Policy will constitute your acceptance of
						such change.`}
				</p>
				<p className="mt-4 text-sm text-slate-600">
					Last updated: October 8, 2026
				</p>
			</section>

			<section>
				<h2 className="mt-12 mb-4 text-2xl font-bold text-slate-800">
					Contact Information
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					<strong>Cinquin Andy</strong>
					<br />
					SIRET : 880 505 276 00019
					<br />
					4 impasse de la marchaisière
					<br />
					44115 Haute-Goulaine
					<br />
					Tel : 06 21 58 26 84
					<br />
					<a
						className="text-forvoyez_orange-600 hover:text-forvoyez_orange-500"
						href="https://andy-cinquin.com"
					>
						https://andy-cinquin.com
					</a>
				</p>
				<p className={`mt-1 text-sm text-slate-600`}>
					<p className="mt-1 text-sm text-slate-600">
						<strong>ForVoyez</strong>
						<br />
						<a
							className="text-forvoyez_orange-600 hover:text-forvoyez_orange-500"
							href="https://forvoyez.com/contact"
						>
							https://forvoyez.com/contact
						</a>
					</p>
				</p>
			</section>

			<section>
				<h2 className="mt-12 mb-4 text-2xl font-bold text-slate-800">
					Hosting
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					The website, the application and its API (forvoyez.com) and the
					documentation (doc.forvoyez.com) are hosted by:
				</p>
				<p className="mt-4 text-sm text-slate-600">
					<strong>Company details</strong>
					<br />
					<br />
					netcup GmbH
					<br />
					Emmy-Noether-Straße 10
					<br />
					76131 Karlsruhe
					<br />
					Germany
					<br />
					<br />
					<strong>Phone:</strong> +49 721 7540755-0
					<br />
					<strong>Register court:</strong> Amtsgericht Mannheim
					<br />
					<strong>Register number:</strong> HRB 705547
					<br />
					<strong>VAT-ID:</strong> DE262851304
				</p>
				<p className="mt-4 text-sm text-slate-600">
					The production database is hosted on a server provided by:
				</p>
				<p className="mt-4 text-sm text-slate-600">
					<strong>Company details</strong>
					<br />
					<br />
					Contabo GmbH
					<br />
					Welfenstrasse 22
					<br />
					81541 Munich
					<br />
					Germany
					<br />
					<br />
					<strong>Register court:</strong> AG München
					<br />
					<strong>Register number:</strong> HRB 180722
					<br />
					<strong>VAT-ID:</strong> DE267602842
				</p>
			</section>
		</div>
	)
}
