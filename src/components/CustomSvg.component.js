export function CustomSvgComponent({ url, classNames }) {
	return (
		<div
			className={`h-[20px] w-[20px] ${classNames}`}
			style={{
				mask: `url(${url})`,
				WebkitMask: `url(${url})`,
				maskRepeat: 'no-repeat',
				WebkitMaskRepeat: 'no-repeat',
				maskPosition: 'center',
				WebkitMaskPosition: 'center',
				maskSize: 'contain',
				WebkitMaskSize: 'contain',
			}}
		/>
	)
}
