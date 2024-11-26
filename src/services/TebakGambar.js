/* eslint-disable no-undef */
const axios = require('axios');


const TebakGambar = async () => {
    const { data }  = await axios(`https://api.yanzbotz.live/api/game/tebakgambar`);
    const buffer = await axios.get(data.result.img, { responseType: 'arraybuffer' });
    return { img: Buffer.from(buffer.data) , jawaban: data.result.jawaban.trim().toLowerCase() };
}

module.exports = TebakGambar;