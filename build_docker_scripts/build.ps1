# Initialize the hashtable to store environment variables
$envVars = @{}

# Load .env file and parse it
$envFile = Get-Content -Path ".env"
$envFile | ForEach-Object {
    if ($_ -match "^\s*#") { return } # Skip comments
    if ($_ -match "^\s*$") { return } # Skip empty lines
    $name, $value = $_ -split "=", 2
    $value = $value.Trim("`"", " ") # Trim quotes and spaces
    $envVars[$name] = $value
}

# Construct Docker build command with build arguments
$buildArgs = @()
foreach ($key in $envVars.Keys) {
    $buildArgs += "--build-arg $key=$($envVars[$key])"
}

# Join the build arguments into a single string
$buildArgsString = $buildArgs -join " "

# Execute the Docker build command
Invoke-Expression "docker build $buildArgsString -f Dockerfile.test -t my-app:test ."
