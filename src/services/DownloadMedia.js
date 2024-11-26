const { downloadMediaMessage } = require('@whiskeysockets/baileys');

const DownloadMedia = async (media, sock) => {
    return downloadMediaMessage(media, 'buffer', { }, { logger: console, reuploadRequest: sock.updateMediaMessage });
}

module.exports = DownloadMedia;