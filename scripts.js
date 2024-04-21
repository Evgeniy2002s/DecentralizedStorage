// имя контракта: test20_04_2024_1
const contractAddress = '0xD4Fc541236927E2EAf8F27606bD7309C1Fc2cbee'; // Адрес вашего смарт-контракта
const ABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "fileId",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "uploader",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "fileSize",
				"type": "uint256"
			}
		],
		"name": "FileUploaded",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "fileId",
				"type": "bytes32"
			}
		],
		"name": "getFile",
		"outputs": [
			{
				"internalType": "bytes",
				"name": "",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "fileId",
				"type": "bytes32"
			}
		],
		"name": "getFileSize",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLastFileID",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "lastFileID",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_newLimit",
				"type": "uint256"
			}
		],
		"name": "setUploadLimit",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "fileId",
				"type": "bytes32"
			},
			{
				"internalType": "bytes",
				"name": "fileData",
				"type": "bytes"
			}
		],
		"name": "uploadFile",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "uploadLimit",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
let web3;
let contract;

async function init() {
    // Проверяем поддержку Web3 и подключаем провайдер MetaMask
    if (typeof window.ethereum !== 'undefined') {
        web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }); // Запрашиваем разрешение на доступ к аккаунту MetaMask
        contract = new web3.eth.Contract(ABI, contractAddress);
        console.log('Contract initialized:', contract);
    } else {
        console.error('Web3 provider not detected');
    }
}


async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        document.getElementById('uploadStatus').innerText = 'Please select a file';
        return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
        const content = reader.result;
        const buffer = new Uint8Array(content); // Получаем ArrayBuffer из содержимого файла
        const fileData = Array.from(buffer).map(byte => byte.toString(16).padStart(2, '0')).join(''); // переводим ArrayBuffer в строку

        try {
            document.getElementById('uploadStatus').innerText = 'Uploading file...';

            // Вычисляем SHA-256 хеш содержимого файла
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const fileHash = Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            const fileId = '0x' + fileHash; // Создаем уникальный fileId из хеша

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const senderAddress = accounts[0];

            const transactionReceipt = await contract.methods.uploadFile(fileId, '0x' + fileData).send({ from: senderAddress });

            if (transactionReceipt.status) {
                document.getElementById('uploadStatus').innerText = 'File uploaded successfully!';
                document.getElementById('fileIdDisplay').innerText = 'File ID: ' + fileId; // Отобразить FileID на странице
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            document.getElementById('uploadStatus').innerText = 'Failed to upload file: ' + error.message;
        }
    };
    reader.readAsArrayBuffer(file);
}

async function getFileInfo() {
    const fileIdInput = document.getElementById('fileIdInput');
    const fileId = fileIdInput.value;

    try {
        const fileSize = await contract.methods.getFileSize(fileId).call();
        const fileInfo = `File ID: ${fileId}<br>File Size: ${fileSize} bytes`;

        document.getElementById('fileInfo').innerHTML = fileInfo;
    } catch (error) {
        console.error('Error getting file info:', error);
        document.getElementById('fileInfo').innerText = 'Error getting file info. Please check File ID and try again.';
    }
}

async function getLastFileID() {
    try {
        const lastFileId = await contract.methods.getLastFileID().call();
        document.getElementById('lastFileIdDisplay').innerText = 'Last File ID: ' + lastFileId;
    } catch (error) {
        console.error('Error getting last File ID:', error);
        alert('Error getting last File ID. Please try again.');
    }
}

// Инициализируем при загрузке страницы
window.onload = function () {
    init();
};
