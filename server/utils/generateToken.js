import jwt from 'jsonwebtoken';

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'campusconnect_jwt_secret_key_2026_academic_viva',
    { expiresIn: '30d' }
  );
};

export default generateToken;
