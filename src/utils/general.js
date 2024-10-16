import ls from "local-storage";


export function trimName(name, charCount) {
  if (name.length > charCount) return name.substring(0, charCount) + "...";
  else return name;
}

export function playSound(url) {
//   const audio = new Audio(url);
//   audio.play();
  var audioElement = document.createElement("audio");
  audioElement.src = url;
  audioElement.loop = false;
  audioElement.controls = false;
  audioElement.load();

  document.body.appendChild(audioElement);

  audioElement.play()
}


// Define the URL validation regex pattern
const urlPattern = /^(https?:\/\/)?((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost|(\d{1,3}\.){3}\d{1,3})(:\d+)?(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?$/;

// Function to validate the URL
export function isValidUrl(url) {
  return urlPattern.test(url);
};


export const checkAffiliateExpiry = () => {
  const data = ls('affiliate_username');
  if (data) {
    const { timestamp } = JSON.parse(data);
    const now = Date.now();
    // const durationToCompare = 30 * 60 * 1000; //30 mins in milliseconds
    const durationToCompare = 24 * 60 * 60 * 1000  //24 hours in milliseconds

    // Check if 30 minutes have passed
    if (now - timestamp > durationToCompare) {
      return true;
    }else return false;
  }
};