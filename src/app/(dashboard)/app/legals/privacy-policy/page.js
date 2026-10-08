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
					Service Providers (Sub-processors)
				</h2>
				<p className="mt-1 text-sm text-slate-600">
					ForVoyez relies on the following service providers to run its websites
					and services. For each one, we list what it does, the data it
					processes and where it is established. For providers located outside
					the European Economic Area (EEA), we also state the safeguard the
					provider relies on for transfers of personal data.
				</p>
				<ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
					<li>
						<strong>netcup GmbH</strong> (Germany): hosting of forvoyez.com
						(website, application and API) and of the documentation at
						doc.forvoyez.com. All traffic to these sites goes through its
						servers: IP address, browser user agent, session cookies and server
						logs, as well as the images you send to the API or the playground
						and the messages sent through the contact form.
					</li>
					<li>
						<strong>Contabo GmbH</strong> (Germany): hosting of the production
						database, which stores your account identifier, credit balance, API
						keys and usage history and, for paying customers, the name, email
						address and order details received from Lemon Squeezy.
					</li>
					<li>
						<strong>OpenAI Ireland Ltd</strong> (Ireland, with processing in the
						United States): generation of alt texts, titles and captions. It
						receives each image you submit through the API, the WordPress plugin
						or the playground, with the optional context, keywords, language and
						JSON schema sent with it. Images may contain personal data, for
						example when they show people. We send requests with storage
						disabled; according to OpenAI, API data is not used to train its
						models and abuse monitoring logs are kept for up to 30 days.
						Transfers outside the EEA: Standard Contractual Clauses or an
						adequacy decision, under OpenAI&apos;s Data Processing Addendum.
					</li>
					<li>
						<strong>Clerk, Inc.</strong> (United States): authentication
						(accounts, sessions, sign-in with Google or GitHub, and
						authentication emails). It processes your email address and
						password, your first and last name if you provide them, your Google
						or GitHub identity if you sign in with them, session cookies, your
						IP address and browser user agent. Clerk sends authentication emails
						through SendGrid and uses Cloudflare Turnstile to block bots.
						Transfers outside the EEA: EU-U.S. Data Privacy Framework (with its
						UK Extension and the Swiss-U.S. Data Privacy Framework), with
						Standard Contractual Clauses as a fallback.
					</li>
					<li>
						<strong>Sold through Link, LLC</strong>, formerly Lemon Squeezy LLC
						(United States): payments and subscriptions, as merchant of record.
						Lemon Squeezy collects your name, email address, billing address,
						payment and tax information directly on its checkout. We send it
						your ForVoyez user identifier when you start a checkout, and it
						sends us back your name, email address and order details, which we
						store. Transfers outside the EEA: Standard Contractual Clauses.
					</li>
					<li>
						<strong>Mailgun Technologies, Inc.</strong> (Sinch Email, United
						States): delivery of the messages sent through the contact form:
						first name, last name, company, email address, phone number, subject
						and message. Transfers outside the EEA: EU-U.S. Data Privacy
						Framework (with its UK Extension), or Standard Contractual Clauses.
					</li>
					<li>
						<strong>OVH SAS</strong> (France): hosting of the mailboxes that
						receive the emails sent to contact@forvoyez.com and the messages
						from the contact form, and registrar of the forvoyez.com domain.
					</li>
					<li>
						<strong>Umami</strong> (European Union): audience measurement with
						Umami, an open-source analytics tool, on a self-hosted instance
						(umami.wadefade.fr) run by a member of the For-Hives team on a
						server rented from Contabo. It records the pages viewed (URL and
						referrer), browser, operating system, device type and the country
						derived from your IP address; the server receives your IP address
						and browser user agent with each request. Umami sets no cookies.
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
					Third-party content appearing on any of our websites may be delivered
					to users by partners, who receive information about your visit and may
					set cookies. These cookies allow the partner to recognize your
					computer each time you interact with the content to compile
					information about you or others who use your computer. These partners
					are:
				</p>
				<ul className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-600">
					<li>
						<strong>YouTube</strong>: the WordPress plugin page
						(forvoyez.com/wordpress-plugin) embeds a YouTube video. In the EEA
						and Switzerland, YouTube is provided by Google Ireland Limited,
						Gordon House, Barrow Street, Dublin 4, Ireland. When the page loads,
						YouTube receives your IP address, browser user agent and the address
						of the page, and sets its own cookies (such as YSC,
						VISITOR_INFO1_LIVE and VISITOR_PRIVACY_METADATA). Data may be
						transferred to Google LLC in the United States, which is certified
						under the EU-U.S. Data Privacy Framework.
					</li>
					<li>
						<strong>unpkg</strong>: the animation on the home page loads a file
						from the public content delivery network unpkg.com, served through
						Cloudflare&apos;s network, or from cdn.jsdelivr.net when unpkg is
						unavailable. These services receive your IP address, browser user
						agent and the address of the page.
					</li>
					<li>
						<strong>Google and GitHub</strong>: if you choose to sign in with
						Google or GitHub, that provider processes your sign-in under its own
						privacy policy.
					</li>
				</ul>
				<p className="mt-4 text-sm text-slate-600">
					These partners act independently of ForVoyez. This Privacy Policy
					covers the use of cookies by ForVoyez and does not cover the use of
					cookies by any partners; please refer to their own privacy policies.
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
