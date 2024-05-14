const HTTP_EXAMPLE = (
	image,
	context,
	jsonSchema,
	formatJsonSchema
) => `POST /api/describe HTTP/1.1
Host: forvoyez.com
Content-Type: multipart/form-data; boundary=---011000010111000001101001
Authorization: Bearer <user-token>

-----011000010111000001101001
Content-Disposition: form-data; name="image"; filename="${image ? image.name : 'example.jpg'}"
Content-Type: ${image ? image.type : 'image/jpeg'}

${image ? '<binary image data>' : ''}
-----011000010111000001101001
Content-Disposition: form-data; name="data"

{
  "context": "${context || 'No context provided'}",
  "schema": ${formatJsonSchema(jsonSchema)}}
-----011000010111000001101001--`

const CURL_EXAMPLE = (
	image,
	context,
	jsonSchema,
	formatJsonSchema
) => `curl -X POST \\
  'https://forvoyez.com/api/describe' \\
  -H 'Authorization: Bearer <user-token>' \\
  -F 'image=@"${image ? image.name : 'example.jpg'}"' \\
  -F 'data={"context":"${context || 'No context provided'}","schema":${JSON.stringify(JSON.parse(jsonSchema || '{}'))}}'`

const JAVASCRIPT_EXAMPLE = (
	image,
	context,
	jsonSchema,
	formatJsonSchema
) => `const form = new FormData();
form.append('image', ${image ? 'imageFile' : 'null'});
form.append('data', JSON.stringify({
  context: '${context || 'No context provided'}',
  schema: ${formatJsonSchema(jsonSchema)}
}));

fetch('https://forvoyez.com/api/describe', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <user-token>'
  },
  body: form
})
  .then(response => response.json())
  .catch(error => console.error('Error:', error));`

const PHP_EXAMPLE = (image, context, jsonSchema, formatJsonSchema) => `<?php
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://forvoyez.com/api/describe',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS => array(
    'image'=> new CURLFile('${image ? image.name : 'example.jpg'}'),
    'data' => json_encode(array(
      'context' => '${context || 'No context provided'}',
      'schema' => json_decode('${formatJsonSchema(jsonSchema)}')
    ))
  ),
  CURLOPT_HTTPHEADER => array(
    'Authorization: Bearer <user-token>'
  ),
));

$response = curl_exec($curl);
curl_close($curl);
echo $response;`

const PYTHON_EXAMPLE = (image, context, jsonSchema, formatJsonSchema) => {
	const imageFile = image ? `'${image.name}'` : '"example.jpg"'
	const contextValue = context || 'No context provided'
	const schemaValue = formatJsonSchema(jsonSchema)

	return `import requests 
url = 'https://forvoyez.com/api/describe'
files = {
    'image': open(${imageFile}, 'rb'),
}
payload = {
    'data': {
        'context': '${contextValue}',
        'schema': ${schemaValue}
    }
}
headers = {
    'Authorization': 'Bearer <user-token>' 
}

response = requests.post(url, files=files, json=payload, headers=headers)
print(response.json())`
}

export const getPreviewCode = (
	language,
	image,
	context,
	jsonSchema,
	formatJsonSchema
) => {
	switch (language) {
		case 'HTTP':
			return HTTP_EXAMPLE(image, context, jsonSchema, formatJsonSchema)
		case 'cURL':
			return CURL_EXAMPLE(image, context, jsonSchema, formatJsonSchema)
		case 'JavaScript':
			return JAVASCRIPT_EXAMPLE(image, context, jsonSchema, formatJsonSchema)
		case 'PHP':
			return PHP_EXAMPLE(image, context, jsonSchema, formatJsonSchema)
		case 'Python':
			return PYTHON_EXAMPLE(image, context, jsonSchema, formatJsonSchema)
		default:
			return ''
	}
}
