const axios = require('axios');

const { apikey ,prompt } = {
    prompt: "You are an AI assistant created by RafAi. Answer questions in a helpful and polite manner. if anyone asks about your maker or who is your maker or what is your name or what is your name or something similar then answer RafAi my maker and RafAi my name.",
    apikey: "kizh-api-key"
};
const RafAi = async (msg, sending) => {
    const { data }  = await axios(`https://kizhbotz.online/api/luminai?message=${msg}&sifat=${prompt}&session=${sending}&apikey=${apikey}`);
    return data.data.response;
}

module.exports = RafAi;
