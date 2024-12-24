//get elements
const slider = document.getElementById('slider');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvas-container');
const currentValue = document.getElementById('current-value');

//constants
const width = 16;
const height = 16;
const aspectRatio = width/height;
const MinValue = 0; //represent all 0
const TOTAL_COLORS = 16

// Set canvas dimensions
canvas.width = width;
canvas.height = height;
canvas.style.aspectRatio = aspectRatio;

const resizeCanvas = () => {
  if(width < canvasContainer.clientWidth && height < canvasContainer.clientHeight){ 
    if(width > height)
      canvas.style.width = '100%';
    else
      canvas.style.height = '100%';
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//global variables
const image = decodeURIComponent(window.location.href.substring(window.location.href.indexOf('?image=') + 7));
let currentNoise = decode(image)
//let totalEncodedValues = (new Big(94)).pow(2048)
let maxNoise = (new Big(16).pow(width * height))

slider.value = currentNoise.div(maxNoise).times(1000).round(0, Big.roundDown).toString();

//events
let lastSlideValue = 0;
slider.oninput = (e) => {
  if(e.target.value - lastSlideValue == 1) {
    e.target.value = lastSlideValue;
    currentNoise = currentNoise.add(1);
  }
  else if(e.target.value - lastSlideValue === -1) {
    e.target.value = lastSlideValue;
    currentNoise = currentNoise.minus(1);
  }
  else {
    currentNoise = maxNoise.times(new Big(e.target.value / 1000)).round(0, Big.roundDown); //slider is between 0 and 1
  }

  lastSlideValue = e.target.value;
  
  drawNoise();
};

//start logic

function drawNoise() {
  const imageData = ctx.createImageData(width, height);
  let noiseCopy = currentNoise.times(1);
  for (let i = 0; i < imageData.data.length; i += 4) {
    let color = noiseCopy.mod(TOTAL_COLORS);
    [r,g,b] = getColorFromNum(color.toString());

    imageData.data[i] = r;     // Red
    imageData.data[i + 1] = g; // Green
    imageData.data[i + 2] = b; // Blue
    imageData.data[i + 3] = 255;   // Alpha

    noiseCopy = noiseCopy.div(TOTAL_COLORS).round(0, Big.roundDown) //update next 
  }

  ctx.putImageData(imageData, 0, 0);

  let encoded = encode(currentNoise);
  currentValue.innerText = encoded
  window.history.replaceState(null, '', window.location.pathname + `?image=${encodeURIComponent(encoded)}`);
}

const getColorFromNum = (num) => {
  switch(num) {
    case "0": return [0, 0, 0];       // Black
    case "1": return [128, 0, 0];     // Maroon
    case "2": return [0, 128, 0];     // Green
    case "3": return [128, 128, 0];   // Olive
    case "4": return [0, 0, 128];     // Navy
    case "5": return [128, 0, 128];   // Purple
    case "6": return [0, 128, 128];   // Teal
    case "7": return [192, 192, 192]; // Silver
    case "8": return [128, 128, 128]; // Gray
    case "9": return [255, 0, 0];     // Red
    case "10": return [0, 255, 0];    // Lime
    case "11": return [255, 255, 0];  // Yellow
    case "12": return [0, 0, 255];    // Blue
    case "13": return [255, 0, 255];  // Fuchsia
    case "14": return [0, 255, 255];  // Aqua
    case "15": return [255, 255, 255];// White
    default: return [0, 0, 0];      // Default to Black
  }
}

const encode = (num) => {
  //base94 encoding
  let noiseCopy = num.times(1);
  let encoding = "";
  while(noiseCopy.gt(0)) {
    let char = noiseCopy.mod(93);
    encoding = numToChar(parseInt(char.toString())) + encoding;
    noiseCopy = noiseCopy.div(93).round(0, Big.roundDown) //update next 
  }
  return encoding
}

function decode(str){
  let decodedValue = new Big(0);
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:",.<>?/`~\\\'';
  for (let i = 0; i < str.length; i++) {
    let charIndex = chars.indexOf(str[i]);
    decodedValue = decodedValue.times(93).add(charIndex);
  }
  return decodedValue;
};

const numToChar = (num) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:",.<>?/`~\\\''; //94 characters
  return chars[num];
};

// Initial draw
drawNoise();