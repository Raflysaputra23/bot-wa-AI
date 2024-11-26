const { readFile, writeFile } = require('node:fs/promises');


const Jawaban = async (jawaban, type) => {
    switch(type) {
        case 'add':
           await writeFile('./DataTebakGambar/data.json', JSON.stringify({jawaban}));
        break;
        case 'get':
            return JSON.parse(await readFile('./DataTebakGambar/data.json', {encoding: 'utf-8'}));
        // eslint-disable-next-line no-unreachable
        break;
        case 'delete':
            await writeFile('./DataTebakGambar/data.json', JSON.stringify({jawaban}));
        break;
    }
}
    

module.exports = Jawaban;