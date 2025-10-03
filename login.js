// Tab switching functionality
const tabs = document.querySelectorAll('.auth-tab');
const contents = document.querySelectorAll('.auth-content');
const cameraIcon = document.getElementById('camera-icon');
const cameraView = document.getElementById('camera-view');
const cameraContainer = document.getElementById('camera-container');
const scannerStatus = document.getElementById('scanner-status');
const permissionRequest = document.getElementById('permissionRequest');
const enableCameraBtn = document.getElementById('enableCamera');
const userAgreementCheckbox = document.getElementById('userAgreement');
const signInBtn = document.getElementById('signInBtn');
const showAgreementBtn = document.getElementById('showAgreement');
const agreementModal = document.getElementById('agreementModal');
const closeModalBtn = document.querySelector('.close-modal');
const cancelModalBtn = document.querySelector('.modal-btn.cancel');
const agreeModalBtn = document.querySelector('.modal-btn.agree');

let stream = null;
let scanInterval = null;
let hasCameraAccess = false;

// Check if the browser supports camera access
function checkCameraSupport() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Show permission request if camera is not accessible
function showPermissionRequest() {
    permissionRequest.style.display = 'block';
}

// Hide permission request
function hidePermissionRequest() {
    permissionRequest.style.display = 'none';
}

// Toggle sign in button based on agreement checkbox
userAgreementCheckbox.addEventListener('change', function() {
    signInBtn.disabled = !this.checked;
});

// Show agreement modal
showAgreementBtn.addEventListener('click', function() {
    agreementModal.style.display = 'flex';
});

// Close agreement modal
function closeAgreementModal() {
    agreementModal.style.display = 'none';
}

closeModalBtn.addEventListener('click', closeAgreementModal);
cancelModalBtn.addEventListener('click', closeAgreementModal);

// Agree to terms
agreeModalBtn.addEventListener('click', function() {
    userAgreementCheckbox.checked = true;
    signInBtn.disabled = false;
    closeAgreementModal();
});

// Close modal if clicked outside content
window.addEventListener('click', function(event) {
    if (event.target === agreementModal) {
        closeAgreementModal();
    }
});

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(tabName + 'Auth').classList.add('active');
        
        // If switching away from QR tab, stop the camera
        if (tabName !== 'qr' && stream) {
            stopCamera();
        }
        
        // If switching to QR tab, check camera support
        if (tabName === 'qr' && !checkCameraSupport()) {
            scannerStatus.textContent = 'Camera not supported by your browser';
            showPermissionRequest();
        }
    });
});

// Form submission handling
document.getElementById('emailLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (userAgreementCheckbox.checked) {
        // Redirect to welcome.html after login
        window.location.href = 'welcome.html';
    }
});

// Collapsible section functionality
const collapsibles = document.querySelectorAll('.collapsible');

collapsibles.forEach(button => {
    button.addEventListener('click', function() {
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + 'px';
        }
    });
});

// Camera functionality for QR code scanning
cameraIcon.addEventListener('click', function() {
    if (stream) {
        stopCamera();
    } else {
        startCamera();
    }
});

// Enable camera button
enableCameraBtn.addEventListener('click', startCamera);

// Function to start the camera
function startCamera() {
    scannerStatus.textContent = 'Requesting camera access...';
    hidePermissionRequest();
    
    // Check if browser supports getUserMedia
    if (!checkCameraSupport()) {
        scannerStatus.textContent = 'Camera access not supported by your browser';
        showPermissionRequest();
        return;
    }
    
    // Request camera access
    navigator.mediaDevices.getUserMedia({ 
        video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        },
        audio: false 
    })
    .then(function(videoStream) {
        stream = videoStream;
        cameraView.srcObject = stream;
        cameraContainer.classList.add('camera-active');
        scannerStatus.textContent = 'Camera active - point at your QR code';
        hasCameraAccess = true;
        
        // Start scanning simulation
        startScanning();
    })
    .catch(function(error) {
        console.error('Error accessing camera:', error);
        scannerStatus.textContent = 'Cannot access camera. Please allow camera access.';
        showPermissionRequest();
        
        // Provide specific error messages
        if (error.name === 'NotAllowedError') {
            scannerStatus.textContent = 'Camera access denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
            scannerStatus.textContent = 'No camera found on your device.';
        } else if (error.name === 'NotReadableError') {
            scannerStatus.textContent = 'Camera is already in use by another application.';
        }
    });
}

// Function to stop the camera
function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    if (scanInterval) {
        clearInterval(scanInterval);
        scanInterval = null;
    }
    
    cameraView.srcObject = null;
    cameraContainer.classList.remove('camera-active');
    scannerStatus.textContent = 'Click the camera icon to start scanning';
    hasCameraAccess = false;
}

// Simulate QR code scanning
function startScanning() {
    let scanAttempts = 0;
    
    scanInterval = setInterval(() => {
        scanAttempts++;
        
        // Simulate QR code detection after 3 attempts
        if (scanAttempts === 3) {
            scannerStatus.textContent = 'QR code detected! Logging in...';
            
            // Simulate successful login after 1.5 seconds
            setTimeout(() => {
                stopCamera();
                // Redirect to welcome page
                window.location.href = 'welcome.html';
            }, 1500);
            
            clearInterval(scanInterval);
        }
    }, 1000);
}

// Stop camera when switching tabs or leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stopCamera();
    }
});

// Check camera support on page load
window.addEventListener('load', () => {
    if (!checkCameraSupport()) {
        const qrTab = document.querySelector('[data-tab="qr"]');
        qrTab.addEventListener('click', () => {
            scannerStatus.textContent = 'Camera not supported by your browser';
            showPermissionRequest();
        });
    }
});