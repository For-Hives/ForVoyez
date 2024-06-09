'use client'
import { TypeAnimation } from 'react-type-animation'
import { useEffect, useState } from 'react'

export function GlassmorphismComponent({ caption, title, alt }) {
	const [initialized, setInitialized] = useState(false)

	function truncateText(text, maxLength) {
		if (text.length > maxLength) {
			return text.substring(0, maxLength - 3) + '...'
		}
		return text
	}

	useEffect(() => {
		// 	after 3.5s, disable 'opacity-0' class on the div
		setTimeout(() => {
			setInitialized(true)
		}, 3500)
	}, [])

	return (
		<div>
			<div
				className={
					`${initialized ? '!opacity-100 hover:!opacity-0' : '!opacity-0'} shadow-[0 4px 30px rgba(0, 0, 0, 0.1)] glassmorphism-animation absolute left-0 top-0 h-full w-full rounded-lg bg-white/75 backdrop-blur-lg transition-all ` +
					'z-50 border border-white/75'
				}
			>
				<div
					className={
						'flex h-full w-full scale-[90%] flex-col items-start text-xs leading-4'
					}
				>
					<p>{`{`}</p>
					<div className={'flex flex-grow items-start'}>
						<TypeAnimation
							cursor={false}
							repeat={0}
							sequence={[
								3500,
								`\n\t"title":"${truncateText(title, 50)}",\n\n\t"alternativeText": "${truncateText(alt, 125)}",\n\n\t"caption":"${truncateText(caption, 75)}"\n`,
							]}
							speed={90}
							style={{
								whiteSpace: 'pre-wrap',
							}}
						/>
					</div>
					<p>{`}`}</p>
				</div>
			</div>
		</div>
	)
}
