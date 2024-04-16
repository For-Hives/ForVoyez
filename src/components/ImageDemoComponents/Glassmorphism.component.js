import { TypeAnimation } from 'react-type-animation'

export function GlassmorphismComponent({ text }) {
	return (
		<div
			className={
				'shadow-[0 4px 30px rgba(0, 0, 0, 0.1)] absolute left-0 top-0 h-full w-full rounded-lg bg-white/75 backdrop-blur-lg ' +
				'z-50 border border-white/75'
			}
		>
			<div
				className={
					'flex h-full w-full scale-[90%] flex-col items-start text-sm'
				}
			>
				<p>{`{`}</p>
				<div className={'flex flex-grow items-center'}>
					<TypeAnimation
						style={{
							whiteSpace: 'pre-line',
						}}
						sequence={[
							`
							"title":"..."
							"alternativeText": "${text}"
							"caption":"..."`,
						]}
						repeat={0}
						speed={80}
					/>
				</div>
				<p>{`}`}</p>
			</div>
		</div>
	)
}
