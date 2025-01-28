export const div = () => {
	return (
		<div
			style={{
				backgroundImage: 'linear-gradient(-20deg, #e9defa, #fbfcdb)',
				justifyContent: 'center',
				letterSpacing: '-.02em',
				alignItems: 'center',
				display: 'flex',
				fontWeight: 700,
				height: '100%',
				width: '100%',
			}}
		>
			<div
				style={{
					position: 'absolute',
					alignItems: 'center',
					display: 'flex',
					left: 42,
					top: 42,
				}}
			>
				<img
					alt="ForVoyez Logo"
					src="https://r2-andycinquin.andy-cinquin.fr/logo_square_6455de6ad1.png"
					style={{
						marginRight: 8,
						height: 128,
						width: 128,
					}}
				/>

				<span
					style={{
						color: '#333', // Darker text for better contrast on the light background
						fontSize: 32,
					}}
				>
					ForVoyez
				</span>
			</div>
			<div
				style={{
					backgroundColor: 'rgba(0, 0, 0, 0.9)', // Semi-transparent black for better blend
					justifyContent: 'center',
					padding: '40px 60px',
					borderRadius: '10px', // Rounded corners for softer look
					textAlign: 'center',
					flexWrap: 'wrap',
					margin: '0 42px',
					display: 'flex',
					lineHeight: 1.4,
					color: 'white',
					width: 'auto',
					maxWidth: 700,
					fontSize: 42,
				}}
			>
				Powerful Tools for <br />
				Image Metadata Generation
			</div>
		</div>
	)
}
