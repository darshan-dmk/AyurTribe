// packages/api/src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../db/supabaseClient';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone?: string | null;
        email?: string | null;
        role: string;
        [key: string]: any;
      };
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[authMiddleware] Processing request...');
    console.log('[authMiddleware] Headers:', req.headers);
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or malformed' });
    }

    const token = authHeader.substring(7);
    if (!token) {
      return res.status(401).json({ error: 'Bearer token required' });
    }

    // Verify with Supabase Auth (removes need for shared JWT_SECRET sync issues)
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Fallback: Try manual verification if Supabase check fails (e.g. for custom tokens)
      const secret = process.env.JWT_SECRET;
      if (secret) {
        try {
          const decoded: any = jwt.verify(token, secret);
          req.user = {
            id: decoded.id || decoded.sub,
            phone: decoded.phone,
            email: decoded.email,
            role: decoded.role || 'patient'
          };
          return next();
        } catch (jwtError) {
          console.error('❌ Manual JWT verification failed:', jwtError);
        }
      }
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Token is valid from Supabase
    // Token is valid from Supabase
    // Sync with public.users table to get the authoritative role
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('role, phone, email')
      .eq('id', user.id)
      .single();

    const role = dbUser?.role || (user.app_metadata?.role as string) || (user.user_metadata?.role as string) || 'patient';

    req.user = {
      id: user.id,
      phone: dbUser?.phone || user.phone || null,
      email: dbUser?.email || user.email || null,
      role: role
    };

    return next();
  } catch (err: any) {
    console.error('❌ Auth error:', err?.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role-based middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ error: 'User role missing. Please login again.' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${allowedRoles.join(', ')}` });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin']);
export const requirePractitioner = requireRole(['practitioner', 'admin']);

export default authMiddleware;
