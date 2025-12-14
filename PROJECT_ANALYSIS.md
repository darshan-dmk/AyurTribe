# AyurTribe - Complete Project Analysis

**Date:** December 11, 2025  
**Analysis Type:** Comprehensive System Architecture & Feature Analysis

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Role-Based Access & Features](#role-based-access--features)
4. [Core Features Deep Dive](#core-features-deep-dive)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [ML Integration](#ml-integration)
8. [Technology Stack](#technology-stack)
9. [Data Flow Diagrams](#data-flow-diagrams)
10. [Security & Authentication](#security--authentication)

---

## 🎯 Project Overview

**AyurTribe** is a comprehensive Ayurvedic healthcare management platform that integrates traditional Ayurvedic practices with modern technology, including Machine Learning for Prakriti (body constitution) assessment and personalized nutrition recommendations.

### Key Objectives:
- **Personalized Healthcare**: AI-powered Prakriti assessment
- **Nutrition Management**: Intelligent diet recommendations based on Ayurvedic principles
- **Multi-role System**: Patient, Practitioner, Receptionist, and Admin roles
- **Real-time Communication**: Chat system for patient-practitioner interaction
- **Appointment Management**: Complete booking and scheduling system
- **Health Tracking**: Comprehensive health metrics monitoring

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React Frontend (Port 3000)                         │   │
│  │   - Patient Dashboard                                │   │
│  │   - Practitioner Dashboard                           │   │
│  │   - Receptionist Dashboard                           │   │
│  │   - Admin Dashboard                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                     API LAYER                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Express.js API Server (Port 4000)                  │   │
│  │   - REST API Endpoints                               │   │
│  │   - WebSocket Server (Socket.IO)                     │   │
│  │   - Authentication Middleware                        │   │
│  │   - Business Logic Controllers                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  ML SERVICE LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Python ML Service (Port 8000)                      │   │
│  │   - Prakriti Prediction Model                        │   │
│  │   - Nutrition Recommendation Engine                  │   │
│  │   - Feature Engineering                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Supabase (PostgreSQL)                              │   │
│  │   - User Management                                  │   │
│  │   - Health Data Storage                              │   │
│  │   - Appointment Records                              │   │
│  │   - Nutrition Database                               │   │
│  │   - Real-time Subscriptions                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
AyurTribe/
├── apps/
│   └── web/                    # React Frontend Application
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── pages/          # Role-specific pages
│       │   │   ├── admin/
│       │   │   ├── patient/
│       │   │   ├── practitioner/
│       │   │   ├── receptionist/
│       │   │   └── auth/
│       │   ├── context/        # React Context (Auth)
│       │   ├── services/       # API service layer
│       │   ├── utils/          # Utility functions
│       │   └── hooks/          # Custom React hooks
│       └── public/
│
├── packages/
│   ├── api/                    # Express.js Backend
│   │   └── src/
│   │       ├── controllers/    # Request handlers
│   │       ├── routes/         # API route definitions
│   │       ├── services/       # Business logic
│   │       ├── middlewares/    # Auth, validation
│   │       └── db/             # Database client
│   │
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utilities
│
├── models/                     # Python ML Service
│   ├── inference.py            # ML prediction logic
│   ├── train.py                # Model training
│   ├── ml_service.py           # ML API service
│   ├── run_server.py           # FastAPI server
│   ├── models_out/             # Trained models
│   └── *.csv                   # Training datasets
│
└── infra/
    └── supabase/               # Database schema & migrations
        ├── schema.sql
        ├── nutrition_schema_extensions.sql
        └── migrations/
```

---

## 👥 Role-Based Access & Features

### 1. **PATIENT ROLE** 👤

**Access Route:** `/patient/dashboard`

#### Features:
1. **Prakriti Assessment**
   - Complete 40+ question questionnaire
   - AI-powered body constitution analysis
   - Visual representation of Vata, Pitta, Kapha balance
   - ML prediction with confidence scores
   - Mental health scoring

2. **Personalized Nutrition Dashboard**
   - Dosha-specific food recommendations
   - Foods to favor/avoid based on Prakriti
   - Meal planning and logging
   - Nutritional feedback tracking
   - Diet effectiveness monitoring

3. **Appointment Management**
   - Book appointments with practitioners
   - View upcoming appointments
   - Appointment history
   - Status tracking (pending, confirmed, completed)

4. **Health Metrics Tracking**
   - Blood pressure monitoring
   - Weight tracking
   - BMI calculation
   - Mental health scores
   - Sleep quality tracking
   - Exercise logging

5. **Chat Communication**
   - Real-time chat with assigned practitioner
   - Message history
   - Unread message notifications
   - File/image sharing capability

6. **Profile Management**
   - Personal information
   - Medical history
   - Allergies and medications
   - Emergency contacts
   - Dietary preferences

#### Patient Dashboard Components:
```typescript
- PrakritiVisualizationEnhanced: Interactive dosha visualization
- NutritionDashboard: Personalized nutrition recommendations
- AppointmentBooking: Appointment scheduling interface
- ChatWidget: Real-time communication
- ProfileManager: User profile management
- HealthMetricsCard: Health data visualization
```

---

### 2. **PRACTITIONER ROLE** 👨‍⚕️

**Access Route:** `/practitioner/dashboard`

#### Features:
1. **Patient Management**
   - View all assigned patients
   - Access patient health records
   - Review Prakriti assessments
   - Track patient progress

2. **Nutrition Management**
   - Create personalized diet plans
   - Review patient meal logs
   - Provide dietary feedback
   - Adjust recommendations based on progress
   - Access nutrition database

3. **Appointment Management**
   - View today's schedule
   - Manage appointment status
   - Set availability
   - On-duty/Off-duty toggle

4. **Questionnaire Review**
   - Review pending Prakriti assessments
   - Validate ML predictions
   - Add practitioner notes
   - Approve/modify recommendations

5. **Patient Communication**
   - Active conversation threads
   - Unread message tracking
   - Real-time chat interface
   - Patient health alerts

6. **Prescription Management**
   - Create prescriptions
   - View prescription history
   - Treatment recommendations

#### Practitioner Dashboard Stats:
- Total Patients
- Today's Appointments
- Unread Messages
- Pending Reviews

---

### 3. **RECEPTIONIST ROLE** 📋

**Access Route:** `/receptionist/dashboard`

#### Features:
1. **Appointment Management**
   - **Pending Requests Tab:**
     - View new appointment requests
     - Approve/reject appointments
     - Assign practitioners
   
   - **Confirmed Appointments Tab:**
     - View confirmed bookings
     - Assign/reassign doctors
     - Mark as completed/no-show
     - Update appointment status
   
   - **History Tab:**
     - View past appointments
     - Filter by status (completed, cancelled, no-show)

2. **Appointment Booking**
   - Book appointments for walk-in patients
   - Select patient from database
   - Assign practitioner
   - Choose treatment type
   - Set date and time
   - Add appointment notes

3. **Doctor Availability**
   - Real-time practitioner status
   - On-duty/Off-duty indicators
   - Quick doctor selection for booking

4. **Patient Database Access**
   - Search patients
   - View patient information
   - Quick patient selection

5. **Treatment Types**
   - View available treatments
   - Treatment duration information
   - Treatment selection for bookings

#### Receptionist Dashboard Stats:
- Total Patients
- Doctors On Duty
- Pending Requests
- Confirmed Appointments

---

### 4. **ADMIN ROLE** 👔

**Access Route:** `/admin/dashboard`

#### Features:
1. **Staff Management**
   - Create staff accounts (Practitioner, Receptionist, Admin)
   - Email/password authentication
   - Role assignment
   - Auto-confirm staff emails
   - Staff profile management

2. **Dashboard Analytics**
   - Therapist utilization metrics
   - No-show rate tracking
   - Average session time
   - Today's booking count
   - Utilization by therapist

3. **Patient Management**
   - View all patients
   - Patient demographics
   - Health record access
   - Patient activity tracking

4. **Treatment Management**
   - Add/edit treatment types
   - Set treatment durations
   - Manage treatment pricing
   - Treatment availability

5. **Reports & Analytics**
   - Appointment statistics
   - Revenue reports
   - Practitioner performance
   - Patient satisfaction metrics

6. **System Configuration**
   - Center/location management
   - System settings
   - Data filtering by center

#### Admin Dashboard Components:
```typescript
- AdminLayout: Navigation and header
- StaffManagement: Staff CRUD operations
- Patients: Patient list and management
- Treatments: Treatment type management
- Reports: Analytics and reporting
- KPI Cards: Real-time metrics
```

---

## 🔬 Core Features Deep Dive

### 1. **Prakriti Questionnaire System**

#### Flow:
```
User Registration → Email/Password Auth → Prakriti Questionnaire → ML Analysis → Dashboard
```

#### Questionnaire Structure:
- **40+ Questions** covering:
  - Physical characteristics (body frame, skin type, hair)
  - Physiological traits (appetite, digestion, sleep)
  - Mental characteristics (stress response, memory, learning)
  - Lifestyle patterns (exercise, daily routine)

#### Answer Format:
```typescript
{
  trait: string,        // e.g., "sleep", "appetite", "skin"
  weight: number,       // 0.0 to 1.0 (slider value)
  questionId: string
}
```

#### ML Prediction Process:
1. **Frontend Collection**: User answers collected via slider interface
2. **API Submission**: POST `/api/questionnaire/submit`
3. **Traditional Calculation**: Backend calculates basic Prakriti scores
4. **ML Service Call**: Python service predicts using trained model
5. **Hybrid Result**: Combines traditional + ML prediction
6. **Database Storage**: Saves complete assessment
7. **Dashboard Display**: Shows visual representation

#### Prediction Response:
```json
{
  "prakriti": {
    "vata": 0.35,
    "pitta": 0.25,
    "kapha": 0.40,
    "dominant": "kapha",
    "percent": {
      "vata": 35,
      "pitta": 25,
      "kapha": 40
    },
    "ml_prediction": {
      "predicted": "kapha",
      "confidence": 0.87,
      "probabilities": {
        "vata": 0.15,
        "pitta": 0.18,
        "kapha": 0.67
      }
    }
  },
  "confidence": 0.87,
  "features_used": {
    "total_questions": 42,
    "calculation_method": "hybrid"
  }
}
```

---

### 2. **Nutrition Engine**

#### Architecture:
```
Prakriti Assessment → Nutrition Database → Recommendation Engine → Personalized Diet Plan
```

#### Database Schema:

**food_items** table:
```sql
- id (uuid)
- name_en (text)
- name_sanskrit (text)
- food_group (text)
- calories_per_100g (numeric)
- protein_g, carbs_g, fat_g, fiber_g (numeric)
- rasa (text[])           -- Taste: Madhura, Amla, Lavana, Katu, Tikta, Kashaya
- virya (text)            -- Potency: Ushna (Hot), Shita (Cold)
- vipaka (text)           -- Post-digestive effect
- guna (text[])           -- Qualities: Laghu, Guru, Snigdha, Ruksha
- dosha_effect (text[])   -- Effects on doshas
- seasonal_suitability (text[])
- therapeutic_uses (text[])
- contraindications (text[])
```

#### Recommendation Logic:

**For Vata Dominant:**
- Favor: Warm, moist, grounding foods
- Avoid: Cold, dry, light foods
- Tastes: Sweet, sour, salty
- Examples: Cooked grains, root vegetables, warm milk

**For Pitta Dominant:**
- Favor: Cool, refreshing foods
- Avoid: Hot, spicy, oily foods
- Tastes: Sweet, bitter, astringent
- Examples: Cucumber, coconut, leafy greens

**For Kapha Dominant:**
- Favor: Light, dry, warm foods
- Avoid: Heavy, oily, cold foods
- Tastes: Pungent, bitter, astringent
- Examples: Legumes, spices, light fruits

#### Nutrition Dashboard Features:
1. **Food Database Browser**
   - Filter by dosha effect
   - Search by name
   - View nutritional information
   - Ayurvedic properties

2. **Meal Logging**
   - Log daily meals
   - Track portions
   - Meal type (breakfast, lunch, dinner, snack)
   - Notes and observations

3. **Diet Recommendations**
   - AI-generated meal plans
   - Dosha-specific suggestions
   - Seasonal adjustments
   - Practitioner-customized plans

4. **Feedback System**
   - Rate food effectiveness (1-10)
   - Track symptoms improved/worsened
   - Provide notes
   - Continuous learning

---

### 3. **Appointment Booking System**

#### Workflow:

**Patient-Initiated Booking:**
```
1. Patient selects "Book Appointment"
2. Chooses date and time
3. Selects treatment type
4. Adds notes (optional)
5. Submits request (status: "pending")
6. Receptionist reviews and approves
7. Practitioner assigned
8. Status updated to "confirmed"
9. Patient receives confirmation
```

**Receptionist-Initiated Booking:**
```
1. Receptionist selects patient
2. Assigns practitioner
3. Chooses treatment and time
4. Adds notes
5. Creates appointment (status: "confirmed")
6. Patient notified
```

#### Appointment States:
- **pending**: Awaiting receptionist approval
- **scheduled**: Approved but not confirmed
- **confirmed**: Confirmed with assigned practitioner
- **completed**: Appointment finished
- **cancelled**: Cancelled by patient/staff
- **no-show**: Patient didn't attend

#### Database Schema:
```sql
CREATE TABLE appointments (
  id uuid PRIMARY KEY,
  patient_id uuid REFERENCES users(id),
  practitioner_id uuid REFERENCES users(id),
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  status varchar(20) DEFAULT 'scheduled',
  type varchar(50),
  notes text,
  created_at timestamp,
  updated_at timestamp
);
```

---

### 4. **Real-Time Chat System**

#### Technology:
- **Socket.IO** for WebSocket communication
- **Supabase Real-time** for message persistence

#### Architecture:
```
Client (Socket.IO Client) ↔ WebSocket Server (Port 4000) ↔ Supabase Database
```

#### Features:
1. **Thread Management**
   - One thread per patient-practitioner pair
   - Thread status (open/closed)
   - Last activity tracking

2. **Message Features**
   - Real-time delivery
   - Read receipts
   - Typing indicators
   - Message history
   - Unread count

3. **Database Schema**:
```sql
CREATE TABLE chat_threads (
  id uuid PRIMARY KEY,
  patient_id uuid REFERENCES users(id),
  practitioner_id uuid REFERENCES users(id),
  title text,
  status text DEFAULT 'open',
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY,
  thread_id uuid REFERENCES chat_threads(id),
  sender_id uuid REFERENCES users(id),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  metadata jsonb,
  created_at timestamp
);
```

#### WebSocket Events:
```javascript
// Client → Server
socket.emit('chat-message', { threadId, content, senderId });
socket.emit('typing', { threadId, userId });

// Server → Client
socket.on('chat-message', (message) => { /* handle */ });
socket.on('typing', (data) => { /* show indicator */ });
```

---

## 🗄️ Database Schema

### Core Tables:

#### 1. **users** (Main user table)
```sql
- id (uuid, PK)
- email (varchar, unique)
- phone (varchar, unique)
- password_hash (varchar)
- first_name, last_name (varchar)
- role (varchar: patient, practitioner, receptionist, admin)
- date_of_birth (date)
- gender (varchar)
- is_active (boolean)
- is_verified (boolean)
- is_on_duty (boolean) -- For practitioners/receptionists
- created_at, updated_at (timestamp)
```

#### 2. **questionnaire_answers**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users)
- questionnaire_type (varchar: prakriti, mental_health)
- answers (jsonb) -- Array of {trait, weight, questionId}
- scores (jsonb) -- Calculated Prakriti scores
- dominant (text) -- Dominant dosha
- mental_health_score (jsonb)
- ml_predictions (jsonb) -- ML model output
- confidence_score (numeric)
- final_prakriti_assessment (text)
- requires_practitioner_review (boolean)
- practitioner_validated (boolean)
- practitioner_id (uuid, FK)
- practitioner_notes (text)
- created_at, updated_at (timestamp)
```

#### 3. **appointments**
```sql
- id (uuid, PK)
- patient_id (uuid, FK → users)
- practitioner_id (uuid, FK → users)
- appointment_date (date)
- appointment_time (time)
- duration_minutes (integer)
- status (varchar)
- type (varchar)
- notes (text)
- created_at, updated_at (timestamp)
```

#### 4. **food_items** (Nutrition database)
```sql
- id (uuid, PK)
- name_en, name_sanskrit (text)
- food_group (text)
- calories_per_100g (numeric)
- protein_g, carbs_g, fat_g, fiber_g (numeric)
- rasa (text[]) -- Ayurvedic tastes
- virya (text) -- Hot/Cold potency
- vipaka (text) -- Post-digestive effect
- guna (text[]) -- Qualities
- dosha_effect (text[]) -- Vata/Pitta/Kapha effects
- seasonal_suitability (text[])
- therapeutic_uses (text[])
- contraindications (text[])
- created_at, updated_at (timestamp)
```

#### 5. **meal_logs**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- food_item_id (uuid, FK → food_items)
- quantity (numeric)
- unit (text)
- meal_type (text: breakfast, lunch, dinner, snack)
- logged_at (timestamp)
- notes (text)
- created_at (timestamp)
```

#### 6. **nutrition_feedback**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- diet_recommendation_id (uuid, FK)
- food_item_id (uuid, FK)
- effectiveness_score (integer 1-10)
- symptoms_improved (text[])
- symptoms_worsened (text[])
- notes (text)
- logged_at, created_at (timestamp)
```

#### 7. **diet_recommendations**
```sql
- id (uuid, PK)
- user_id (uuid, FK → users)
- prakriti_type (varchar)
- recommendations (jsonb)
- foods_to_favor (jsonb)
- foods_to_avoid (jsonb)
- meal_timing (jsonb)
- created_by (uuid, FK → users) -- Practitioner
- valid_from, valid_to (date)
- created_at, updated_at (timestamp)
```

#### 8. **dietitian_recommendations**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- practitioner_id (uuid, FK → profiles)
- general_diet_plan (jsonb)
- personalized_recommendations (jsonb)
- foods_to_favor, foods_to_avoid (jsonb)
- meal_timing (jsonb)
- notes (text)
- valid_from, valid_to (date)
- created_at, updated_at (timestamp)
```

#### 9. **health_metrics**
```sql
- id (uuid, PK)
- user_id (uuid, FK → profiles)
- blood_pressure_systolic, blood_pressure_diastolic (numeric)
- heart_rate, temperature, respiratory_rate (numeric)
- weight, bmi, body_fat_percent (numeric)
- mental_health_score, stress_level, anxiety_level (numeric)
- sleep_hours, sleep_quality (numeric/varchar)
- daily_steps, exercise_minutes (integer)
- digestion_score (numeric)
- appetite_level, bowel_movement_status (varchar)
- recorded_date, created_at, updated_at (timestamp)
```

#### 10. **treatments**
```sql
- id (uuid, PK)
- name (varchar)
- description (text)
- duration_minutes (integer)
- price (numeric)
- is_active (boolean)
- created_at, updated_at (timestamp)
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /api/auth/register          - Register new user (email/password)
POST   /api/auth/login             - Login with email/password
POST   /api/auth/logout            - Logout current user
GET    /api/auth/me                - Get current user info
POST   /api/auth/send-otp          - Send OTP (legacy)
POST   /api/auth/verify-otp        - Verify OTP (legacy)
```

### Questionnaire Routes (`/api/questionnaire`)
```
POST   /api/questionnaire/submit   - Submit questionnaire answers
GET    /api/questionnaire/latest   - Get latest questionnaire results
GET    /api/questionnaire/me       - Get current user's questionnaire
GET    /api/questionnaire/status   - Check completion status
GET    /api/questionnaire/:userId  - Get specific user's questionnaire
DELETE /api/questionnaire/:id      - Delete questionnaire
```

### Nutrition Routes (`/api/nutrition`)
```
GET    /api/nutrition/foods                      - Get all food items
GET    /api/nutrition/foods/:id                  - Get specific food item
GET    /api/nutrition/foods/dosha/:dosha         - Get foods by dosha effect
POST   /api/nutrition/diet/generate              - Generate diet plan (AI)
POST   /api/nutrition/diet/recommendations       - Save diet recommendation
GET    /api/nutrition/diet/recommendations       - Get user's diet recommendations
POST   /api/nutrition/meals/log                  - Log a meal
GET    /api/nutrition/meals/logs                 - Get user's meal logs
POST   /api/nutrition/feedback                   - Submit nutrition feedback
POST   /api/nutrition/dietitian/recommendations  - Practitioner creates plan
GET    /api/nutrition/dietitian/recommendations  - Get practitioner plans
```

### Chat Routes (`/api/chat`)
```
GET    /api/chat/threads           - Get user's chat threads
POST   /api/chat/threads           - Create new chat thread
POST   /api/chat/messages          - Send message
GET    /api/chat/messages/:threadId - Get thread messages
```

### Admin Routes (`/api/admin`)
```
POST   /api/admin/create-staff     - Create staff account (practitioner/receptionist/admin)
```

### Appointment Routes (`/api/appointments`)
```
POST   /api/appointments                      - Book appointment
GET    /api/appointments/user/:userEmail      - Get user's appointments
PUT    /api/appointments/:id/status           - Update appointment status
```

### WebSocket Events (`ws://localhost:4000/ws`)
```
// Client → Server
chat-message    - Send chat message
typing          - Typing indicator

// Server → Client
chat-message    - Receive chat message
typing          - Receive typing indicator
```

---

## 🤖 ML Integration

### ML Service Architecture

**Technology:** Python + FastAPI + scikit-learn + joblib

**Server:** `http://localhost:8000`

### Endpoints:

#### 1. **POST /predict** - Prakriti Prediction
```python
# Request
{
  "answers": [
    {"trait": "sleep", "weight": 0.7},
    {"trait": "appetite", "weight": 0.5},
    {"trait": "skin", "weight": 0.3},
    ...
  ]
}

# Response
{
  "prakriti": {
    "vata": 0.25,
    "pitta": 0.35,
    "kapha": 0.40,
    "dominant": "kapha",
    "percent": {
      "vata": 25,
      "pitta": 35,
      "kapha": 40
    },
    "ml_prediction": {
      "predicted": "kapha",
      "confidence": 0.87,
      "probabilities": {
        "vata": 0.15,
        "pitta": 0.18,
        "kapha": 0.67
      }
    }
  },
  "confidence": 0.87,
  "features_used": {
    "total_questions": 42,
    "calculation_method": "hybrid"
  }
}
```

### Model Details:

**Training Data:**
- `prakriti_training_dataset.csv` (171,791 bytes)
- `prakriti_training_dataset_synthetic.csv` (128,175 bytes)
- `nutrition_dataset.csv` (2,802,344 bytes)

**Model Files:**
- `models_out/prakriti_model.joblib` - Trained classifier
- `models_out/prakriti_meta.json` - Feature metadata

**Feature Engineering:**
```python
# Trait mappings with dosha correlations
trait_mapping = {
    'sleep': {
        'low': {'vata': 0.8, 'pitta': 0.1, 'kapha': 0.1},    # Light sleep
        'medium': {'vata': 0.2, 'pitta': 0.6, 'kapha': 0.2}, # Moderate
        'high': {'vata': 0.1, 'pitta': 0.2, 'kapha': 0.7}    # Deep sleep
    },
    'appetite': {
        'low': {'vata': 0.7, 'pitta': 0.2, 'kapha': 0.1},    # Variable
        'medium': {'vata': 0.2, 'pitta': 0.7, 'kapha': 0.1}, # Strong
        'high': {'vata': 0.1, 'pitta': 0.2, 'kapha': 0.7}    # Steady
    },
    # ... more traits
}
```

**Prediction Process:**
1. **Traditional Calculation**: Rule-based Prakriti scoring
2. **ML Prediction**: Trained model prediction with probabilities
3. **Hybrid Approach**: Combines both methods
4. **Confidence Scoring**: Based on prediction certainty
5. **Result Validation**: Ensures consistency

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **UI Components**: Custom components + Lucide icons
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Forms**: React Hook Form (implied)
- **HTTP Client**: Axios (via custom api utility)
- **Real-time**: Socket.IO Client
- **Notifications**: React Hot Toast
- **Charts**: Custom D3.js/Chart.js visualizations

### Backend (API)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Real-time**: Socket.IO
- **Authentication**: JWT + Supabase Auth
- **Database Client**: Supabase JS Client
- **Validation**: Express Validator (implied)
- **Security**: Helmet, CORS
- **Logging**: Morgan

### ML Service
- **Language**: Python 3.x
- **Framework**: FastAPI
- **ML Library**: scikit-learn
- **Model Persistence**: joblib
- **Data Processing**: pandas, numpy
- **Server**: Uvicorn

### Database
- **Primary**: Supabase (PostgreSQL)
- **Features**:
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication
  - Storage
  - Auto-generated REST API

### DevOps & Tools
- **Package Manager**: npm
- **Build Tool**: Create React App
- **Version Control**: Git
- **Environment**: dotenv
- **Process Management**: PM2 (implied)

---

## 🔄 Data Flow Diagrams

### 1. Prakriti Assessment Flow

```
┌─────────────┐
│   Patient   │
│  Registers  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Email/Password Login   │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Prakriti Questionnaire (40Q)   │
│  - Physical traits              │
│  - Physiological patterns       │
│  - Mental characteristics       │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  POST /api/questionnaire/submit │
│  {userId, answers[], type}      │
└──────────┬──────────────────────┘
           │
           ├─────────────────────────────┐
           │                             │
           ▼                             ▼
┌──────────────────────┐    ┌────────────────────────┐
│ Traditional Scoring  │    │  ML Service Call       │
│ (Backend Logic)      │    │  POST /predict         │
│                      │    │  {answers[]}           │
│ - Calculate vata     │    └──────────┬─────────────┘
│ - Calculate pitta    │               │
│ - Calculate kapha    │               ▼
│ - Determine dominant │    ┌────────────────────────┐
└──────────┬───────────┘    │  ML Model Prediction   │
           │                │  - Feature engineering │
           │                │  - Model inference     │
           │                │  - Probability calc    │
           │                └──────────┬─────────────┘
           │                           │
           ▼                           ▼
┌──────────────────────────────────────────────┐
│         Hybrid Result Combination            │
│  - Merge traditional + ML predictions        │
│  - Calculate confidence score                │
│  - Determine final dominant dosha            │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│      Save to questionnaire_answers table     │
│  - answers (jsonb)                           │
│  - scores (jsonb)                            │
│  - ml_predictions (jsonb)                    │
│  - dominant (text)                           │
│  - confidence_score (numeric)                │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│         Generate Diet Recommendations        │
│  - Query food_items by dosha_effect          │
│  - Create personalized meal plan             │
│  - Save to diet_recommendations              │
└──────────┬───────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────┐
│          Patient Dashboard Display           │
│  - Prakriti visualization (pie/radar chart) │
│  - ML confidence indicator                   │
│  - Nutrition recommendations                 │
│  - Health metrics                            │
└──────────────────────────────────────────────┘
```

### 2. Appointment Booking Flow

```
┌─────────────┐                    ┌──────────────┐
│   Patient   │                    │ Receptionist │
└──────┬──────┘                    └──────┬───────┘
       │                                  │
       │ 1. Click "Book Appointment"      │
       ▼                                  │
┌──────────────────┐                      │
│ Select Date/Time │                      │
│ Choose Treatment │                      │
│ Add Notes        │                      │
└──────┬───────────┘                      │
       │                                  │
       │ 2. POST /api/appointments        │
       │    {patientId, date, time,       │
       │     type, notes}                 │
       ▼                                  │
┌──────────────────────────┐              │
│  Create Appointment      │              │
│  status: "pending"       │              │
│  practitioner_id: null   │              │
└──────┬───────────────────┘              │
       │                                  │
       │ 3. Notification                  │
       │ ─────────────────────────────────▶
       │                                  │
       │                                  ▼
       │                        ┌─────────────────────┐
       │                        │ Review Request      │
       │                        │ - View patient info │
       │                        │ - Check availability│
       │                        └─────────┬───────────┘
       │                                  │
       │                                  │ 4. Approve
       │                                  ▼
       │                        ┌─────────────────────┐
       │                        │ Assign Practitioner │
       │                        │ Update status:      │
       │                        │ "confirmed"         │
       │                        └─────────┬───────────┘
       │                                  │
       │ 5. Confirmation                  │
       │ ◀─────────────────────────────────
       ▼
┌──────────────────────────┐
│ View Confirmed           │
│ Appointment in Dashboard │
└──────────────────────────┘
```

### 3. Nutrition Recommendation Flow

```
┌─────────────────────┐
│ Prakriti Assessment │
│ Completed           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  GET /api/nutrition/foods       │
│  ?dosha_effect=favor_[dominant] │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Query food_items table         │
│  WHERE dosha_effect @> ARRAY[   │
│    'balances_vata',             │
│    'reduces_vata'               │
│  ]                              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Filter by:                     │
│  - Seasonal suitability         │
│  - User allergies               │
│  - Dietary preferences          │
│  - Contraindications            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Generate Meal Plan             │
│  - Breakfast suggestions        │
│  - Lunch options                │
│  - Dinner recommendations       │
│  - Snack ideas                  │
│  - Portion sizes                │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Save to diet_recommendations   │
│  {                              │
│    user_id,                     │
│    prakriti_type,               │
│    foods_to_favor: [],          │
│    foods_to_avoid: [],          │
│    meal_timing: {},             │
│    recommendations: {}          │
│  }                              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Display in Nutrition Dashboard │
│  - Food recommendations         │
│  - Meal planning calendar       │
│  - Shopping list                │
│  - Recipe suggestions           │
└─────────────────────────────────┘
```

---

## 🔐 Security & Authentication

### Authentication Flow

**Email/Password Authentication:**
```
1. User Registration:
   - POST /api/auth/register
   - Email + Password + User details
   - Supabase creates auth user
   - Trigger creates public.users entry
   - Returns JWT token

2. User Login:
   - POST /api/auth/login
   - Email + Password
   - Supabase validates credentials
   - Returns JWT token + user data
   - Token stored in localStorage

3. Protected Routes:
   - authMiddleware extracts JWT from Authorization header
   - Validates token with Supabase
   - Attaches user to req.user
   - Checks role-based permissions
```

### Row Level Security (RLS)

**Users Table Policies:**
```sql
-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Allow public registration
CREATE POLICY "Allow registration"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Practitioners can view their patients
CREATE POLICY "Practitioners can view their patients"
  ON public.users FOR SELECT
  USING (
    role = 'patient' AND EXISTS (
      SELECT 1 FROM public.sessions
      WHERE practitioner_id = auth.uid() AND patient_id = id
    )
  );
```

### API Security Measures

1. **CORS Configuration:**
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

2. **Helmet Security Headers:**
```typescript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```

3. **Request Size Limits:**
```typescript
app.use(express.json({ limit: '1mb' }));
```

4. **Environment Variables:**
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- JWT_SECRET
- EMAIL_USER, EMAIL_PASS
- ML_SERVICE_URL

---

## 📊 Key Metrics & Analytics

### Admin Dashboard Metrics:
1. **Therapist Utilization**: Percentage of practitioner time booked
2. **No-show Rate**: Percentage of missed appointments
3. **Average Session Time**: Mean appointment duration
4. **Today's Bookings**: Current day appointment count
5. **Utilization by Therapist**: Individual practitioner workload

### Patient Health Tracking:
1. **Prakriti Balance**: Vata/Pitta/Kapha percentages over time
2. **Mental Health Score**: Trend analysis
3. **Weight & BMI**: Progress tracking
4. **Blood Pressure**: Cardiovascular health
5. **Sleep Quality**: Sleep pattern analysis
6. **Nutrition Adherence**: Diet plan compliance

---

## 🚀 Running Services

### Current Running Services:
```bash
# API Server (Port 4000)
cd packages/api
npm run dev

# ML Service (Port 8000)
cd models
python run_server.py

# Frontend (Port 3000)
cd apps/web
npm start
```

### Service Health Checks:
- **API**: `GET http://localhost:4000/health`
- **ML**: `GET http://localhost:8000/health`
- **Frontend**: `http://localhost:3000`

---

## 📝 Summary

**AyurTribe** is a comprehensive, production-ready Ayurvedic healthcare platform featuring:

✅ **4 Role-Based Dashboards** (Patient, Practitioner, Receptionist, Admin)  
✅ **AI-Powered Prakriti Assessment** (Hybrid ML + Traditional)  
✅ **Intelligent Nutrition Engine** (Dosha-specific recommendations)  
✅ **Complete Appointment System** (Booking, scheduling, management)  
✅ **Real-Time Chat** (WebSocket-based communication)  
✅ **Health Metrics Tracking** (Comprehensive wellness monitoring)  
✅ **Staff Management** (Admin-controlled user creation)  
✅ **Secure Authentication** (JWT + Row Level Security)  
✅ **Scalable Architecture** (Microservices-ready)  
✅ **Modern Tech Stack** (React, Express, Python, Supabase)

**Database Tables:** 15+ tables with proper relationships  
**API Endpoints:** 30+ RESTful endpoints  
**WebSocket Events:** Real-time chat and notifications  
**ML Models:** Trained Prakriti prediction model  
**Nutrition Database:** Ayurvedic food properties and recommendations

---

**Generated:** December 11, 2025  
**Project:** AyurTribe - Ayurvedic Healthcare Platform  
**Version:** 1.0.0
