import { TypeAnimation } from 'react-type-animation'

export function GlassmorphismComponent({ title, alt, caption }) {
	return (
		<div
			className={
				'shadow-[0 4px 30px rgba(0, 0, 0, 0.1)] glassmorphism-animation absolute left-0 top-0 h-full w-full rounded-lg bg-white/75 backdrop-blur-lg ' +
				'z-50 border border-white/75'
			}
		>
			<div
				className={
					'pointer-events-none flex h-full w-full scale-[90%] flex-col items-start text-sm leading-4'
				}
			>
				<div className={'flex flex-grow items-center'}>
					<TypeAnimation
						style={{
							whiteSpace: 'pre-wrap',
						}}
						sequence={[
							3500,
							`{\n\n\t"title":"${title}",\n\n\t"alternativeText": "${alt}",\n\n\n\t"caption":"${caption}"\n\n}`,
						]}
						repeat={0}
						speed={80}
					/>
				</div>
			</div>
		</div>
	)
}
