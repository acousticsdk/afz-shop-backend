const ORDER_PREFIX = 'ORDER';
const ID_LENGTH = 8;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function generateOrderId() {
    const randomPart = Array.from(
        { length: ID_LENGTH }, 
        () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    ).join('');
    
    return `${ORDER_PREFIX}${randomPart}`;
}