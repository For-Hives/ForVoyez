import { getPreviewCode } from '@/components/Playground/GetPreviewCode'

// The request shown in the landing "Developer API" card: an image, a language
// and a custom schema. Short field descriptions keep each line of the command
// readable on a desktop without scrolling.
export const DEVELOPERS_SAMPLE_REQUEST = {
	jsonSchema: JSON.stringify({ alt: 'Short alt text', caption: 'One-line caption' }),
	languageToTranslate: 'fr',
}

// Built by the playground's generator (its cURL sample is executed in the unit
// tests), so the landing never shows a command the API would refuse.
export function getDevelopersSampleCode() {
	return getPreviewCode('cURL', DEVELOPERS_SAMPLE_REQUEST)
}
