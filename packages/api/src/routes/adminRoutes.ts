import express from 'express';
import { supabaseService } from '../db/supabaseClient';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Middleware to ensure the requester is an admin
// We reuse authMiddleware to populate req.user, then check the role
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = (req as any).user;
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
    }
    next();
};

// POST /api/admin/create-staff
router.post('/create-staff', authMiddleware, requireAdmin, async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['practitioner', 'receptionist', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        // 1. Create user in Supabase Auth using Service Key (admin context)
        // This does NOT log the current user out because we use a separate client instance (supabaseService)
        const { data: authData, error: authError } = await supabaseService.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm staff
            user_metadata: {
                first_name: firstName,
                last_name: lastName,
                role: role
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // 2. Create or Update entry in public.users table (Handle Trigger Conflict)
        // Since we likely have a trigger auto-creating the user, we should UPSERT
        const { error: profileError } = await supabaseService
            .from('users')
            .upsert({
                id: authData.user.id,
                email: email,
                first_name: firstName,
                last_name: lastName,
                role: role,
                is_active: true,
                is_verified: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('Failed to update public profile:', profileError);
            throw profileError;
        }

        return res.status(201).json({
            message: `Staff member (${role}) created successfully`,
            user: {
                id: authData.user.id,
                email,
                role
            }
        });

    } catch (error: any) {
        console.error('Error creating staff:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
});

export default router;
