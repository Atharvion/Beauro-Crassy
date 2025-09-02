        let stream;
        let photoBlob;
        let locationData = {};

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

        // Simple reverse geocoding (you might want to use a proper service)
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
                    createCertificateModal(issueDescription, complaintId, fileNumber, referenceNumber);
                    showStatus('Official complaint certificate generated successfully!', 'success');
                } catch (error) {
                    console.error('Error creating certificate:', error);
                    showStatus('Error generating certificate: ' + error.message, 'error');
                }
            }, 1500);
        }

        function createCertificateModal(issue, complaintId, fileNumber, refNumber) {
            console.log('Creating certificate modal...');
            
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

            // Get photo data URL - check if canvas has image data
            let photoDataUrl = '';
            try {
                photoDataUrl = elements.canvas.toDataURL('image/jpeg', 0.6);
                console.log('Photo data URL created successfully');
            } catch (error) {
                console.error('Error creating photo data URL:', error);
                photoDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
            }
            
            const locationAddress = locationData.address || `GPS: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
            
            const certificateHTML = `
                <div class="certificate-overlay" onclick="closeCertificate()">
                    <div class="certificate" onclick="event.stopPropagation()">
                        <div class="cert-header">
                            <div class="govt-emblem"><img src="National-Emblem.png" alt="icon" width="30" height="40"></div>
                            <div class="dept-info">
                                <h1>MINISTRY OF CIVIC SASS</h1>
                                <h2>Department of Bureaucratic Excellence</h2>
                                <h3>Division of Official Complaint Processing</h3>
                                <p class="govt-tagline">सत्यमेव जयते • Truth Alone Triumphs</p>
                            </div>
                            <div class="govt-emblem">📋</div>
                        </div>

                        <div class="cert-title">
                            <h2>OFFICIAL CIVIC COMPLAINT CERTIFICATE</h2>
                            <div class="cert-subtitle">
                                (Under the Beauro-crassy Act, 2025)
                            </div>
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

                            <div class="Politicians-Photo">
                                <img src="Politicians-Photo.png" alt="Politicians" width="100%" height="auto">
                            </div>

                            <div class="footer-info">
                                <p><strong>Important Notice:</strong> This certificate is generated automatically by Beauro-crassy v2.0. 
                                No actual government officials were consulted in the making of this document.</p>
                                <p class="qr-placeholder">📱 QR Code: BC${complaintId.slice(-6)}</p>
                            </div>
                        </div>

                        <div class="cert-actions">
                            <button onclick="downloadCertificate()" class="download-btn">📄 Download Certificate</button>
                            <button onclick="shareCertificate()" class="share-btn">📤 Share Evidence</button>
                            <button onclick="closeCertificate()" class="close-btn">✕ Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('Adding certificate to DOM...');
            document.body.insertAdjacentHTML('beforeend', certificateHTML);
            console.log('Certificate modal created successfully');
        }

        function closeCertificate() {
            const overlay = document.querySelector('.certificate-overlay');
            if (overlay) overlay.remove();
        }

        function downloadCertificate() {
            const cert = document.querySelector('.certificate');
            if (!cert) return;

            // Save old styles
            const oldMaxHeight = cert.style.maxHeight;
            const oldOverflow = cert.style.overflowY;

            // Expand certificate fully
            cert.style.maxHeight = 'none';
            cert.style.overflowY = 'visible';

            html2canvas(cert, { scale: 2, useCORS: true }).then(canvas => {
             // Restore styles
            cert.style.maxHeight = oldMaxHeight;
            cert.style.overflowY = oldOverflow;

            // Download as PNG
            const link = document.createElement('a');
            link.download = 'Beauro-crassy-Certificate.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
    });
}



        function shareCertificate() {
            if (navigator.share) {
                navigator.share({
                    title: 'Beauro-crassy Complaint Certificate',
                    text: 'I officially documented a civic issue!',
                    url: window.location.href
                });
            } else {
                showStatus('Sharing... (copy the URL to share)', 'success');
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
