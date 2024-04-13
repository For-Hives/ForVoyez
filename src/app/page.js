import Image from 'next/image'

// fixme change the landing page
export default function Home() {
	return (
		<>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>Track Your Social Media Analytics Easier Than Ever.</title>
			<meta name="robots" content="index, follow" />
			<meta
				name="googlebot"
				content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
			/>
			<meta
				name="bingbot"
				content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
			/>
			<meta property="og:site_name" content="Pallyy" />
			<link rel="icon" type="image/x-icon" href="/favicon.png" />
			<meta
				name="description"
				content="See the content that resonates with your audience, and make more of it with our social media analytics suite."
			/>
			<meta
				property="og:title"
				content="Track Your Social Media Analytics Easier Than Ever."
			/>
			<meta
				property="og:image"
				content="https://images.prismic.io/smi-blog/7ec7338c-c26c-4751-8ff3-f1d41cb641db_ogimage.png"
			/>
			<meta
				property="og:image:alt"
				content="Pallyy: Social Media Management Platform"
			/>
			<meta
				property="og:description"
				content="See the content that resonates with your audience, and make more of it with our social media analytics suite."
			/>
			<meta property="og:url" content="https://pallyy.com/analytics" />
			<meta property="og:type" content="website" />
			<meta
				name="twitter:title"
				content="Track Your Social Media Analytics Easier Than Ever."
			/>
			<meta
				name="twitter:image"
				content="https://images.prismic.io/smi-blog/7ec7338c-c26c-4751-8ff3-f1d41cb641db_ogimage.png"
			/>
			<meta
				name="twitter:description"
				content="See the content that resonates with your audience, and make more of it with our social media analytics suite."
			/>
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:site" content="@pallyysocial" />
			<link rel="canonical" href="https://pallyy.com/analytics" />
			<style
				dangerouslySetInnerHTML={{
					__html:
						'/*! tailwindcss v3.4.1 | MIT License | https://tailwindcss.com*/*,:after,:before{border:0 solid #e5e7eb;box-sizing:border-box}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}hr{border-top-width:1px;color:inherit;height:0}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-size:1em;font-variation-settings:normal}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{border-collapse:collapse;border-color:inherit;text-indent:0}button,input,optgroup,select,textarea{color:inherit;font-family:inherit;font-feature-settings:inherit;font-size:100%;font-variation-settings:inherit;font-weight:inherit;line-height:inherit;margin:0;padding:0}button,select{text-transform:none}[type=button],[type=reset],[type=submit],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{color:#9ca3af;opacity:1}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{height:auto;max-width:100%}[hidden]{display:none}*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: }.visible{visibility:visible}.static{position:static}.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.bottom-0{bottom:0}.mx-auto{margin-left:auto;margin-right:auto}.-mr-8{margin-right:-2rem}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mt-10{margin-top:2.5rem}.mt-2{margin-top:.5rem}.mt-4{margin-top:1rem}.mt-6{margin-top:1.5rem}.mt-8{margin-top:2rem}.block{display:block}.inline{display:inline}.flex{display:flex}.table{display:table}.grid{display:grid}.contents{display:contents}.hidden{display:none}.aspect-\\[16\\/9\\]{aspect-ratio:16/9}.h-2{height:.5rem}.h-20{height:5rem}.h-full{height:100%}.w-1\\/2{width:50%}.w-20{width:5rem}.w-24{width:6rem}.w-4{width:1rem}.w-full{width:100%}.max-w-2xl{max-width:42rem}.max-w-4xl{max-width:56rem}.max-w-5xl{max-width:64rem}.max-w-6xl{max-width:72rem}.max-w-full{max-width:100%}.max-w-xl{max-width:36rem}.grow{flex-grow:1}.transform{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.resize{resize:both}.list-inside{list-style-position:inside}.list-outside{list-style-position:outside}.list-disc{list-style-type:disc}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.justify-end{justify-content:flex-end}.gap-2{gap:.5rem}.gap-4{gap:1rem}.gap-8{gap:2rem}.space-y-8>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-bottom:0;margin-bottom:calc(2rem*var(--tw-space-y-reverse));margin-top:2rem;margin-top:calc(2rem*(1 - var(--tw-space-y-reverse)))}.whitespace-pre-line{white-space:pre-line}.rounded-full{border-radius:9999px}.rounded-lg{border-radius:.5rem}.rounded-md{border-radius:.375rem}.border{border-width:1px}.border-2{border-width:2px}.border-\\[0\\.5px\\]{border-width:.5px}.border-b{border-bottom-width:1px}.border-b-2{border-bottom-width:2px}.border-l-4{border-left-width:4px}.border-t{border-top-width:1px}.border-amber-400{--tw-border-opacity:1;border-color:#fbbf24;border-color:rgb(251 191 36/var(--tw-border-opacity))}.border-black{--tw-border-opacity:1;border-color:#1f2328;border-color:rgb(31 35 40/var(--tw-border-opacity))}.border-gray-200{--tw-border-opacity:1;border-color:#e5e7eb;border-color:rgb(229 231 235/var(--tw-border-opacity))}.border-gray-300{--tw-border-opacity:1;border-color:#d1d5db;border-color:rgb(209 213 219/var(--tw-border-opacity))}.border-white{--tw-border-opacity:1;border-color:#fff;border-color:rgb(255 255 255/var(--tw-border-opacity))}.bg-black{--tw-bg-opacity:1;background-color:#1f2328;background-color:rgb(31 35 40/var(--tw-bg-opacity))}.bg-gray-300{--tw-bg-opacity:1;background-color:#d1d5db;background-color:rgb(209 213 219/var(--tw-bg-opacity))}.bg-gray-50{--tw-bg-opacity:1;background-color:#f9fafb;background-color:rgb(249 250 251/var(--tw-bg-opacity))}.bg-white{--tw-bg-opacity:1;background-color:#fff;background-color:rgb(255 255 255/var(--tw-bg-opacity))}.object-cover{object-fit:cover}.object-left-top{object-position:left top}.p-8{padding:2rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-bottom:.25rem;padding-top:.25rem}.py-1\\.5{padding-bottom:.375rem;padding-top:.375rem}.py-12{padding-bottom:3rem;padding-top:3rem}.py-2{padding-bottom:.5rem;padding-top:.5rem}.py-2\\.5{padding-bottom:.625rem;padding-top:.625rem}.py-3{padding-bottom:.75rem;padding-top:.75rem}.pl-4{padding-left:1rem}.pt-8{padding-top:2rem}.text-center{text-align:center}.text-2xl{font-size:1.5rem;line-height:2rem}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-\\[50px\\]{font-size:50px}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-extrabold{font-weight:800}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.capitalize{text-transform:capitalize}.italic{font-style:italic}.text-black{--tw-text-opacity:1;color:#1f2328;color:rgb(31 35 40/var(--tw-text-opacity))}.text-white{--tw-text-opacity:1;color:#fff;color:rgb(255 255 255/var(--tw-text-opacity))}.underline{text-decoration-line:underline}.decoration-amber-400{text-decoration-color:#fbbf24}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color);box-shadow:0 0 #0000,0 0 #0000,0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.outline{outline-style:solid}.grayscale{--tw-grayscale:grayscale(100%);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) grayscale(100%) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.filter,.grayscale{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition{transition-duration:.15s;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,-webkit-backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter;transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter,-webkit-backdrop-filter;transition-timing-function:cubic-bezier(.4,0,.2,1)}.hover\\:bg-gray-400:hover{--tw-bg-opacity:1;background-color:#9ca3af;background-color:rgb(156 163 175/var(--tw-bg-opacity))}.hover\\:bg-gray-700:hover{--tw-bg-opacity:1;background-color:#374151;background-color:rgb(55 65 81/var(--tw-bg-opacity))}@media (min-width:640px){.sm\\:flex-col{flex-direction:column}}@media (min-width:768px){.md\\:list-inside{list-style-position:inside}.md\\:flex-row{flex-direction:row}.md\\:pl-0{padding-left:0}}'
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						'@font-face{ascent-override:90%;font-family:Title Fallback;line-gap-override:15%;size-adjust:91%;src:local(Verdana Bold)}@font-face{ascent-override:90%;font-family:Body Fallback;line-gap-override:15%;size-adjust:100%;src:local(Verdana)}@font-face{font-family:h2 Fallback;line-gap-override:31.8%;size-adjust:98.5%;src:local(Verdana)}body{margin:0;--green:#1f2328;--light-green:#c3f0ca;--light-red:#ff8ba7;--black:#1d2d35;--grey:#eae8e5;--dark-grey:#585b63;--purple:#b79cff;--purple-light:#f2edff;--off-white:#fff9ee;--blue:#3740ff;--theme-border-radius:23px;color:#1d2d35;color:var(--black);font-family:Inter,Body Fallback;font-size:clamp(1rem,.96rem + .18vw,1.125rem)}*,:after,:before{box-sizing:border-box}h3,h4,h5,h6{font-family:Inter,Body Fallback;font-weight:500;line-height:1.3;margin:0}li strong,p strong{font-weight:600}.left{text-align:left}.right{text-align:right}.all-center>*,.center{text-align:center}.all-center>*{margin-inline:auto}.flow>*+*{margin-top:1em}a{color:var(--black)}.button,a:hover{text-decoration:none}.button{align-items:center;border:none;border-radius:37px;cursor:pointer;display:inline-flex;font-family:Inter,Body Fallback;font-weight:500;line-height:1!important;position:relative;text-transform:uppercase;transition:all .2s linear;white-space:nowrap}.button[data-type=primary]{background:var(--green);border:1px solid var(--green);color:#fff;padding:1.4em 2.7em}.button[data-type=primary]:hover{box-shadow:0 5px 5px -3px rgba(0,0,0,.1),0 8px 8px 1px rgba(0,0,0,.07),0 3px 8px 2px rgba(0,0,0,.08)}.button[data-type=secondary]{background:#fff;border:1px solid var(--black);color:var(--black);font-size:15px;padding:.7em 1.4em;text-transform:capitalize}.button[data-type=secondary]:hover{background:var(--green);border:1px solid var(--green);box-shadow:0 5px 5px -3px rgba(0,0,0,.1),0 8px 8px 1px rgba(0,0,0,.07),0 3px 8px 2px rgba(0,0,0,.08);color:#fff}button:disabled{opacity:.5}.wrapper{margin-inline:auto;padding-inline:clamp(1.375rem,1.2rem + .89vw,2rem);position:relative;width:clamp(16rem,95vw,85rem)}.cluster{display:flex;flex-wrap:wrap;gap:clamp(1.375rem,1.2rem + .89vw,2rem)}.flex-justify-center{justify-content:center}.flex-justify-between{justify-content:space-between}.flex-align-center{align-items:center}.section{padding-block:clamp(3.75rem,3.21rem + 2.68vw,5.625rem)}.bg-purple{background:var(--purple-light)}.bg-off-white{background:var(--off-white)}.bg-orange-gradient{background:linear-gradient(180deg,#fff9ee,#fff)}.border-bottom-black{border-bottom:.5px solid var(--black)}.border-top-purple{border-top:.5px solid var(--purple)}.border-bottom-purple{border-bottom:.5px solid var(--purple)}img{display:block;height:auto;max-width:100%}.page-enter-active,.page-leave-active{transition:all .4s}.page-enter-from,.page-leave-to{filter:blur(1rem);opacity:0}.no-padding-top{padding-top:0}.responsive-table{max-width:100%;overflow:auto}table{border-spacing:0}tr>td:first-child{text-align:left}td,th{padding:20px}th{font-size:20px}td{border-top:.5px solid var(--black)!important;font-weight:500}ol{counter-reset:ol-list;padding-inline-start:.5rem}ol>li{counter-increment:ol-list;list-style:none;padding-inline-start:2.5rem;position:relative}ol>li:before{align-items:center;background:#f2f2f2;border-radius:50%;content:counter(ol-list);display:flex;flex-direction:column;font-size:.9em;font-weight:500;height:1.5rem;inset:.25ex 0 0 0;justify-content:center;line-height:1.1;position:absolute;width:1.5rem}.iframe-container{height:0;max-width:100%;padding-bottom:56.25%;position:relative}iframe{height:calc(100% - 20px);position:absolute;width:calc(100% - 20px)}.blog-image{border:1px solid var(--grey);height:auto;max-height:500px;max-width:100%;padding:10px;width:auto}.breadcrumbs-list{list-style:none;margin:0;padding:0}.breadcrumbs-list,.breadcrumbs-list>li{align-items:center;display:flex;gap:0 1.25rem}.breadcrumbs-list>li{margin-top:0}.breadcrumbs-list>li>a{text-transform:capitalize}.breadcrumbs-list>li+li:before{border-right:2px solid;border-top:2px solid;content:"";display:block;height:8px;opacity:.8;transform:rotate(45deg);width:8px}.modal{padding:1em}.modal-heading{font-size:20px;font-weight:600}.modal-background{animation:fadeIn .2s;background-color:rgba(0,0,0,.3);height:100%;left:0;position:fixed;top:0;width:100%;z-index:9998}.modal-container{animation:slideIn .2s;background-color:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,.33);margin:60px auto 0;max-height:500px;max-width:400px;overflow-y:auto}.modal-fade-enter,.modal-fade-leave-active{opacity:0}.modal-fade-enter-active,.modal-fade-leave-active{transition:opacity .3s ease}@keyframes fadeIn{0%{opacity:0}to{opacity:1}}@keyframes slideIn{0%{transform:translateY(100px)}to{transform:translateY(0)}}@media screen and (max-width:768px){.center{text-align:left}}'
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						"h1{font-size:3rem;line-height:1}h1,h2{font-weight:800;margin-bottom:1rem}h2{font-size:2.25rem;line-height:2.5rem}"
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						'@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:300;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:400;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:500;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:600;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:700;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:800;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-1.DIEz8p5i.woff2) format("woff2");unicode-range:u+0460-052f,u+1c80-1c88,u+20b4,u+2de0-2dff,u+a640-a69f,u+fe2e-fe2f}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-2.BmJJXa8e.woff2) format("woff2");unicode-range:u+0301,u+0400-045f,u+0490-0491,u+04b0-04b1,u+2116}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-3.D5AYLNiq.woff2) format("woff2");unicode-range:u+1f??}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-4.DyIDNIyN.woff2) format("woff2");unicode-range:u+0370-0377,u+037a-037f,u+0384-038a,u+038c,u+038e-03a1,u+03a3-03ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-5._GQuwPVU.woff2) format("woff2");unicode-range:u+0102-0103,u+0110-0111,u+0128-0129,u+0168-0169,u+01a0-01a1,u+01af-01b0,u+0300-0301,u+0303-0304,u+0308-0309,u+0323,u+0329,u+1ea0-1ef9,u+20ab}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-6.CN1pIXkb.woff2) format("woff2");unicode-range:u+0100-02af,u+0304,u+0308,u+0329,u+1e00-1e9f,u+1ef2-1eff,u+2020,u+20a0-20ab,u+20ad-20c0,u+2113,u+2c60-2c7f,u+a720-a7ff}@font-face{font-display:swap;font-family:Inter;font-style:normal;font-weight:900;src:url(/_nuxt/Inter-300-7.BgVq2Tq4.woff2) format("woff2");unicode-range:u+00??,u+0131,u+0152-0153,u+02bb-02bc,u+02c6,u+02da,u+02dc,u+0304,u+0308,u+0329,u+2000-206f,u+2074,u+20ac,u+2122,u+2191,u+2193,u+2212,u+2215,u+feff,u+fffd}'
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						".site-header[data-v-c4b7758e]{align-items:center;background:#fff;border-bottom:.5px solid transparent;display:grid;grid-template-columns:auto auto;justify-content:space-between;min-height:60px;padding:0 20px;position:sticky;top:0;transition:border .2s;z-index:1}li [aria-current=page][data-v-c4b7758e]{border-bottom:0;border-bottom:var(--nav-list-item-current-border,0)}nav[data-v-c4b7758e]{align-items:center;inset-block-start:10px;inset-inline-end:10px;position:fixed;position:var(--nav-position,fixed)}nav[data-v-c4b7758e],ul[data-v-c4b7758e]{display:flex}ul[data-v-c4b7758e]{background:#fff;box-shadow:-5px 0 11px 0 rgba(0,0,0,.2);box-shadow:var(--nav-list-shadow,-5px 0 11px 0 rgba(0,0,0,.2));flex-direction:column;flex-direction:var(--nav-list-layout,column);flex-wrap:wrap;gap:0;gap:var(--nav-list-gap,0);height:100vh;height:var(--nav-list-height,100vh);inset-block-start:0;inset-inline-end:0;list-style:none;margin:0;padding:4rem 1em;padding:var(--nav-list-padding,4rem 1em);position:fixed;position:var(--nav-list-position,fixed);transform:translateX(0);transition:transform .1s linear,visibility .1s linear;visibility:visible;visibility:var(--nav-list-visibility,visible);width:min(13rem,100vw);width:var(--nav-list-width,min(13rem,100vw))}li[data-v-c4b7758e]{margin-top:0}li>a[data-v-c4b7758e]{border-bottom:3px solid transparent;display:block;font-size:15px;font-weight:500;padding:1em;text-decoration:none;width:100%}li a[data-v-c4b7758e]:hover{border-bottom:3px solid var(--black)}nav>button[data-v-c4b7758e]{background:#fff;border:0;display:flex;display:var(--nav-button-display,flex);position:relative;z-index:1}[aria-expanded=false]+ul[data-v-c4b7758e]{transform:translateX(100%);transform:var(--nav-list-transform,translateX(100%));visibility:hidden;visibility:var(--nav-list-visibility,hidden)}.button[data-v-c4b7758e]{margin-left:1em}@media screen and (min-width:768px){.mobile-menu-button[data-v-c4b7758e]{display:none}nav[data-v-c4b7758e]{--nav-button-display:none;--nav-position:static}ul[data-v-c4b7758e]{--nav-list-transform:none;--nav-list-layout:row;--nav-list-position:static;--nav-list-padding:0;--nav-list-height:auto;--nav-list-width:100%;--nav-list-shadow:none;--nav-list-visibility:visible;--nav-list-gap:0.5em}li[data-v-c4b7758e]{--nav-list-item-margin:0;--nav-list-item-current-border:3px solid var(--black)}}"
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						".hero[data-v-e121cbcb]{padding-block:clamp(3.75rem,3.21rem + 2.68vw,5.625rem)}.hero__image[data-v-e121cbcb]{margin-top:clamp(2rem,3vw,3rem);width:100%}.hero__button[data-v-e121cbcb]{margin:1em auto}nav>ul[data-v-e121cbcb]{justify-content:center}"
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						".tool-section[data-v-78ab7201]{margin-top:-2em;padding-top:0}.generate-container[data-v-78ab7201]{max-width:900px}input[data-v-78ab7201],textarea[data-v-78ab7201]{border:1px solid var(--black);border-radius:4px;font-size:20px;outline:none;padding:10px;width:100%}input[data-v-78ab7201],select[data-v-78ab7201]{height:50px}select[data-v-78ab7201]{border:1px solid var(--black);border-radius:4px;font-size:20px;outline:none;padding:10px;text-align:center;width:100%}.captions>div[data-v-78ab7201]:not(:last-child){margin-bottom:1em}.caption[data-v-78ab7201]{background:#fff;border:1px solid var(--grey);border-radius:20px;box-shadow:0 4px 6px -1px #0000001a,0 2px 4px -2px #0000001a;display:flex;flex-direction:column;margin:auto;padding:1rem;position:relative}.caption__buttons[data-v-78ab7201]{align-items:center;display:flex;gap:10px;margin-left:auto;margin-top:10px}.caption__text[data-v-78ab7201]{font-size:15px;margin:0;white-space:pre-line;word-break:break-word}.tweet__button[data-v-78ab7201]{background:#1d9bf0;border:1px solid #1d9bf0;color:#fff}.upload-input[data-v-78ab7201]{align-items:center;background:#fff;border:1px dashed var(--dark-grey);border-radius:10px;cursor:pointer;display:flex;height:250px;justify-content:center;margin:auto;overflow:hidden;padding:1rem;position:relative}.upload-input[data-v-78ab7201]:hover{background:#fafafa}.upload-input>input[data-v-78ab7201]{height:100%;left:0;opacity:0;position:absolute;top:0;width:100%;z-index:1}.upload-input>input[data-v-78ab7201]:hover{cursor:pointer}.upload-input>img[data-v-78ab7201]{height:100%}.upload-input-text[data-v-78ab7201]{align-items:center;display:flex;flex-direction:column;gap:10px;justify-content:center}.upload-input-text>img[data-v-78ab7201]{width:30px}.upload-input-text>p[data-v-78ab7201]{font-size:14px}.loading-overlay[data-v-78ab7201]{align-items:center;background:hsla(0,0%,100%,.5);display:flex;height:100%;justify-content:center;position:absolute;width:100%;z-index:3}.loading-overlay>img[data-v-78ab7201]{animation:spin-78ab7201 2s infinite;width:40px}label[data-v-78ab7201]{font-size:13px;font-weight:600;text-transform:uppercase}.generate-button[data-v-78ab7201]{background-color:var(--black);border:1px solid var(--black);border-radius:5px;justify-content:center;width:100%}input[data-v-78ab7201]::-moz-placeholder{font-size:14px}input[data-v-78ab7201],input[data-v-78ab7201]::placeholder{font-size:14px}@keyframes spin-78ab7201{0%{transform:rotate(0deg)}to{transform:rotate(1turn)}}@media screen and (min-width:768px){.caption[data-v-78ab7201]{display:flex}}"
				}}
			/>
			<style
				dangerouslySetInnerHTML={{
					__html:
						".footer-grid[data-v-7faddbe4]{display:grid;grid-template-columns:1fr 1fr;grid-gap:1em}.footer-grid-heading[data-v-7faddbe4]{color:var(--black);font-size:15px;font-weight:700;margin-bottom:10px}.footer-ul[data-v-7faddbe4]{list-style:none;margin-bottom:40px;padding-left:0}.footer-ul>li[data-v-7faddbe4]{margin-bottom:10px;min-height:27px;padding:0}.footer-ul>li>a[data-v-7faddbe4],.footer-ul>li>button[data-v-7faddbe4]{cursor:pointer;font-size:15px;font-weight:400;text-decoration:none}.footer-grid-heading-link[data-v-7faddbe4]:hover,.footer-ul>li>a[data-v-7faddbe4]:hover,.footer-ul>li>button[data-v-7faddbe4]:hover{text-decoration:underline}.footer-ul>li>button[data-v-7faddbe4]{background:transparent;border:0;padding:0}.new[data-v-7faddbe4]{background:#faf785;border-radius:3px;padding:2px 4px}@media screen and (min-width:500px){.footer-grid[data-v-7faddbe4]{grid-template-columns:repeat(3,auto);justify-content:space-between}}@media screen and (min-width:700px){.footer-grid[data-v-7faddbe4]{grid-template-columns:repeat(4,auto)}}"
				}}
			/>
			<link rel="stylesheet" href="/_nuxt/default.BNEp1Jmc.css" />
			<link
				rel="stylesheet"
				href="/_nuxt/image-description-generator.DEwFLvWH.css"
			/>
			<link rel="stylesheet" href="/_nuxt/Hero.Bbu62xm4.css" />
			<link rel="stylesheet" href="/_nuxt/CTA.B8-eogtT.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/entry.DndLudtB.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/default.y7z5UwgI.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/PageButton.vue.BMNIBQZ-.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/usePageHead.B3ud3fS8.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/image-description-generator.uiSZnLrD.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/Hero.CVgM85QV.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/RateLimitedAlert.vue.DgJW1Lcz.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/CTA.Cz63ZM3s.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/useTTS.Dv2yYdz6.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/useCopy.DMoSEZR3.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="/_nuxt/BlobServiceClient.BJ4dJMy0.js"
			/>
			<link
				rel="prefetch"
				as="script"
				crossOrigin=""
				href="/_nuxt/component-stub.FmFgRqLi.js"
			/>
			<link
				rel="prefetch"
				as="script"
				crossOrigin=""
				href="/_nuxt/browser.vgw9YzwU.js"
			/>
			<link
				rel="prefetch"
				as="script"
				crossOrigin=""
				href="/_nuxt/_commonjsHelpers.BosuxZz1.js"
			/>
			<link
				rel="prefetch"
				as="script"
				crossOrigin=""
				href="/_nuxt/error-404.CRNSVuY5.js"
			/>
			<link
				rel="prefetch"
				as="script"
				crossOrigin=""
				href="/_nuxt/error-500.BjXGOOAw.js"
			/>
			<link rel="preconnect" href="https://fonts.googleapis.com" />
			<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap"
				className="wtd-font"
			/>
			<link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Unbounded"
				className="wtd-font"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.DNQ-Ci9A.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.CWhMnUhO.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Links.ClafFTgf.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/Links.BJSIbUwK.css" />
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/index.DCohNaeE.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.B_vlfVDH.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Hero.C4Z5IqhV.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/Hero.DR7ZInIB.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Features.CNpJYU5R.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Reviews.DnM5ZJp9.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/Reviews.li5GvhYq.css" />
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/Features.C8H2EV2q.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/CallToAction.aAEWdGK6.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/CallToAction.DlbUsd2C.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/FrequentlyAskedQuestions.BOIbHZqW.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/FrequentlyAskedQuestions.dPVMyNhN.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.BBy03rDd.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/instagram.Bvipik3x.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/instagram.BZqPEnLL.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/pricing._0IzemKX.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/pricing.DjirlaPC.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/reviews.4RUOci1u.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.CZZ6UKDX.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/DocumentPreview.ChUk56WL.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/DocumentPreview.BmZjNg8U.css"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/index.DD6aBMj1.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/facebook.D86go-1e.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/twitter.DzfM18WP.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.C4pAhD5z.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/index.D-_FY27r.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/pinterest.DQsIyMhB.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/tiktok.BOjDnJ4m.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/views.VXuNqv-2.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/teams.BAsphoVV.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/linkedin.CSeLdZkS.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/google-my-business.MPSnZ4cS.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/facebook.DLTHpGoY.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/linkedin.DASTvIN8.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/reports.DStHm5P5.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/image-caption-generator.CoN640Ar.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/image-caption-generator.8YjKpSyL.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/instagram-caption-generator.bheD_2uc.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Generator.CwDoltj1.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/Generator.CiQhw5gV.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/Features.D1LjhlMB.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/Features.8hR69_WW.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/twitter-thread-maker.D3TB3IS1.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/autosize.esm.DYyLnOFQ.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/FAQ.CPSnwGG4.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/FAQ.CcWBOMYc.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/BlogPosts.CVpM2wJ0.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/BlogPosts.BWWRVlpv.css"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/twitter-thread-maker.CqNFK_fw.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/social-media-inbox.CHyJmw1A.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/social-media-inbox.C3W4nmNu.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/instagram-bio-link.BAyZuX2C.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/instagram-feed-planner.BdpqWMJM.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/index.DhqcVaaP.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/index.-Ufze9Hw.css" />
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/terms.ByCvOR8Z.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/bio-generator.CqMFwn70.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/tweet-generator.Ck_8KqI8.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/emoji-translator.B1x-6UvQ.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/emoji-translator.SPiFSgxe.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/tiktok-hashtag-generator.DTPirgLh.js"
			/>
			<link
				rel="stylesheet"
				href="https://pallyy.com/_nuxt/tiktok-hashtag-generator.CbHP-B7V.css"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/free-trial.DIT-JXRz.js"
			/>
			<link
				rel="modulepreload"
				as="script"
				crossOrigin=""
				href="https://pallyy.com/_nuxt/privacy.CeqAKCtb.js"
			/>
			<link rel="stylesheet" href="https://pallyy.com/_nuxt/privacy.BVNra7zl.css" />
			<div id="__nuxt">
				<div>
					<div
						className="site-header"
						id="site-header"
						role="banner"
						data-v-c4b7758e=""
						style={{ borderBottom: "1px solid transparent" }}
					>
						<a href="/" className="" aria-label="Home" data-v-c4b7758e="">
							<img
								src="/img/logo/black-full.svg"
								alt="Pallyy - Social Media Management Platform"
								height={26}
								width={80}
								data-v-c4b7758e=""
							/>
						</a>
						<nav aria-label="Main" data-v-c4b7758e="">
							<button
								type="button"
								aria-expanded="false"
								aria-label="Menu"
								aria-controls="menu"
								data-v-c4b7758e=""
							>
								<svg width={24} height={24} aria-hidden="true" data-v-c4b7758e="">
									<path
										d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
										data-v-c4b7758e=""
									/>
								</svg>
							</button>
							<ul className="nav all-center" id="menu" data-v-c4b7758e="">
								<li data-v-c4b7758e="">
									<a
										href="/social-media-scheduling"
										className=""
										data-v-c4b7758e=""
									>
										Scheduling
									</a>
								</li>
								<li data-v-c4b7758e="">
									<a
										href="/analytics"
										className="router-link-active router-link-exact-active"
										data-v-c4b7758e=""
										aria-current="page"
									>
										Analytics
									</a>
								</li>
								<li data-v-c4b7758e="">
									<a href="/social-media-inbox" className="" data-v-c4b7758e="">
										Inbox
									</a>
								</li>
								<li data-v-c4b7758e="">
									<a href="/teams" className="" data-v-c4b7758e="">
										Teams
									</a>
								</li>
								<li data-v-c4b7758e="">
									<a href="/pricing" className="" data-v-c4b7758e="">
										Pricing
									</a>
								</li>
								<li data-v-c4b7758e="">
									<a href="https://app.pallyy.com/login" data-v-c4b7758e="">
										Login
									</a>
								</li>
							</ul>
							<a
								href="https://app.pallyy.com/register"
								className="button"
								data-type="secondary"
								data-v-c4b7758e=""
							>
								Get Started
							</a>
						</nav>
					</div>
					<main>
						{/*[*/}
						<div className="">
							<header data-v-27946aae="" className="hero">
								<div data-v-27946aae="" className="wrapper all-center flow">
									<h1 data-v-27946aae="">
										Track Your Social Media Analytics Easier Than Ever.
									</h1>
									<p data-v-27946aae="">
										See the content that resonates with your audience, and make more
										of it with our social media analytics suite.
									</p>
									<div data-v-27946aae="" className="cluster flex-justify-center">
										<a
											data-v-27946aae=""
											href="https://app.pallyy.com/register"
											className="button hero__button"
											data-type="primary"
										>
											Get started for free
										</a>
									</div>
									<div
										data-v-84794759=""
										data-v-27946aae=""
										className="all-center flow"
									>
										<p data-v-84794759="" className="usedby__title">
											Trusted daily by growing brands and agencies around the world
											including:
										</p>
										<div
											data-v-84794759=""
											className="cluster flex-justify-center flex-align-center"
										>
											<img
												data-v-84794759=""
												className="used-by-logo anytimefitness"
												alt="Used by Anytime Fitness logo"
												width={216}
												height={58}
												src="/img/usedby/anytime.avif"
												sizes="110px"
											/>
											<img
												data-v-84794759=""
												className="used-by-logo mantra"
												alt="Used by Mantra logo"
												width={260}
												height={66}
												src="/img/usedby/mantra.avif"
												sizes="110px"
											/>
											<img
												data-v-84794759=""
												className="used-by-logo lj-hooker"
												alt="Used by LJ Hooker logo"
												width={252}
												height={50}
												src="/img/usedby/ljhooker.avif"
												sizes="110px"
											/>
										</div>
									</div>
									<picture data-v-27946aae="">
										<source
											data-v-27946aae=""
											media="(max-width: 768px)"
											width={1000}
											height={1000}
											srcSet="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.pnghttps://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1428 1428w"
										/>
										<img
											data-v-27946aae=""
											src="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?w=400"
											srcSet="https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.pnghttps://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/263c3482-1ebd-4c6b-9faf-29980cfb7af2_analytics.png?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 1600px) 80vw, (min-width: 1300px) 90vw, calc(100vw - 40px)"
											height={652}
											width={1000}
											alt="Track Your Social Media Analytics Easier Than Ever."
											className="hero__image"
										/>
									</picture>
								</div>
							</header>
							<div className="section bg-purple border-top-purple border-bottom-purple">
								<div className="wrapper all-center flow">
									<p>SOCIAL MEDIA ANALYTICS</p>
									<h2>
										Integrated &amp; approved by Instagram, Facebook, Twitter &amp;
										LinkedIn.
									</h2>
									<div data-v-17b93431="" className="cluster flex-justify-center">
										<div data-v-17b93431="">
											<blockquote data-v-17b93431="">
												<p data-v-17b93431="" className="review">
													"Hands down the best social media scheduling platform! We
													will honestly never go back to any other. Pally is a
													social media managers best friend!"
												</p>
											</blockquote>
											<img
												data-v-17b93431=""
												className="author-image"
												src="https://images.prismic.io/smi-blog/725ef1b8-676f-4f21-9b85-868555bf1b6d_209611855_165384012289753_2314896053817562885_n.jpg?auto=compress,format&w=50&dpr=2"
												alt="Profile picture for Kamara & Bianca from Glow Up Agency"
												loading="lazy"
											/>
											<cite data-v-17b93431="">
												<strong data-v-17b93431="">Kamara &amp; Bianca</strong>
											</cite>
											<div data-v-17b93431="">
												<small data-v-17b93431="">Glow Up Agency</small>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div data-v-83758fc7="" className="section bg-off-white">
								<div data-v-83758fc7="" className="wrapper all-center flow">
									<div data-v-83758fc7="" className="feature">
										<div data-v-83758fc7="" className="left flow">
											<p
												data-v-83758fc7=""
												className="feature__count flex-justify-center flex-align-center"
											>
												<strong data-v-83758fc7="">1</strong>
											</p>
											<p data-v-83758fc7="">
												<small data-v-83758fc7="">
													<strong data-v-83758fc7="" />
												</small>
											</p>
											<h2 data-v-83758fc7="">Create beatiful custom reports.</h2>
											<p data-v-83758fc7="" className="feature__description">
												Use the reports builder to create, share &amp; export custom
												analytics reports. Great for sending directly to your
												clients!
											</p>
											{/**/}
										</div>
										<img
											data-v-83758fc7=""
											src="https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?w=400"
											srcSet="https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,formathttps://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/e872ffd2-dcd6-4212-bf42-0f63ff0c2352_Untitled+%2896%29.png?auto=compress,format?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 768px) 50vw, 80vw"
											height={750}
											width={750}
											loading="lazy"
											alt="Social Media Analytics - Reports"
											className="border-black feature__image"
										/>
									</div>
								</div>
							</div>
							<div data-v-83758fc7="" className="section bg-off-white">
								<div data-v-83758fc7="" className="wrapper all-center flow">
									<div data-v-83758fc7="" className="feature">
										<div data-v-83758fc7="" className="left flow">
											<p
												data-v-83758fc7=""
												className="feature__count flex-justify-center flex-align-center"
											>
												<strong data-v-83758fc7="">2</strong>
											</p>
											<p data-v-83758fc7="">
												<small data-v-83758fc7="">
													<strong data-v-83758fc7="" />
												</small>
											</p>
											<h2 data-v-83758fc7="">Look back into the past.</h2>
											<p data-v-83758fc7="" className="feature__description">
												Look back at your analytics to see what worked for your
												socials in the past.
											</p>
											{/**/}
										</div>
										<img
											data-v-83758fc7=""
											src="https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?w=400"
											srcSet="https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,formathttps://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/5c40338a-d9dc-49e0-a86f-a3696ec6c171_historical+social+media+analytics.png?auto=compress,format?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 768px) 50vw, 80vw"
											height={750}
											width={750}
											loading="lazy"
											alt="Social Media Analytics - Historical Data"
											className="border-black feature__image"
										/>
									</div>
								</div>
							</div>
							<div data-v-83758fc7="" className="section bg-off-white">
								<div data-v-83758fc7="" className="wrapper all-center flow">
									<div data-v-83758fc7="" className="feature">
										<div data-v-83758fc7="" className="left flow">
											<p
												data-v-83758fc7=""
												className="feature__count flex-justify-center flex-align-center"
											>
												<strong data-v-83758fc7="">3</strong>
											</p>
											<p data-v-83758fc7="">
												<small data-v-83758fc7="">
													<strong data-v-83758fc7="" />
												</small>
											</p>
											<h2 data-v-83758fc7="">Compare to previous periods.</h2>
											<p data-v-83758fc7="" className="feature__description">
												Compare your performance with another period to see how fast
												you're growing.
											</p>
											{/**/}
										</div>
										<img
											data-v-83758fc7=""
											src="https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?w=400"
											srcSet="https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,formathttps://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/0b913f72-20f2-4b08-8832-b1e13b0fa672_compare+social+media+analytics.png?auto=compress,format?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 768px) 50vw, 80vw"
											height={750}
											width={750}
											loading="lazy"
											alt="Social Media Analytics - Compare Previus Periods"
											className="border-black feature__image"
										/>
									</div>
								</div>
							</div>
							<div data-v-83758fc7="" className="section bg-off-white">
								<div data-v-83758fc7="" className="wrapper all-center flow">
									<div data-v-83758fc7="" className="feature">
										<div data-v-83758fc7="" className="left flow">
											<p
												data-v-83758fc7=""
												className="feature__count flex-justify-center flex-align-center"
											>
												<strong data-v-83758fc7="">4</strong>
											</p>
											<p data-v-83758fc7="">
												<small data-v-83758fc7="">
													<strong data-v-83758fc7="" />
												</small>
											</p>
											<h2 data-v-83758fc7="">Share performance reports.</h2>
											<p data-v-83758fc7="" className="feature__description">
												Share a quick performance report with your clients so they
												can see the great work you've done. Instagram only, more
												coming soon!
											</p>
											{/**/}
										</div>
										<img
											data-v-83758fc7=""
											src="https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?w=400"
											srcSet="https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,formathttps://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/05e83d7d-0fc1-4140-8d44-049e84f4433e_social+media+analytics+reports.png?auto=compress,format?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 768px) 50vw, 80vw"
											height={750}
											width={750}
											loading="lazy"
											alt="Social Media Analytics - Share Performance Reports"
											className="border-black feature__image"
										/>
									</div>
								</div>
							</div>
							<div data-v-83758fc7="" className="section bg-off-white">
								<div data-v-83758fc7="" className="wrapper all-center flow">
									<div data-v-83758fc7="" className="feature">
										<div data-v-83758fc7="" className="left flow">
											<p
												data-v-83758fc7=""
												className="feature__count flex-justify-center flex-align-center"
											>
												<strong data-v-83758fc7="">5</strong>
											</p>
											<p data-v-83758fc7="">
												<small data-v-83758fc7="">
													<strong data-v-83758fc7="" />
												</small>
											</p>
											<h2 data-v-83758fc7="">Day, week &amp; month intervals.</h2>
											<p data-v-83758fc7="" className="feature__description">
												Change how you view your data to get a better overview of
												how you've progressed over time.
											</p>
											{/**/}
										</div>
										<img
											data-v-83758fc7=""
											src="https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?w=400"
											srcSet="https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,formathttps://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=200 200w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=228 228w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=260 260w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=296 296w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=338 338w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=385 385w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=439 439w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=500 500w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=571 571w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=650 650w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=741 741w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=845 845w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=964 964w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=1098 1098w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=1252 1252w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=1428 1428w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=1600 1600w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=2000 2000w, https://images.prismic.io/smi-blog/ece64319-c66f-4360-a7d8-e35065b1e514_social+media+analytics+intervals.png?auto=compress,format?auto=compress,format&w=2400 2400w"
											sizes="(min-width: 768px) 50vw, 80vw"
											height={750}
											width={750}
											loading="lazy"
											alt="Social Media Analytics - Intervals"
											className="border-black feature__image"
										/>
									</div>
								</div>
							</div>
							<div
								data-v-14aa054d=""
								className="section bg-purple border-top-purple border-bottom-purple"
							>
								<div data-v-14aa054d="" className="wrapper all-center flow">
									<div data-v-14aa054d="" className="all-center flow">
										<h2 data-v-14aa054d="">
											Level up your social media analytics with Pallyy
										</h2>
										<p data-v-14aa054d="">
											Getting started is fast, easy &amp; free. Just sign up,
											connect your profiles, and start checking your analytics.
										</p>
										<a
											data-v-14aa054d=""
											href="https://app.pallyy.com/register"
											className="button hero__button"
											data-type="primary"
										>
											Get started for free
										</a>
									</div>
								</div>
							</div>
							<div
								data-v-64a653ea=""
								className="section bg-off-white border-bottom-black"
							>
								<div data-v-64a653ea="" className="wrapper all-center flow">
									<h2 data-v-64a653ea="">Frequently Asked Questions</h2>
									<div data-v-64a653ea="" className="faq-item">
										<div data-v-64a653ea="" className="faq-question">
											<h3 data-v-64a653ea="">
												Can Pallyy track analytics for Instagram personal profiles?
											</h3>
										</div>
										<div data-v-64a653ea="" className="faq-answer">
											<p data-v-64a653ea="">
												Unfortunately due to Instagram's API, we can only track
												business profiles at this stage.
											</p>
										</div>
									</div>
									<div data-v-64a653ea="" className="faq-item">
										<div data-v-64a653ea="" className="faq-question">
											<h3 data-v-64a653ea="">
												Can Pallyy track analytics for LinkedIn personal profiles?
											</h3>
										</div>
										{/**/}
									</div>
									<div data-v-64a653ea="" className="faq-item">
										<div data-v-64a653ea="" className="faq-question">
											<h3 data-v-64a653ea="">Can I check my analytics for free?</h3>
										</div>
										{/**/}
									</div>
								</div>
							</div>
						</div>
						{/*]*/}
					</main>
					<footer className="section" data-v-7faddbe4="">
						<div className="wrapper" data-v-7faddbe4="">
							<div className="footer-grid" data-v-7faddbe4="">
								<div data-v-7faddbe4="">
									<p className="footer-grid-heading" data-v-7faddbe4="">
										Company
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a href="/" className="" data-v-7faddbe4="">
												Home
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/pricing" className="" data-v-7faddbe4="">
												Pricing
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/reviews" className="" data-v-7faddbe4="">
												Reviews
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://pallyy.getrewardful.com/signup"
												target="_blank"
												data-v-7faddbe4=""
											>
												Affiliates
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/blog" className="" data-v-7faddbe4="">
												Blog
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/learn" className="" data-v-7faddbe4="">
												Learn
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://help.pallyy.com"
												target="_blank"
												data-v-7faddbe4=""
											>
												Help
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="https://app.pallyy.com/register" data-v-7faddbe4="">
												Sign Up
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="https://app.pallyy.com/login" data-v-7faddbe4="">
												Login
											</a>
										</li>
									</ul>
								</div>
								<div data-v-7faddbe4="">
									<p className="footer-grid-heading" data-v-7faddbe4="">
										<a
											href="/social-media-scheduling"
											className="footer-grid-heading-link"
											data-v-7faddbe4=""
										>
											Scheduling
										</a>
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/instagram"
												className=""
												data-v-7faddbe4=""
											>
												Instagram
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/facebook"
												className=""
												data-v-7faddbe4=""
											>
												Facebook
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/twitter"
												className=""
												data-v-7faddbe4=""
											>
												Twitter
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/linkedin"
												className=""
												data-v-7faddbe4=""
											>
												LinkedIn
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/google-my-business"
												className=""
												data-v-7faddbe4=""
											>
												Google My Business
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/pinterest"
												className=""
												data-v-7faddbe4=""
											>
												Pinterest
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/tiktok"
												className=""
												data-v-7faddbe4=""
											>
												Tiktok
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/social-media-scheduling/views"
												className=""
												data-v-7faddbe4=""
											>
												Views
											</a>
										</li>
									</ul>
									<p className="footer-grid-heading" data-v-7faddbe4="">
										<a
											href="/tools"
											className="footer-grid-heading-link"
											data-v-7faddbe4=""
										>
											Free Tools
										</a>
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a
												href="/tools/image-caption-generator"
												className=""
												data-v-7faddbe4=""
											>
												Image Caption Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/instagram-caption-generator"
												className=""
												data-v-7faddbe4=""
											>
												Caption Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/twitter-thread-maker"
												className=""
												data-v-7faddbe4=""
											>
												Twitter Thread Maker
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/tweet-generator"
												className=""
												data-v-7faddbe4=""
											>
												Tweet Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/image-description-generator"
												className=""
												data-v-7faddbe4=""
											>
												Image Description Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/bio-generator"
												className=""
												data-v-7faddbe4=""
											>
												Bio Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/emoji-translator"
												className=""
												data-v-7faddbe4=""
											>
												Emoji Translator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/tools/tiktok-hashtag-generator"
												className=""
												data-v-7faddbe4=""
											>
												TikTok Hashtag Generator
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://threadcreator.com/?utm_source=pallyy"
												target="_blank"
												data-v-7faddbe4=""
											>
												Schedule Twitter Threads
											</a>
										</li>
									</ul>
								</div>
								<div data-v-7faddbe4="">
									<p className="footer-grid-heading" data-v-7faddbe4="">
										<a
											href="/analytics"
											className="router-link-active router-link-exact-active footer-grid-heading-link"
											data-v-7faddbe4=""
											aria-current="page"
										>
											Analytics
										</a>
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a
												href="/analytics/instagram"
												className=""
												data-v-7faddbe4=""
											>
												Instagram
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/analytics/facebook" className="" data-v-7faddbe4="">
												Facebook
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/analytics/linkedin" className="" data-v-7faddbe4="">
												LinkedIn
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/analytics/reports" className="" data-v-7faddbe4="">
												Reports{" "}
												<span className="new" data-v-7faddbe4="">
                      new
                    </span>
											</a>
										</li>
									</ul>
									<p className="footer-grid-heading" data-v-7faddbe4="">
										More Features
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a href="/teams" className="" data-v-7faddbe4="">
												Teams
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/social-media-inbox" className="" data-v-7faddbe4="">
												Social Media Inbox{" "}
												<span className="new" data-v-7faddbe4="">
                      new
                    </span>
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/instagram-bio-link" className="" data-v-7faddbe4="">
												Instagram Bio Link
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="/instagram-feed-planner"
												className=""
												data-v-7faddbe4=""
											>
												Instagram Feed Planner
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/free-trial" className="" data-v-7faddbe4="">
												Free 14 Day Trial
											</a>
										</li>
									</ul>
								</div>
								<div data-v-7faddbe4="">
									<p className="footer-grid-heading" data-v-7faddbe4="">
										Keep in touch
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a href="mailto:hey@pallyy.com" data-v-7faddbe4="">
												Contact
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://twitter.com/pallyysocial"
												target="_blank"
												rel="noopener"
												data-v-7faddbe4=""
											>
												Twitter
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://instagram.com/pallyysocial"
												target="_blank"
												rel="noopener"
												data-v-7faddbe4=""
											>
												Instagram
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://www.producthunt.com/posts/pallyy"
												target="_blank"
												rel="noopener"
												data-v-7faddbe4=""
											>
												ProductHunt
											</a>
										</li>
									</ul>
									<p className="footer-grid-heading" data-v-7faddbe4="">
										More
									</p>
									<ul className="footer-ul" data-v-7faddbe4="">
										<li data-v-7faddbe4="">
											<a href="/compare" className="" data-v-7faddbe4="">
												Compare
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://pallyy.canny.io/changelog"
												target="_blank"
												rel="noopener"
												data-v-7faddbe4=""
											>
												Changelog
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a
												href="https://pallyy.canny.io"
												target="_blank"
												rel="noopener"
												data-v-7faddbe4=""
											>
												Roadmap
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/terms" className="" data-v-7faddbe4="">
												Terms
											</a>
										</li>
										<li data-v-7faddbe4="">
											<a href="/privacy" className="" data-v-7faddbe4="">
												Privacy
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</footer>
					{/**/}
				</div>
			</div>
			<wtd-root id="cashback" />
			<wtd-div
				id="wanteeedContainer"
				style={{
					position: "fixed",
					display: "block",
					top: 0,
					right: 0,
					zIndex: 2147483647
				}}
			>
				<wtd-root id="comparator" />
				<iframe
					id="wanteeedPanel"
					data-version="1.177.0"
					allowTransparency="true"
					style={{
						backgroundColor: "rgb(255, 255, 255)",
						border: "medium",
						borderRadius: 3,
						boxShadow: "rgb(181, 181, 181) 1px 1px 3px 2px",
						clip: "auto",
						display: "none",
						marginLeft: "auto",
						marginRight: 12,
						marginTop: 12,
						position: "relative",
						zIndex: 2147483647,
						height: 1,
						width: 1
					}}
				/>
			</wtd-div>
		</>

	)
}
