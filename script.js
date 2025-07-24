// --- NEW: Anti-Copy/Paste Measures ---
// Disable right-click menu
document.addEventListener('contextmenu', event => event.preventDefault());
// Disable DevTools shortcuts
document.addEventListener('keydown', function (e) {
	if (e.key === 'F12' || 
		(e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
		(e.ctrlKey && e.key === 'U')) {
		e.preventDefault();
	}
});

const imageLoader = document.getElementById('imageLoader');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');
const uploadArea = document.getElementById('uploadArea');
const colorInfoPanel = document.getElementById('colorInfoPanel');
const colorPanelPlaceholder = document.getElementById('colorPanelPlaceholder');
const resetBtn = document.getElementById('resetBtn');

const hexPreview = document.getElementById('hexPreview');
const rgbPreview = document.getElementById('rgbPreview');
const hexCodeEl = document.getElementById('hexCode');
const rgbCodeEl = document.getElementById('rgbCode');
const hslCodeEl = document.getElementById('hslCode');
const cmykCodeEl = document.getElementById('cmykCode');

const showMoreBtn = document.getElementById('showMoreBtn');
const moreFormats = document.getElementById('moreFormats');

const magnifier = document.getElementById('magnifier');
const zoomLevel = 10;

// Event Listeners
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(e => uploadArea.addEventListener(e, preventDefaults, false));
document.body.addEventListener('dragover', preventDefaults, false);
document.body.addEventListener('drop', preventDefaults, false);
['dragenter', 'dragover'].forEach(e => uploadArea.addEventListener(e, () => uploadArea.classList.add('drag-over'), false));
['dragleave', 'drop'].forEach(e => uploadArea.addEventListener(e, () => uploadArea.classList.remove('drag-over'), false));
uploadArea.addEventListener('drop', handleDrop, false);
imageLoader.addEventListener('change', (e) => e.target.files.length && processFile(e.target.files[0]), false);
resetBtn.addEventListener('click', resetApp);
canvas.addEventListener('mousemove', updateLiveView);
canvas.addEventListener('click', selectColor);
canvas.addEventListener('mouseenter', () => magnifier.style.display = 'block');
canvas.addEventListener('mouseleave', () => magnifier.style.display = 'none');
showMoreBtn.addEventListener('click', toggleMoreFormats);
document.querySelector('.lg\\:col-span-2').addEventListener('click', handleCopyClick);

// Core Functions
function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

function handleDrop(e) {
	const files = e.dataTransfer.files;
	if (files.length) processFile(files[0]);
}

function processFile(file) {
	if (!file.type.startsWith('image/')) return;
	const reader = new FileReader();
	reader.onload = (event) => {
		const img = new Image();
		img.onload = () => {
			const container = document.getElementById('imageDisplayArea');
			const containerRatio = container.offsetWidth / container.offsetHeight;
			const imgRatio = img.width / img.height;

			canvas.width = (imgRatio > containerRatio) ? container.offsetWidth : container.offsetHeight * imgRatio;
			canvas.height = (imgRatio > containerRatio) ? container.offsetWidth / imgRatio : container.offsetHeight;
			
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			
			magnifier.style.backgroundImage = `url(${canvas.toDataURL()})`;
			magnifier.style.backgroundSize = `${canvas.width * zoomLevel}px ${canvas.height * zoomLevel}px`;
			
			uploadArea.classList.add('hidden');
			canvas.classList.remove('hidden');
			resetBtn.classList.remove('hidden');
			colorInfoPanel.classList.remove('hidden');
			colorPanelPlaceholder.classList.add('hidden');
		};
		img.src = event.target.result;
	};
	reader.readAsDataURL(file);
}

function resetApp() {
	canvas.classList.add('hidden');
	resetBtn.classList.add('hidden');
	uploadArea.classList.remove('hidden');

	colorInfoPanel.classList.add('hidden');
	colorPanelPlaceholder.classList.remove('hidden');

	moreFormats.classList.add('hidden');
	showMoreBtn.textContent = 'Tampilkan lebih banyak';

	imageLoader.value = null;
}

function selectColor(event) {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left);
	const y = Math.floor(event.clientY - rect.top);
	
	const pixel = ctx.getImageData(x, y, 1, 1).data;
	const [r, g, b] = [pixel[0], pixel[1], pixel[2]];

	const hex = rgbToHex(r, g, b);
	const rgb = `${r}, ${g}, ${b}`;
	const hsl = rgbToHsl(r, g, b);
	const cmyk = rgbToCmyk(r, g, b);

	hexPreview.style.backgroundColor = hex;
	rgbPreview.style.backgroundColor = hex;
	hexCodeEl.textContent = hex;
	rgbCodeEl.textContent = rgb;
	hslCodeEl.textContent = `${hsl.h}, ${hsl.s}%, ${hsl.l}%`;
	cmykCodeEl.textContent = `${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`;
}

function updateLiveView(event) {
	const rect = canvas.getBoundingClientRect();
	const x = Math.floor(event.clientX - rect.left);
	const y = Math.floor(event.clientY - rect.top);
	
	const bgPosX = (x * zoomLevel) - (magnifier.offsetWidth / 2);
	const bgPosY = (y * zoomLevel) - (magnifier.offsetHeight / 2);
	magnifier.style.backgroundPosition = `-${bgPosX}px -${bgPosY}px`;
	magnifier.style.left = `${event.pageX - magnifier.offsetWidth / 2}px`;
	magnifier.style.top = `${event.pageY - magnifier.offsetHeight / 2}px`;
}

// UI & Helper Functions
function toggleMoreFormats(e) {
	e.preventDefault();
	const isHidden = moreFormats.classList.toggle('hidden');
	e.target.textContent = isHidden ? 'Tampilkan lebih banyak' : 'Tampilkan lebih sedikit';
}

function handleCopyClick(e) {
	if (e.target.closest('.copy-btn')) {
		const button = e.target.closest('.copy-btn');
		const targetId = button.dataset.copyTarget;
		const textToCopy = document.getElementById(targetId).textContent;
		copyToClipboard(textToCopy, button);
	}
}

function copyToClipboard(text, button) {
	navigator.clipboard.writeText(text).then(() => {
		const originalIcon = button.innerHTML;
		button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="text-green-500" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022z"/></svg>`;
		setTimeout(() => { button.innerHTML = originalIcon; }, 2000);
	}).catch(err => console.error('Gagal menyalin:', err));
}

const componentToHex = (c) => ('0' + c.toString(16)).slice(-2);
const rgbToHex = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

function rgbToHsl(r, g, b) {
	r /= 255; g /= 255; b /= 255;
	const max = Math.max(r, g, b), min = Math.min(r, g, b);
	let h, s, l = (max + min) / 2;
	if (max === min) { h = s = 0; } 
	else {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r, g, b) {
	let c = 1 - (r / 255);
	let m = 1 - (g / 255);
	let y = 1 - (b / 255);
	const k = Math.min(c, m, y);
	if (k === 1) { c = m = y = 0; } 
	else {
		c = (c - k) / (1 - k);
		m = (m - k) / (1 - k);
		y = (y - k) / (1 - k);
	}
	return { c: Math.round(c * 100), m: Math.round(m * 100), y: Math.round(y * 100), k: Math.round(k * 100) };
}