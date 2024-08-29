let recordButton = document.getElementById('recordButton');
let stopButton = document.getElementById('stopButton');
let retakeButton = document.getElementById('retakeButton');
let uploadButton = document.getElementById('uploadButton');
let audioPlayback = document.getElementById('audioPlayback');
let timer = document.getElementById('timer');

let chunks = [];
let recorder;
let audioBlob;
let startTime;
let timerInterval;

navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        recorder = new MediaRecorder(stream);

        recorder.ondataavailable = e => {
            chunks.push(e.data);
        };

        recorder.onstop = e => {
            audioBlob = new Blob(chunks, { type: 'audio/webm' });
            chunks = [];
            let audioURL = URL.createObjectURL(audioBlob);
            audioPlayback.src = audioURL;
        };

        recordButton.addEventListener('click', () => {
            recorder.start();
            startTimer();
            recordButton.disabled = true;
            stopButton.disabled = false;
            retakeButton.disabled = true;
            uploadButton.disabled = true;
            audioPlayback.src = '';
        });

        stopButton.addEventListener('click', () => {
            recorder.stop();
            stopTimer();
            stopButton.disabled = true;
            recordButton.disabled = false;
            retakeButton.disabled = false;
            uploadButton.disabled = false;
        });

        retakeButton.addEventListener('click', () => {
            audioPlayback.src = '';
            resetTimer();
            recordButton.disabled = false;
            stopButton.disabled = true;
            retakeButton.disabled = true;
            uploadButton.disabled = true;
        });

        uploadButton.addEventListener('click', () => {
            if (audioBlob) {
                let formData = new FormData();
                formData.append('audioFile', audioBlob, 'recording.webm');

                fetch('upload.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.text())
                .then(data => {
                    alert('Upload successful: ' + data);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    alert('Upload failed.');
                });
            }
        });
    })
    .catch(err => console.error('Error accessing microphone: ' + err));

// Timer functions
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    timer.innerText = '00:00';
}

function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    timer.innerText = '00:00';
}

function updateTimer() {
    let elapsedTime = Date.now() - startTime;
    let seconds = Math.floor((elapsedTime / 1000) % 60);
    let minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);

    // Format minutes and seconds as MM:SS
    timer.innerText = `${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
    return number < 10 ? '0' + number : number;
}
