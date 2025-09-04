let stream;
let photoBlob;
let locationData = {};
let certificateWindow;

const elements = {
    issueType: document.getElementById('issueType'),
    customIssue: document.getElementById('customIssue'),
    startCamera: document.getElementById('startCamera'),
    capturePhoto: document.getElementById('capturePhoto'),
    retakePhoto: document.getElementById('retakePhoto'),
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    photoPreview: document.getElementById('photoPreview'),
    getLocation: document.getElementById('getLocation'),
    locationInfo: document.getElementById('locationInfo'),
    coordinates: document.getElementById('coordinates'),
    address: document.getElementById('address'),
    generateCert: document.getElementById('generateCert'),
    status: document.getElementById('status')
};

// Issue type selection
elements.issueType.addEventListener('change', function() {
    if (this.value === 'other') {
        elements.customIssue.classList.remove('hidden');
        elements.customIssue.focus();
    } else {
        elements.customIssue.classList.add('hidden');
    }
    checkReadiness();
});

elements.customIssue.addEventListener('input', checkReadiness);

// Camera functionality
elements.startCamera.addEventListener('click', async () => {
    try {
        showStatus('Starting camera...', 'loading');
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        elements.video.srcObject = stream;
        elements.video.style.display = 'block';
        elements.startCamera.classList.add('hidden');
        elements.capturePhoto.classList.remove('hidden');
        showStatus('Camera ready! Position the issue in frame', 'success');
    } catch (error) {
        showStatus('Error accessing camera: ' + error.message, 'error');
    }
});

elements.capturePhoto.addEventListener('click', () => {
    const canvas = elements.canvas;
    const video = elements.video;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob((blob) => {
        photoBlob = blob;
        displayPhoto(canvas.toDataURL());
    }, 'image/jpeg', 0.8);
    
    // Stop camera
    stream.getTracks().forEach(track => track.stop());
    elements.video.style.display = 'none';
    elements.capturePhoto.classList.add('hidden');
    elements.retakePhoto.classList.remove('hidden');
    
    showStatus('Photo captured successfully!', 'success');
    checkReadiness();
});

elements.retakePhoto.addEventListener('click', () => {
    photoBlob = null;
    elements.photoPreview.innerHTML = '';
    elements.retakePhoto.classList.add('hidden');
    elements.startCamera.classList.remove('hidden');
    checkReadiness();
});

function displayPhoto(dataUrl) {
    elements.photoPreview.innerHTML = `<img src="${dataUrl}" alt="Captured photo" class="photo-preview">`;
}

// Location functionality
elements.getLocation.addEventListener('click', () => {
    showStatus('Getting your location...', 'loading');
    
    if (!navigator.geolocation) {
        showStatus('Geolocation not supported by this browser', 'error');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
            };
            
            elements.coordinates.textContent = `${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
            elements.locationInfo.classList.remove('hidden');
            
            // Try to get address
            try {
                const address = await getAddress(locationData.latitude, locationData.longitude);
                elements.address.textContent = address;
                locationData.address = address;
            } catch (error) {
                elements.address.textContent = 'Address lookup failed';
            }
            
            showStatus('Location captured!', 'success');
            checkReadiness();
        },
        (error) => {
            showStatus('Error getting location: ' + error.message, 'error');
        }
    );
});

// Simple reverse geocoding
async function getAddress(lat, lon) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        const data = await response.json();
        return data.display_name || data.locality || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

// Certificate generation
elements.generateCert.addEventListener('click', () => {
    generateCertificate();
});

function generateCertificate() {
    console.log('Generate certificate clicked');
    showStatus('Generating your official complaint certificate...', 'loading');
    
    // Get issue description
    let issueDescription = elements.issueType.value;
    if (issueDescription === 'other') {
        issueDescription = elements.customIssue.value;
    }
    
    console.log('Issue:', issueDescription);
    console.log('Location data:', locationData);
    console.log('Photo blob:', photoBlob);
    
    // Generate complaint ID and other official numbers
    const complaintId = 'BCRC-' + Date.now().toString().slice(-8);
    const fileNumber = 'F/' + Math.floor(Math.random() * 9000 + 1000) + '/2025/CIVIC';
    const referenceNumber = 'REF/MUNI/' + Math.floor(Math.random() * 900000 + 100000);
    
    setTimeout(() => {
        try {
            openCertificateWindow(issueDescription, complaintId, fileNumber, referenceNumber);
            showStatus('Official complaint certificate generated successfully!', 'success');
        } catch (error) {
            console.error('Error creating certificate:', error);
            showStatus('Error generating certificate: ' + error.message, 'error');
        }
    }, 1500);
}

function openCertificateWindow(issue, complaintId, fileNumber, refNumber) {
    console.log('Opening certificate window...');
    
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    
    const timeStr = today.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Get photo data URL
    let photoDataUrl = '';
    try {
        photoDataUrl = elements.canvas.toDataURL('image/jpeg', 0.8);
        console.log('Photo data URL created successfully');
    } catch (error) {
        console.error('Error creating photo data URL:', error);
        photoDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    }
    
    const locationAddress = locationData.address || `GPS: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
    
    // Create certificate HTML content
    const certificateHTML = createCertificateHTML(issue, complaintId, fileNumber, refNumber, dateStr, timeStr, locationAddress, photoDataUrl);
    
    // Open new window and write content
    certificateWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    certificateWindow.document.write(certificateHTML);
    certificateWindow.document.close();
    
    // Wait a moment for content to render, then add functionality
    setTimeout(() => {
        addCertificateWindowFunctions(certificateWindow, complaintId);
        console.log('Certificate populated successfully');
    }, 500);
}

function createCertificateHTML(issue, complaintId, fileNumber, refNumber, dateStr, timeStr, locationAddress, photoDataUrl) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Official Civic Complaint Certificate</title>
    <style>
        /* Certificate Styles - A4 Optimized */
        @page {
            size: A4;
            margin: 0.2in;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            background: white;
            color: #333;
            line-height: 1.4;
        }

        .certificate-page {
            width: 210mm;
            min-height: 297mm;
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            padding: 5mm;
            box-sizing: border-box;
            position: relative;
        }

        /* Header Section */
        .cert-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 12px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 3px;
            margin-bottom: 10px;
        }

        .govt-emblem img {
            filter: brightness(0) invert(1);
        }

        .dept-info h1 {
            font-size: 18px;
            margin: 2px 0;
            font-weight: bold;
        }

        .dept-info h2 {
            font-size: 14px;
            margin: 1px 0;
            font-weight: normal;
        }

        .dept-info h3 {
            font-size: 12px;
            margin: 1px 0;
            font-weight: normal;
            opacity: 0.9;
        }

        .govt-tagline {
            font-size: 10px;
            margin-top: 4px;
            opacity: 0.8;
            font-style: italic;
        }

        /* Title Section */
        .cert-title {
            text-align: center;
            padding: 12px;
            background: #f8f9fa;
            border-bottom: 2px solid #1e3c72;
            margin-bottom: 15px;
        }

        .cert-title h2 {
            font-size: 20px;
            color: #1e3c72;
            margin-bottom: 4px;
            letter-spacing: 1px;
        }

        .cert-subtitle {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }

        /* Body Section */
        .cert-body {
            padding: 0;
        }

        /* Official Stamps */
        .official-stamps {
            display: flex;
            justify-content: space-around;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }

        .stamp {
            background: #dc3545;
            color: white;
            padding: 6px 10px;
            border-radius: 3px;
            text-align: center;
            font-weight: bold;
            font-size: 9px;
            transform: rotate(-5deg);
            margin: 3px;
            border: 1px dashed white;
        }

        .stamp.processed {
            background: #28a745;
            transform: rotate(3deg);
        }

        .stamp.verified {
            background: #007bff;
            transform: rotate(-2deg);
        }

        /* Details Table */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
        }

        .details-table td {
            padding: 4px 8px;
            border-bottom: 1px solid #eee;
        }

        .details-table td:first-child {
            width: 35%;
            color: #666;
        }

        /* Photo Section */
        .photo-section {
            text-align: center;
            margin: 10px 0;
            padding: 8px;
            background: #f8f9fa;
            border-radius: 5px;
        }

        .photo-section h4 {
            color: #1e3c72;
            margin-bottom: 8px;
            font-size: 12px;
        }

        .cert-photo {
            max-width: 120mm;
            max-height: 60mm;
            width: auto;
            height: auto;
            border: 2px solid #1e3c72;
            border-radius: 3px;
            margin-bottom: 5px;
            object-fit: contain;
        }

        .photo-caption {
            font-size: 10px;
            color: #666;
            font-style: italic;
        }

        /* Certification Text */
        .certification-text {
            margin: 10px 0;
            line-height: 1.5;
            text-align: justify;
            font-size: 11px;
        }

        .certification-text p {
            margin-bottom: 8px;
        }

        /* Signatures Section */
        .signatures {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin: 25px 0;
            flex-wrap: wrap;
        }

        .signature-block {
            text-align: center;
            flex: 1;
            min-width: 120px;
            margin: 5px;
        }

        .signature-line {
            height: 1px;
            background: #333;
            margin-bottom: 5px;
            width: 100px;
            margin-left: auto;
            margin-right: auto;
        }

        .signature-block p {
            font-size: 10px;
            color: #666;
            line-height: 1.2;
        }

        .official-seal {
            flex: 0 0 auto;
            margin: 0 15px;
        }

        .seal-circle {
            width: 50px;
            height: 50px;
            border: 2px solid #1e3c72;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            font-weight: bold;
            color: #1e3c72;
            text-align: center;
            line-height: 1;
        }

        /* Politicians Photo */
        .politicians-section {
            text-align: center;
            margin: 8px 0;
        }

        .politicians-photo {
            width: 70%;
            max-height: 40mm;
            object-fit: cover;
            border-radius: 2px;
        }

        /* Footer */
        .footer-info {
            border-top: 1px solid #eee;
            padding-top: 10px;
            font-size: 9px;
            color: #666;
            text-align: center;
            margin-top: 8px;
        }

        .footer-info p {
            margin-bottom: 5px;
        }

        /* Print Styles */
        @media print {
            .certificate-page {
                width: 210mm;
                height: 297mm;
                margin: 0;
                padding: 8mm;
                page-break-after: avoid;
            }
            
            body {
                background: white;
            }
            
            .cert-photo {
                max-height: 50mm;
            }
            
            .politicians-photo {
                max-height: 35mm;
            }

            .action-buttons {
                display: none !important;
            }
        }

        /* Screen View */
        @media screen {
            body {
                background: #f5f5f5;
                padding: 10px;
            }
            
            .certificate-page {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <div class="certificate-page" id="certificateContent">
        <div class="cert-header">
            <div class="govt-emblem">
                <img src="National-Emblem.png" alt="Government Emblem" width="50" height="65">
            </div>
            <div class="dept-info">
                <h1>MINISTRY OF CIVIC SASS</h1>
                <h2>Department of Bureaucratic Excellence</h2>
                <h3>Division of Official Complaint Processing</h3>
                <p class="govt-tagline">सत्यमेव जयते • Truth Alone Triumphs</p>
            </div>
            <div class="govt-emblem">
                <img src="digital-india.png" alt="Digital India" width="75" height="65">
            </div>
        </div>

        <div class="cert-title">
            <h2>OFFICIAL CIVIC COMPLAINT CERTIFICATE</h2>
            <div class="cert-subtitle">(Under the Beauro-crassy Act, 2025)</div>
        </div>

        <div class="cert-body">
            <div class="official-stamps">
                <div class="stamp received">RECEIVED<br><small>${dateStr}</small></div>
                <div class="stamp processed">PROCESSED<br><small>${timeStr}</small></div>
                <div class="stamp verified">VERIFIED<br><small>PHOTO ATTACHED</small></div>
            </div>

            <div class="complaint-details">
                <table class="details-table">
                    <tr><td><strong>Complaint ID:</strong></td><td>${complaintId}</td></tr>
                    <tr><td><strong>File Number:</strong></td><td>${fileNumber}</td></tr>
                    <tr><td><strong>Reference Number:</strong></td><td>${refNumber}</td></tr>
                    <tr><td><strong>Issue Type:</strong></td><td>${issue.toUpperCase()}</td></tr>
                    <tr><td><strong>Date of Complaint:</strong></td><td>${dateStr} at ${timeStr}</td></tr>
                    <tr><td><strong>Location:</strong></td><td>${locationAddress}</td></tr>
                    <tr><td><strong>Coordinates:</strong></td><td>${locationData.latitude.toFixed(6)}°N, ${locationData.longitude.toFixed(6)}°E</td></tr>
                    <tr><td><strong>Status:</strong></td><td>OFFICIALLY DOCUMENTED</td></tr>
                </table>
            </div>

            <div class="photo-section">
                <h4>PHOTOGRAPHIC EVIDENCE</h4>
                <img src="${photoDataUrl}" alt="Complaint Evidence" class="cert-photo">
                <p class="photo-caption">Exhibit A: Documented civic issue requiring immediate attention</p>
            </div>

            <div class="certification-text">
                <p>This is to certify that the above-mentioned civic issue has been <strong>OFFICIALLY DOCUMENTED</strong> 
                and submitted to the relevant authorities through the Beauro-crassy platform. 
                This certificate serves as proof of complaint registration and civic duty fulfillment.</p>
                
                <p><em>"Your complaint has been registered in our system. Please allow 6-8 weeks for processing, 
                followed by 12-16 weeks for review, and an additional 20-24 weeks for committee evaluation."</em></p>
            </div>

            <div class="signatures">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p><strong>Digital Signature</strong><br>
                    Chief Complaint Officer<br>
                    Beauro-crassy Division</p>
                </div>
                <div class="official-seal">
                    <div class="seal-circle">
                        <div class="seal-text">OFFICIAL<br>SEAL<br>2025</div>
                    </div>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p><strong>Counter Signature</strong><br>
                    Deputy Minister of Civic Affairs<br>
                    Government of Beauro-crassy</p>
                </div>
            </div>

            <div class="politicians-section">
                <img src="Politicians-Photo.png" alt="Government Officials" class="politicians-photo">
            </div>

            <div class="footer-info">
                <p><strong>Important Notice:</strong> This certificate is generated automatically by Beauro-crassy v2.0. 
                No actual government officials were consulted in the making of this document.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
}

function addCertificateWindowFunctions(certWindow, complaintId) {
    // Add download button functionality
    const downloadButton = certWindow.document.createElement('button');
    downloadButton.textContent = '📄 Download PDF';
    downloadButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    downloadButton.addEventListener('click', function() {
        generatePDF(certWindow, complaintId);
    });
    
    // Add print button
    const printButton = certWindow.document.createElement('button');
    printButton.textContent = '🖨️ Print';
    printButton.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    printButton.addEventListener('click', function() {
        certWindow.print();
    });
    
    // Add close button
    const closeButton = certWindow.document.createElement('button');
    closeButton.textContent = '✕ Close';
    closeButton.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: #6c757d;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    closeButton.addEventListener('click', function() {
        certWindow.close();
    });
    
    certWindow.document.body.appendChild(downloadButton);
    certWindow.document.body.appendChild(printButton);
    certWindow.document.body.appendChild(closeButton);
}

async function generatePDF(certWindow, complaintId) {
    try {
        // Import html2canvas and jsPDF in the certificate window
        const script1 = certWindow.document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        
        const script2 = certWindow.document.createElement('script');
        script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        
        certWindow.document.head.appendChild(script1);
        certWindow.document.head.appendChild(script2);
        
        // Wait for scripts to load
        await new Promise((resolve) => {
            let loaded = 0;
            script1.onload = () => { loaded++; if (loaded === 2) resolve(); };
            script2.onload = () => { loaded++; if (loaded === 2) resolve(); };
        });
        
        // Hide buttons temporarily
        const buttons = certWindow.document.querySelectorAll('button');
        buttons.forEach(btn => btn.style.display = 'none');
        
        // Generate PDF with compact settings
        const certificateElement = certWindow.document.getElementById('certificateContent');
        const canvas = await certWindow.html2canvas(certificateElement, {
            scale: 1.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: 1123,
            scrollX: 0,
            scrollY: 0,
            windowWidth: 794,
            windowHeight: 1123,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png', 0.95);
        const { jsPDF } = certWindow.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Use very minimal margins for maximum content
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 1;
        
        const imgWidth = pageWidth - (2 * margin);
        const imgHeight = pageHeight - (2 * margin);
        
        // Add image with minimal margins
        pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        
        // Download PDF
        const filename = `Beauro-Crassy-Certificate-${complaintId}.pdf`;
        pdf.save(filename);
        
        // Restore buttons
        buttons.forEach(btn => btn.style.display = 'block');
        
        console.log('PDF downloaded successfully');
        
    } catch (error) {
        console.error('PDF generation error:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

function checkReadiness() {
    const hasIssue = elements.issueType.value && (elements.issueType.value !== 'other' || elements.customIssue.value.trim());
    const hasPhoto = photoBlob !== null;
    const hasLocation = locationData.latitude !== undefined;
    
    elements.generateCert.disabled = !(hasIssue && hasPhoto && hasLocation);
}

function showStatus(message, type) {
    elements.status.innerHTML = `<div class="status ${type}">${message}</div>`;
    setTimeout(() => {
        if (type !== 'error') {
            elements.status.innerHTML = '';
        }
    }, 3000);
}