export const metadata = {
	title: 'Terms of Service - ForVoyez',
	description:
		"Read ForVoyez's Terms of Service agreement before accessing or using our AI-powered image metadata generation services.",
	alternates: {
		canonical: 'https://forvoyez.com/app/legals/terms',
	},
}

export default function TermsOfServicePage() {
	return (
		<div className="prose mx-auto max-w-5xl flex-auto px-6">
			<h1 className="mb-8 text-3xl font-bold text-slate-800">
				Terms of Service
			</h1>

			<p className="mt-1 text-sm text-slate-600">
				{`Thank you for using ForVoyez! We're happy you're here. Please read our
                    Terms of Service agreement carefully before accessing or using ForVoyez.
                    Because it is such an important contract between us and our users, we
                    have tried to make it as clear as possible. For your convenience, we
                    have presented these terms in a short non-binding summary followed by
                    the full legal terms.`}
			</p>

			<p className="mt-4 text-sm font-bold text-slate-800">
				YOU AGREE THAT BY REGISTERING FOR, ACCESSING, OR USING THE SERVICES, YOU
				ARE ENTERING INTO A LEGALLY BINDING AGREEMENT WITH FORVOYEZ. IF YOU DO
				NOT AGREE WITH THESE TERMS, YOU MUST NOT ACCESS OR USE THE SERVICES.
			</p>

			<p className="mt-8 text-sm text-slate-600">
				Please click the link below to view the full Terms of Service in PDF
				format:
			</p>

			<a
				href="/legal/Terms of service - ForVoyez.pdf"
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 inline-flex items-center rounded-md bg-forvoyez_orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-forvoyez_orange-600 focus:outline-none focus:ring-2 focus:ring-forvoyez_orange-500 focus:ring-offset-2"
			>
				<svg
					className="-ml-1 mr-2 h-5 w-5"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fillRule="evenodd"
						d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
						clipRule="evenodd"
					/>
				</svg>
				View Terms of Service (PDF)
			</a>
		</div>
	)
}
