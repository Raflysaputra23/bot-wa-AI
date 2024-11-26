/* eslint-disable no-async-promise-executor */
const axios = require('axios');            	
// eslint-disable-next-line no-unused-vars
const model = [
    "yanzgpt-revolution-25b-v3.0", // Default
    "yanzgpt-legacy-72b-v3.0" // Pro
];

const ChatAi = (query) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise( async (resolve, reject) => {
        const response = await axios("https://yanzgpt.my.id/chat", {
            headers: {
                authorization: "Bearer yzgpt-sc4tlKsMRdNMecNy",
                "content-type": "application/json"
            },
            data: {
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant created by RafAi. Answer questions in a helpful and polite manner. if anyone asks about your maker or who is your maker or what is your name or what is your name or something similar then answer RafAi my maker and RafAi my name."
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                model: "yanzgpt-legacy-72b-v3.0"
            },
            method: "POST"
        });
        resolve(response.data);
    });
};

module.exports = ChatAi;