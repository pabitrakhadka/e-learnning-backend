import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Secret keys for access and refresh tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Utility function to Base64 URL encode a string
const base64url = (str) => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

// Utility function to Base64 URL decode a string
const base64urlDecode = (str) => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) {
        str += '=';
    }
    return Buffer.from(str, 'base64').toString('utf8');
};

// Generate Access Token
const generateAccessToken = (user) => {
    console.log("user data=", user);
    if (!user || !user.id || !user.email) {
        throw new Error("Invalid user object. ID and email are required.");
    }

    return jwt.sign(
        { id: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
    );
};

// Generate Refresh Token
const generateRefreshToken = (payload) => {
    const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
    const payloadStr = JSON.stringify(payload);

    const encodedHeader = base64url(header);
    const encodedPayload = base64url(payloadStr);

    // Create the signature using the secret key for refresh token
    const signature = crypto
        .createHmac('sha256', REFRESH_TOKEN_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    // Return the refresh token
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// Verify Refresh Token
const verifyRefreshToken = (token) => {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !signature) {
        return { status: false, message: 'Invalid token format' };
    }

    const expectedSignature = crypto
        .createHmac('sha256', REFRESH_TOKEN_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    if (expectedSignature === signature) {
        const decodedPayload = JSON.parse(base64urlDecode(encodedPayload));
        return { status: true, data: decodedPayload };
    } else {
        return { status: false, message: 'Invalid token' };
    }
};

// Verify Access Token
const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
        return { status: true, data: decoded };
    } catch (error) {
        return { status: false, message: error.message };
    }
};

// Export functions
export {
    generateAccessToken,
    verifyAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
};
