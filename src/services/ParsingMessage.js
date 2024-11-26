const ParsingMessage = (msg, order) => {
    return msg.replace(`!${order}`, '').trim();
}
module.exports = ParsingMessage;