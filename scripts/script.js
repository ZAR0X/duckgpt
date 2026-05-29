/* -----------------------------------------------
/* Author : Zarox  - https://github.com/ZAR0X
/* MIT license: http://opensource.org/licenses/MIT
/* Demo  : https://duckgpt-gui.netlify.app/
/* GitHub : https://github.com/ZAR0X/duck-gui
/* How to use? : Check the GitHub README
/* v0.5.5
/* ----------------------------------------------- */


import { marked } from "https://cdn.jsdelivr.net/npm/marked@5.1.0/lib/marked.esm.js";

marked.setOptions({
  mangle: false,
  headerIds: false,
});

// console.log(window.navigator.platform)

let apiUrl;
let styleUrl;
let lightUrl;

if (window.location.origin.includes("workers.dev")) {
  apiUrl = window.location.origin + "/chat/";
  styleUrl = "https://vauth.github.io/duck-gui/styles/styles.css"; // Changeable 
  lightUrl = "https://vauth.github.io/duck-gui/styles/light.css"; // Changeable
}
else {
  apiUrl = "https://duck.gpt-api.workers.dev/chat/"; // Add your own url, get one from here https://github.com/vauth/duckgpt
  styleUrl = "styles/styles.css";
  lightUrl = "styles/light.css";
}

const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
var query = false
const placeholder = document.getElementById("placeholder");
const sendButton = document.getElementById("send-button");
const dailog = document.getElementById('dailog');
const newChatButton = document.getElementById("new-chat-button");
const settingButton = document.getElementById("setting-button");
const particlesToggle = document.getElementById('particles-toggle');
const themeToggle = document.getElementById('theme-toggle');
const introCardsContainer = document.getElementById("intro-cards-container");
const particlejs = document.getElementById('particles-js');
const lightParticles = {"particles": {"color": {"value": "#87CEEB"},"line_linked": {"color": "#000000",},}}

document.addEventListener("DOMContentLoaded", () => {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  if (localStorage.getItem("setting") === null) {
    localStorage.setItem("setting", JSON.stringify({ "particle": true, "light": false }));
  };
  const settings = JSON.parse(localStorage.getItem("setting"))
  const particles = settings['particle'];
  const light = settings['light']
  
  
  if (navigator.userAgent.indexOf("Firefox") != -1) {
    const style = document.createElement('style');
    style.textContent = '* { scrollbar-width: thin; }';
    document.head.appendChild(style);
    chatBox.style.scrollbarColor = "rgba(255, 255, 255, 0.3) rgba(0, 0, 0, 0)";
    document.get
    if (light) {chatBox.style.scrollbarColor = "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0)";}
  }
  loadMessages();

  if (history.length == 0) {
    introCardsContainer.classList.remove("hidden");
  }

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });

  if (light) {
    themeToggle.checked = true;
    applyLightTheme()
    if (particles) {
      particlesToggle.checked = true;
      addParticles("#particles-js", lightParticles)
    }
  }
  else {
    if (particles) {
      particlesToggle.checked = true;
      addParticles("#particles-js")
  }}
  
  const link = document.createElement('link');
  link.href = styleUrl;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});

sendButton.addEventListener("click", () => { 
  if (!query) {
    sendMessage();
    chatInput.innerText = "";
    updatePlaceholder();
  } 
});

chatInput.addEventListener("keydown", (event) => {
  
  if (!('ontouchstart' in window) || navigator.maxTouchPoints < 1) {
    if (event.key === "Enter" && !event.ctrlKey) {
      event.preventDefault();
      if (!query) {
        sendMessage();
        chatInput.innerText = ""; 
        updatePlaceholder();
      }
    }
  }
  
  if (chatInput.innerText == "\n") {
    updatePlaceholder();
  }

  if (event.key === "Enter" && event.ctrlKey) {
    chatInput.innerText = chatInput.innerText + "\n"
    const range = document.createRange();
    const selection = window.getSelection();

    range.selectNodeContents(chatInput);
    range.collapse(false);

    selection.removeAllRanges();
    selection.addRange(range);
    updatePlaceholder();
  }

});

chatInput.addEventListener('input', updatePlaceholder);
chatInput.addEventListener('focus', updatePlaceholder);
chatInput.addEventListener('blur', updatePlaceholder);

newChatButton.addEventListener("click", () => {
  document.getElementById('popup-overlay').classList.remove('hidden');
  document.getElementById('clearchat-popup').classList.remove('hidden');
});

settingButton.addEventListener("click", () => {
  document.getElementById('popup-overlay').classList.remove('hidden');
  document.getElementById('setting-popup').classList.remove('hidden');
});

document.getElementById('close-popup').addEventListener('click', function () {
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
  document.getElementById('setting-popup').classList.add('hidden');
});

document.getElementById('no-button').addEventListener('click', function () {
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
});

document.getElementById('yes-button').addEventListener('click', function () {
  localStorage.removeItem("chatHistory");
  chatBox.innerHTML = "";
  updatePlaceholder();
  introCardsContainer.classList.remove("hidden");
  document.getElementById('popup-overlay').classList.add('hidden');
  document.getElementById('clearchat-popup').classList.add('hidden');
});


particlesToggle.addEventListener('change', function () {
  if (this.checked) {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['particle'] = true
    localStorage.setItem('setting', JSON.stringify(settings));
    if (settings['light']) {
      addParticles('#particle-js', lightParticles)
    }
    else {
      addParticles('#particle-js')

    }
  } else {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['particle'] = false
    localStorage.setItem('setting', JSON.stringify(settings));
    particlejs.innerHTML = ''
    pJSDom = []
  }
});

themeToggle.addEventListener('change', function () {
  if (this.checked) {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['light'] = true
    localStorage.setItem('setting', JSON.stringify(settings));
    applyLightTheme();
    if (settings['particle']) {
      addParticles('#particle-js', lightParticles)
    }
  } else {
    const settings = JSON.parse(localStorage.getItem('setting'))
    settings['light'] = false
    localStorage.setItem('setting', JSON.stringify(settings));
    applyDarkTheme();
    if (settings['particle']) {
      addParticles('#particle-js')
    }
  }
});


document.querySelectorAll('.headerIcon').forEach(icon => {
  icon.addEventListener('mousemove', (event) => {
    const dailogText = icon.getAttribute('alt');
    const cords = icon.getBoundingClientRect();
    const dSize = dailog.getBoundingClientRect();
    dailog.textContent = dailogText;

    dailog.style.opacity = '0.4';
    dailog.style.visibility = 'visible';
    if (icon.alt != "Settings") {dailog.style.left = cords.right + 'px';}
    else if (icon.alt == "Send") {icon.removeEventListener('mousemove')}
    else {dailog.style.left = cords.left-dSize.width + 'px';}
    dailog.style.top = cords.bottom + 'px';
  });

  icon.addEventListener('mouseleave', () => {
    dailog.style.opacity = '0';
    dailog.style.visibility = 'hidden';
    dailog.style.top = "0";
    dailog.style.left = "0";
  });
});


function addParticles(element, pColors){
  particlejs.innerHtml = ''
  pJSDom = []
  particlesJS(element, pColors)
}

function applyLightTheme() {
  const link = document.createElement('link');
  link.href = lightUrl; 
  link.rel = 'stylesheet';
  link.id = 'lightThemeCss';
  document.head.appendChild(link);
}

function applyDarkTheme() {
  const link = document.getElementById('lightThemeCss');
  if (link) {
    link.remove();
  }
}

function updatePlaceholder() {
  if (chatInput.innerText === '') {
    placeholder.style.opacity = '1';
  } else {
    placeholder.style.opacity = '0';
  }
}

async function renderMarkdown(content) {
  try {
    const htmlContent = marked(content.replace(/\\\(/g, '=$=').replace(/\\\[/g, '=#=').replace(/\\\)/g, '$=$').replace(/\\\]/g, '#=#'));
    return htmlContent.replace(/=\$=/g, '\\(').replace(/=#=/g, '\\[').replace(/\$=\$/g, '\\)').replace(/#=#/g, '\\]');
  } catch (error) {
    console.error("Error fetching markdown:", error);
    return content;
  }
}

function enhanceCodeBlocks(element) {
  element.querySelectorAll("pre code").forEach((block) => {
    const pre = block.parentNode;

    const language = block.className.split("-")[1] || "";

    const codeHeader = document.createElement("div");
    codeHeader.classList.add("code-header");
    const langSpan = document.createElement("span");
    langSpan.innerText = language;
    codeHeader.appendChild(langSpan);
    const copyButton = document.createElement("button");
    copyButton.innerText = "📋 Copy";
    codeHeader.appendChild(copyButton);
    block.innerHtml
    pre.insertBefore(codeHeader, pre.firstChild);
    copyButton.addEventListener("click", () => {
      copyToClipboard(block.innerText);
      copyButton.textContent = "📋 Copied!";
      setTimeout(() => {
        copyButton.textContent = "📋 Copy";
      }, 2000);
    });
    try {
      Prism.highlightElement(pre.querySelector("code"));
    } catch (error){
      console.log("Prism failed to load, Reloading page may fix the error. "+error)
    }
  });
  return element
}

function copyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

async function loadMessages() {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  for (const message of history) {
    await addMessageToChatBox(message.content, message.role, message.error);
  }
}

function hideIntroCards() {
  introCardsContainer.classList.add("hidden");
}

async function addMessageToChatBox(content, role, error=false) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card", role);
  if (role === "api") {
    if (error) {
    messageCard.classList.add("errorResponse")
    }
    const profilePic = document.createElement("div");
    profilePic.classList.add("profile-pic");
    messageContainer.appendChild(profilePic);
    const htmlContent = await renderMarkdown(content);
    messageCard.innerHTML = htmlContent;
  } else {
    messageContainer.classList.add("user");
    messageCard.innerText = content;
  }
  messageContainer.appendChild(messageCard);
  chatBox.insertBefore(enhanceCodeBlocks(messageContainer), chatBox.firstChild);
  try {
    await MathJax.typesetPromise(['.message-card'])
  } catch (error){
    console.log("MathJax failed to load, Reloading page may fix the error. "+error)
  }

  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });

}

function loadingResponse() {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");

  const profilePic = document.createElement("div");
  profilePic.classList.add("profile-pic");
  messageContainer.appendChild(profilePic);
  const messageCard = document.createElement("div");
  messageCard.classList.add("message-card", "api");
  // const loading = document.createElement("div");
  // loading.classList.add("loading");
  // messageCard.appendChild(loading)
  messageCard.innerText = ". . ." 
  messageContainer.appendChild(messageCard);

  chatBox.insertBefore(messageContainer, chatBox.firstChild);
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: 'smooth'
  });
  return messageContainer;
}

async function sendMessage() {
  query = true
  const prompt = chatInput.innerText.trim();
  if (!prompt) {
    query = false
    return
  };

  await addMessageToChatBox(prompt, "user");

  chatInput.value = "";
  hideIntroCards();

  const loading = loadingResponse();
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  // const model = "gpt-4o-mini";
  const userHistory = (history.filter((message) => (message.role === "user" && !message.error))).map(({ error, ...rest }) => rest);

  const params = new URLSearchParams({
    prompt: prompt,
    // model: model,
    history: JSON.stringify(userHistory),
  });
  const errorText = "Oops! Something went wrong while retrieving the response. Please try again."
  
  try {
    const response = await fetch(`${apiUrl}?${params.toString()}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    
    const data = await response.json();

    if (data.status === 200) {
      saveMessage(prompt, "user");
      const responseText = data.response;
      loading.remove();
      addMessageToChatBox(responseText, "api");
      saveMessage(responseText, "api");
    } else {
      saveMessage(prompt, "user", true);
      console.error("API error:", data);
      loading.remove();
      addMessageToChatBox(errorText, "api", true);
      saveMessage(errorText, "api", true);
    }
  } catch (errorTry) {
    saveMessage(prompt, "user", true);
    console.error("Fetch error:", errorTry);
      loading.remove();
      addMessageToChatBox(errorText, "api", true);
      saveMessage(errorText, "api", true);
  }
  query = false
}

function saveMessage(content, role, error=false) {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push({ role: role, content: content, error: error});
  localStorage.setItem("chatHistory", JSON.stringify(history));
}
