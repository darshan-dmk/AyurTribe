import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService';
import { supabaseService } from '../db/supabaseClient';

const getUserContext = async (userId: string) => {
    if (!userId) return null;

    try {
        // Fetch Prakriti
        const { data: prakriti } = await supabaseService
            .from('questionnaire_answers')
            .select('dominant, scores, ml_prediction')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Fetch Medical History
        const { data: history } = await supabaseService
            .from('medical_history')
            .select('*')
            .eq('user_id', userId)
            .single();

        // Fetch Latest Metrics
        const { data: metrics } = await supabaseService
            .from('health_metrics')
            .select('*')
            .eq('user_id', userId)
            .order('recorded_date', { ascending: false })
            .limit(3);

        return {
            prakriti: prakriti?.dominant || 'Unknown',
            medicalHistory: history || {},
            recentMetrics: metrics || []
        };
    } catch (error) {
        console.warn('Error fetching user context:', error);
        return null;
    }
};

export const aiChatResponse = async (req: Request, res: Response) => {
    try {
        const { message, history, userId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Missing message' });
        }

        const context = await getUserContext(userId);
        const response = await geminiService.chat(message, history || [], context);
        return res.json({ response });

    } catch (error: any) {
        console.error('AI Chat error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const aiImageAnalysis = async (req: Request, res: Response) => {
    try {
        const { prompt, userId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Missing image file' });
        }

        const context = await getUserContext(userId);
        const analysis = await geminiService.analyzeImage(
            file.buffer,
            file.mimetype,
            prompt || "Analyze this image in an Ayurvedic health context.",
            context
        );

        return res.json({ analysis });

    } catch (error: any) {
        console.error('Image analysis error:', error);
        return res.status(500).json({ error: error.message });
    }
};
