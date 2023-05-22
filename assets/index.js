const form = document.querySelector('form'),
    fileInput = document.querySelector('.file-input'),
    progressArea = document.querySelector('.progress-area'),
    uploadedArea = document.querySelector('.uploaded-area');

form.addEventListener('click', () => {
    fileInput.click();
});

fileInput.onchange = ({ target }) => {
    let file = target.files[0];
    if (file) {
        let fileName = file.name;
        if (fileName.length >= 12) {
            let splitName = fileName.split('.');
            fileName = splitName[0].substring(0, 13) + '... .' + splitName[1];
        }
        uploadFile(fileName);
    }
}

function clipboardLink(link) {
    navigator.clipboard.writeText(link);
    alert('Ссылка скопирована в буфер обмена!');
}

function uploadFile(name) {
    let fileSize;

    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.unboundshare.ru:25009/upload');
    xhr.upload.addEventListener('progress', ({ loaded, total }) => {
        let fileLoaded = Math.floor((loaded / total) * 100);
        let fileSizeInBytes = total;
        let fileSizeInKB = fileSizeInBytes / 1024;
        let fileSizeInMB = fileSizeInKB / 1024;
        let fileSizeInGB = fileSizeInMB / 1024;

        if (fileSizeInKB < 1) {
            fileSize = fileSizeInBytes + ' bytes';
        } else if (fileSizeInMB < 1) {
            fileSize = fileSizeInKB.toFixed(2) + ' KB';
        } else if (fileSizeInGB < 1) {
            fileSize = fileSizeInMB.toFixed(2) + ' MB';
        } else {
            fileSize = fileSizeInGB.toFixed(2) + ' GB';
        }

        let progressHTML = `<li class='row'>
                          <i class='fas fa-file-alt'></i>
                          <div class='content'>
                            <div class='details'>
                              <span class='name'>${name} • Uploading</span>
                              <span class='percent'>${fileLoaded}%</span>
                            </div>
                            <div class='progress-bar'>
                              <div class='progress' style='width: ${fileLoaded}%'></div>
                            </div>
                          </div>
                        </li>`;
        uploadedArea.classList.add('onprogress');
        progressArea.innerHTML = progressHTML;
        xhr.onload = () => {
            if (loaded == total) {
                progressArea.innerHTML = '';

                const response = JSON.parse(xhr.responseText);
                const downloadLink = response.download_link;

                let uploadedHTML = `<li class='row'>
                            <div class='content upload'>
                              <i class='fas fa-file-alt'></i>
                              <div class='details'>
                                <span class='name'>${name} • Uploaded</span>
                                <span class='size'>${fileSize}</span>
                              </div>
                            </div>
                            <a href='${downloadLink}'><i class='fas fa-cloud-download-alt'></i></a>
                          </li>`;
                uploadedArea.classList.remove('onprogress');
                uploadedArea.insertAdjacentHTML('afterbegin', uploadedHTML);
            }
        }
    });

    let data = new FormData(form);
    xhr.send(data);
}