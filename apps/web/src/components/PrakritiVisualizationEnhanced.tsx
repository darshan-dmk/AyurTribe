import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

interface PrakritiScores {
  vata: number;
  pitta: number;
  kapha: number;
  dominant: string;
  percent: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  ml_prediction?: {
    predicted: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
}

interface Props {
  scores?: PrakritiScores;
}

// Demo Prakriti Scores (for demonstration when no scores provided)
const demoScores: PrakritiScores = {
  vata: 0.42,
  pitta: 0.36,
  kapha: 0.21,
  dominant: 'vata',
  percent: {
    vata: 42,
    pitta: 36,
    kapha: 21
  },
  ml_prediction: {
    predicted: 'vata',
    confidence: 0.87,
    probabilities: {
      vata: 0.87,
      pitta: 0.09,
      kapha: 0.04
    }
  }
};

const PrakritiVisualizationEnhanced: React.FC<Props> = ({ scores }) => {
  const [activeChart, setActiveChart] = useState('pie');
  const prakritiScores = scores || demoScores;

  const COLORS = {
    vata: '#A5B4FC', // Light Indigo for Vata
    pitta: '#FB923C', // Bright Orange for Pitta
    kapha: '#6EE7B7'  // Emerald for Kapha
  };

  // Data preparations
  const pieData = [
    { name: 'Vata', value: prakritiScores.percent.vata, color: COLORS.vata },
    { name: 'Pitta', value: prakritiScores.percent.pitta, color: COLORS.pitta },
    { name: 'Kapha', value: prakritiScores.percent.kapha, color: COLORS.kapha }
  ];

  const barData = [
    { name: 'Vata', percentage: prakritiScores.percent.vata, color: COLORS.vata },
    { name: 'Pitta', percentage: prakritiScores.percent.pitta, color: COLORS.pitta },
    { name: 'Kapha', percentage: prakritiScores.percent.kapha, color: COLORS.kapha }
  ];

  const radarData = [
    { dosha: 'Vata', value: prakritiScores.percent.vata, fullMark: 100 },
    { dosha: 'Pitta', value: prakritiScores.percent.pitta, fullMark: 100 },
    { dosha: 'Kapha', value: prakritiScores.percent.kapha, fullMark: 100 }
  ];

  const timelineData = [
    { month: 'Week 1', vata: 45, pitta: 35, kapha: 20 },
    { month: 'Week 2', vata: 43, pitta: 36, kapha: 21 },
    { month: 'Week 3', vata: 42, pitta: 37, kapha: 21 },
    { month: 'Week 4', vata: 42, pitta: 36, kapha: 22 }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1c211b] p-4 rounded-lg shadow-xl border border-[#3d453b]"
        >
          <p className="font-bold text-[#e1dccc]">{payload[0].name || payload[0].payload?.dosha}</p>
          <p className="text-[#8c9489]">
            Value: <span className="font-semibold text-[#e1dccc]">{payload[0].value}%</span>
          </p>
          {prakritiScores.ml_prediction && (
            <p className="text-sm text-[#93c5fd] mt-1">
              AI Confidence: {Math.round(prakritiScores.ml_prediction.confidence * 100)}%
            </p>
          )}
        </motion.div>
      );
    }
    return null;
  };

  const GlassCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-[#141613]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#2c332b] shadow-xl ${className}`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 10px 25px rgba(0,0,0,0.3)'
      }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(74, 85, 72, 0.1), transparent 70%)',
            top: '10%',
            left: '10%'
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(163, 177, 138, 0.05), transparent 70%)',
            bottom: '10%',
            right: '10%'
          }}
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="relative z-10 w-full">
        {/* ML Confidence Badge */}
        {prakritiScores.ml_prediction && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 p-4 rounded-xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.1))',
              borderColor: 'rgba(59,130,246,0.3)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#60a5fa' }}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-semibold" style={{ color: '#e1dccc' }}>AI-Powered Prakriti Analysis</span>
              </div>
              <span className="font-bold text-lg" style={{ color: '#6EE7B7' }}>
                {Math.round(prakritiScores.ml_prediction.confidence * 100)}% Confidence
              </span>
            </div>
            <div className="w-full bg-gray-300/20 rounded-full h-2 mt-3">
              <motion.div
                className="h-2 rounded-full"
                style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                initial={{ width: 0 }}
                animate={{ width: `${prakritiScores.ml_prediction.confidence * 100}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )}

        {/* Chart Selector Tabs */}
        <GlassCard className="mb-8">
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { id: 'pie', label: '📊 Pie Chart', icon: '🥧' },
              { id: 'bar', label: '📈 Bar Chart', icon: '📊' },
              { id: 'radar', label: '🎯 Radar Chart', icon: '🎯' },
              { id: 'timeline', label: '📉 Timeline', icon: '📉' },
              { id: 'detailed', label: '📋 Detailed View', icon: '📋' }
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveChart(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: activeChart === tab.id
                    ? 'linear-gradient(135deg, #1a4731, #2c5e41)'
                    : 'rgba(255,255,255,0.05)',
                  color: activeChart === tab.id ? '#e1dccc' : '#8c9489',
                  border: activeChart === tab.id ? '1px solid #4a805f' : '1px solid #2c332b'
                }}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>

          {/* Pie Chart */}
          {activeChart === 'pie' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-96"
            >
              <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#e1dccc' }}>
                Prakriti Distribution
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Bar Chart */}
          {activeChart === 'bar' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-96"
            >
              <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#e1dccc' }}>
                Dosha Strengths Comparison
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c332b" />
                  <XAxis dataKey="name" stroke="#8c9489" />
                  <YAxis domain={[0, 100]} stroke="#8c9489" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="percentage" name="Percentage" fill="#8884d8" radius={[10, 10, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Radar Chart */}
          {activeChart === 'radar' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-96"
            >
              <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#e1dccc' }}>
                Dosha Balance Analysis
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#2c332b" />
                  <PolarAngleAxis dataKey="dosha" stroke="#e1dccc" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#8c9489" />
                  <Radar name="Strength" dataKey="value" stroke={COLORS[prakritiScores.dominant as keyof typeof COLORS]} fill={COLORS[prakritiScores.dominant as keyof typeof COLORS]} fillOpacity={0.6} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#e1dccc' }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Timeline Chart */}
          {activeChart === 'timeline' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-96"
            >
              <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#e1dccc' }}>
                Constitution Progression Over Time
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2c332b" />
                  <XAxis dataKey="month" stroke="#8c9489" />
                  <YAxis domain={[0, 100]} stroke="#8c9489" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#8c9489' }} />
                  <Line type="monotone" dataKey="vata" stroke={COLORS.vata} strokeWidth={3} dot={{ fill: COLORS.vata, r: 6 }} />
                  <Line type="monotone" dataKey="pitta" stroke={COLORS.pitta} strokeWidth={3} dot={{ fill: COLORS.pitta, r: 6 }} />
                  <Line type="monotone" dataKey="kapha" stroke={COLORS.kapha} strokeWidth={3} dot={{ fill: COLORS.kapha, r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Detailed View */}
          {activeChart === 'detailed' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-center mb-6" style={{ color: '#e1dccc' }}>
                Comprehensive Analysis
              </h3>

              {/* Dominant Dosha */}
              <div className="p-6 rounded-xl border" style={{
                background: '#1a1c19',
                borderColor: '#2c332b'
              }}>
                <h4 className="text-sm font-medium mb-3" style={{ color: '#a3b18a' }}>YOUR DOMINANT CONSTITUTION</h4>
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                    style={{ background: COLORS[prakritiScores.dominant as keyof typeof COLORS] }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {prakritiScores.dominant[0].toUpperCase()}
                  </motion.div>
                  <div>
                    <p className="text-4xl font-bold capitalize" style={{ color: '#e1dccc' }}>
                      {prakritiScores.dominant} Prakriti
                    </p>
                    <p style={{ color: '#8c9489' }} className="mt-1">
                      {prakritiScores.dominant === 'vata' && 'Air & Space - Creative, Quick, Light'}
                      {prakritiScores.dominant === 'pitta' && 'Fire & Water - Focused, Intense, Warm'}
                      {prakritiScores.dominant === 'kapha' && 'Earth & Water - Steady, Calm, Strong'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dosha Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(prakritiScores.percent).map(([dosha, percentage]) => (
                  <motion.div
                    key={dosha}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl text-center border"
                    style={{
                      background: '#1a1c19',
                      borderColor: '#2c332b'
                    }}
                  >
                    <div className="text-3xl font-bold mb-1" style={{ color: COLORS[dosha as keyof typeof COLORS] }}>
                      {percentage}%
                    </div>
                    <div className="text-sm font-semibold capitalize" style={{ color: '#e1dccc' }}>
                      {dosha}
                    </div>
                    <div className="w-full bg-gray-300/30 rounded-full h-2 mt-3">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ background: COLORS[dosha as keyof typeof COLORS] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* ML Prediction Details */}
              {prakritiScores.ml_prediction && (
                <div className="p-6 rounded-xl border border-[#2c332b]" style={{
                  background: '#1a1c19'
                }}>
                  <h4 className="text-lg font-bold mb-4" style={{ color: '#e1dccc' }}>🤖 AI Analysis Details</h4>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#8c9489' }}>AI Prediction</p>
                      <p className="text-2xl font-bold capitalize" style={{ color: '#93c5fd' }}>
                        {prakritiScores.ml_prediction.predicted}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: '#8c9489' }}>Confidence Score</p>
                      <p className="text-2xl font-bold" style={{ color: '#6EE7B7' }}>
                        {Math.round(prakritiScores.ml_prediction.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium" style={{ color: '#8c9489' }}>Probability Distribution</p>
                    {Object.entries(prakritiScores.ml_prediction.probabilities).map(([dosha, prob]) => (
                      <div key={dosha} className="flex items-center gap-2">
                        <span className="w-16 capitalize font-medium text-[#e1dccc]">{dosha}</span>
                        <div className="flex-1 h-2 bg-[#2c332b] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: COLORS[dosha as keyof typeof COLORS] }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(prob as number) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-[#e1dccc]">{Math.round((prob as number) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </GlassCard>

        {/* Legend & Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2c332b] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#3d453b]">
                <span className="text-2xl">🌬️</span>
              </div>
              <h4 className="font-bold mb-2" style={{ color: '#e1dccc' }}>Vata (Air & Space)</h4>
              <p className="text-sm" style={{ color: '#8c9489' }}>
                Creative, Quick, Light, Adaptable, Energetic
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2c332b] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#3d453b]">
                <span className="text-2xl">🔥</span>
              </div>
              <h4 className="font-bold mb-2" style={{ color: '#e1dccc' }}>Pitta (Fire & Water)</h4>
              <p className="text-sm" style={{ color: '#8c9489' }}>
                Focused, Intense, Warm, Ambitious, Sharp
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#2c332b] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#3d453b]">
                <span className="text-2xl">🌍</span>
              </div>
              <h4 className="font-bold mb-2" style={{ color: '#e1dccc' }}>Kapha (Earth & Water)</h4>
              <p className="text-sm" style={{ color: '#8c9489' }}>
                Steady, Calm, Strong, Grounded, Patient
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Info Section */}
        <GlassCard className="mt-8">
          <h4 className="text-lg font-bold mb-3" style={{ color: '#e1dccc' }}>📚 About Your Results</h4>
          <p style={{ color: '#8c9489' }} className="leading-relaxed">
            Your Prakriti analysis combines traditional Ayurvedic principles with machine learning technology.
            The percentages represent the balance of each dosha in your constitution. Most individuals have a dominant
            dosha with secondary influences from the other two. Understanding your Prakriti helps guide lifestyle, diet,
            and wellness recommendations tailored specifically to you.
          </p>
        </GlassCard>
      </div>
    </div>
  );
};

export default PrakritiVisualizationEnhanced;