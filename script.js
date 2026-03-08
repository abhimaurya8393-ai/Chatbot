let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");


const Api_Url = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "sk-or-v1-84ae234b5d937c4a388e97470764163d65fcf24fbda92d0"; 

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let textElement = aiChatBox.querySelector(".ai-chat-area");

    
    let contents = [{ type: "text", text: user.message }];

    if (user.file.data) {
        contents.push({
            type: "image_url",
            image_url: {
                url: `data:${user.file.mime_type};base64,${user.file.data}`
            }
        });
    }

    let RequestOption = {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000", 
            "X-Title": "My Local AI Chat"
        },
        body: JSON.stringify({
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                {
        "role": "system", 
        "content": "Your name is Abhi's Assistant. You are a helpful AI." 
    },
                {
                    "role": "user",
                    "content": contents
                }
            ]
        })
    };

    

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();

        
        if (data.choices && data.choices[0]) {
            let apiResponse = data.choices[0].message.content.replace(/\*\*(.*?)\*\*/g, "$1").trim();
            textElement.innerHTML = apiResponse;
        } else {
            textElement.innerHTML = "Error: " + (data.error?.message || "Something went wrong.");
        }
    }
    catch (error) {
        console.log("Fetch Error:", error);
        textElement.innerHTML = "Network error occurred.";
    }
    finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`; 
        image.classList.remove("choose");
        user.file = { mime_type: null, data: null }; 
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;
    if (!user.message && !user.file.data) return; 

    let html = `
        <img src="user.png" alt="" id="userImage" width=7%">
        <div class="user-chat-area">
            ${user.message || ""}
            ${user.file.data ? `<br><img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" style="max-width:200px; border-radius:10px; margin-top:10px;" />` : ""}
        </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let aiHtml = `
            <img src="bot.png" alt="" id="aiImage" width="8%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="" class="load" width="50px">
            </div>`;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}


prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();

});
