import { TypeAnimation } from 'react-type-animation'

export function GlassmorphismComponent({ title, alt, caption }) {
	function truncateText(text, maxLength) {
		if (text.length > maxLength) {
			return text.substring(0, maxLength - 3) + '...'
		}
		return text
	}

	return (
		<div
			className={
				'shadow-[0 4px 30px rgba(0, 0, 0, 0.1)] glassmorphism-animation absolute left-0 top-0 h-full w-full rounded-lg bg-white/75 backdrop-blur-lg ' +
				'z-50 border border-white/75 hover:opacity-0'
			}
		>
			<div
				className={
					'pointer-events-none flex h-full w-full scale-[90%] flex-col items-start text-xs leading-4'
				}
			>
				<p>{`{`}</p>
				<div className={'flex flex-grow items-start'}>
					<TypeAnimation
						style={{
							whiteSpace: 'pre-wrap',
						}}
						sequence={[
							3500,
							`\n\t"title":"${truncateText(title, 50)}",\n\n\t"alternativeText": "${truncateText(alt, 125)}",\n\n\t"caption":"${truncateText(caption, 75)}"\n`,
						]}
						repeat={0}
						speed={90}
						cursor={false}
					/>
				</div>
				<p>{`}`}</p>
			</div>
		</div>
	)
}
