# PowerShell script to install Ollama on Windows

# Check if Ollama is already installed
$ollamaPath = "$env:LOCALAPPDATA\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Write-Host "Ollama is already installed at $ollamaPath" -ForegroundColor Green
} else {
    # Download the latest Ollama installer
    Write-Host "Downloading Ollama installer..." -ForegroundColor Cyan
    $installerUrl = "https://ollama.com/download/ollama-installer.exe"
    $installerPath = "$env:TEMP\ollama-installer.exe"
    
    try {
        Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
        
        # Run the installer
        Write-Host "Running Ollama installer..." -ForegroundColor Cyan
        Start-Process -FilePath $installerPath -Wait
        
        # Check if installation was successful
        if (Test-Path $ollamaPath) {
            Write-Host "Ollama installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "Ollama installation may have failed. Please check and install manually from https://ollama.com" -ForegroundColor Red
        }
    } catch {
        Write-Host "Error downloading or installing Ollama: $_" -ForegroundColor Red
        Write-Host "Please install manually from https://ollama.com" -ForegroundColor Yellow
    }
}

# Check if Ollama service is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Ollama is running correctly!" -ForegroundColor Green
    }
} catch {
    Write-Host "Ollama service is not running. Starting Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath $ollamaPath -WindowStyle Minimized
    Write-Host "Waiting for Ollama to start..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
}

# Pull the Llama3 model
Write-Host "Pulling the Llama3 model (this may take a while)..." -ForegroundColor Cyan
Write-Host "If this is your first time, it will download several GB of data." -ForegroundColor Yellow

try {
    Start-Process -FilePath $ollamaPath -ArgumentList "pull llama3" -PassThru -NoNewWindow
    Write-Host "Model download started in background. You can check progress in the Ollama window." -ForegroundColor Green
    Write-Host "Once completed, restart your application to use Llama3 with your code visualizer." -ForegroundColor Green
} catch {
    Write-Host "Error pulling Llama3 model: $_" -ForegroundColor Red
    Write-Host "Please run 'ollama pull llama3' manually after installation completes." -ForegroundColor Yellow
}

Write-Host "`nSetup complete! Your code visualizer is now configured to use Ollama with Llama3." -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
