document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    const BOT_AVATAR = 'https://via.placeholder.com/40';
    const USER_AVATAR = 'https://via.placeholder.com/40';
    const API_KEY = "Hf_yCqWDlJSBRaRZpZEatpXZWyFfqBwIIBvwF"; // مفتاح Hugging Face
    const MODEL_ID = "aubmindlab/aragpt2-medium"; // نموذج عربي متخصص

    function addMessage(sender, text, avatar) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = sender === 'user' ? 'صورة المستخدم' : 'صورة الأب الروحي';
        avatarImg.classList.add('avatar');

        const textParagraph = document.createElement('p');
        textParagraph.textContent = text;

        if (sender === 'user') {
            messageElement.appendChild(textParagraph);
            messageElement.appendChild(avatarImg);
        } else {
            messageElement.appendChild(avatarImg);
            messageElement.appendChild(textParagraph);
        }

        messagesDiv.appendChild(messageElement);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userText = userInput.value.trim();

        if (userText) {
            addMessage('user', userText, USER_AVATAR);
            userInput.value = '';

            const botResponse = await getAIResponse(userText);
            addMessage('bot', botResponse, BOT_AVATAR);
        }
    });

    quickActionBtns.forEach(button => {
        button.addEventListener('click', async () => {
            const actionText = button.dataset.action;
            addMessage('user', actionText, USER_AVATAR);

            const botResponse = await getAIResponse(actionText);
            addMessage('bot', botResponse, BOT_AVATAR);
        });
    });

    async function getAIResponse(prompt) {
        try {
            const response = await fetch(
                `https://api-inference.huggingface.co/models/${MODEL_ID}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        inputs: prompt
                    })
                }
            );
            const data = await response.json();

            if (data && data[0] && data[0].generated_text) {
                let generatedText = data[0].generated_text.trim();
                if (generatedText.startsWith(prompt)) {
                    generatedText = generatedText.substring(prompt.length).trim();
                }
                return generatedText;
            } else {
                console.error("لم يتم العثور على نص في استجابة Hugging Face:", data);
                return "آسف يا بني، لم أتمكن من الحصول على إجابة. هل يمكن أن تجرب سؤالاً آخر؟";
            }
        } catch (error) {
            console.error("خطأ في استدعاء Hugging Face API:", error);
            return "آسف يا بني، حدث خطأ أثناء محاولة جلب الإجابة. هل يمكن أن تجرب سؤالًا آخر؟";
        }
    }
});
