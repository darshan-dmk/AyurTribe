// src/components/AppointmentBooking.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  consultationFee: number;
  availability: string[];
  image: string;
  nextAvailable: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface PaymentDetails {
  appointmentId: string;
  amount: number;
  doctorName: string;
  date: string;
  time: string;
}

interface Treatment {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: string;
}

interface AppointmentBookingProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock Razorpay declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}



const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      loadTreatments();
      loadRazorpayScript();
    }
  }, [isOpen]);

  const loadRazorpayScript = () => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  };

  const loadDoctors = () => {
    // Mock doctors data
    setDoctors([
      {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialty: 'Ayurvedic Physician & Prakriti Expert',
        experience: 12,
        rating: 4.8,
        consultationFee: 800,
        availability: ['monday', 'tuesday', 'wednesday', 'friday'],
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        nextAvailable: '2025-09-18'
      },
      {
        id: '2',
        name: 'Dr. Raj Kumar',
        specialty: 'Panchakarma Specialist',
        experience: 15,
        rating: 4.9,
        consultationFee: 1200,
        availability: ['tuesday', 'wednesday', 'thursday', 'saturday'],
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
        nextAvailable: '2025-09-19'
      },
      {
        id: '3',
        name: 'Dr. Meera Patel',
        specialty: 'Women\'s Health & Ayurveda',
        experience: 10,
        rating: 4.7,
        consultationFee: 900,
        availability: ['monday', 'wednesday', 'thursday', 'friday'],
        image: 'https://images.unsplash.com/photo-1594824792696-2d0a20e0bd88?w=150&h=150&fit=crop&crop=face',
        nextAvailable: '2025-09-20'
      }
    ]);
  };

  const loadTreatments = async () => {
    try {
      const { data, error } = await supabase
        .from('treatments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTreatments(data || []);
    } catch (err) {
      console.error('Error loading treatments:', err);
    }
  };

  const loadTimeSlots = (date: string) => {
    // Mock time slots
    const slots = [
      { time: '09:00 AM', available: true },
      { time: '09:30 AM', available: false },
      { time: '10:00 AM', available: true },
      { time: '10:30 AM', available: true },
      { time: '11:00 AM', available: false },
      { time: '11:30 AM', available: true },
      { time: '02:00 PM', available: true },
      { time: '02:30 PM', available: true },
      { time: '03:00 PM', available: false },
      { time: '03:30 PM', available: true },
      { time: '04:00 PM', available: true },
      { time: '04:30 PM', available: true }
    ];
    setTimeSlots(slots);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    loadTimeSlots(date);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleConsultationTypeSelect = (type: string) => {
    setConsultationType(type);
    setStep(5);
  };

  const selectedTreatment = treatments.find(t => t.id === consultationType);

  const initiatePayment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const amount = selectedTreatment ? selectedTreatment.price : selectedDoctor.consultationFee;

    const paymentData: PaymentDetails = {
      appointmentId: `APT${Date.now()}`,
      amount: amount,
      doctorName: selectedDoctor.name,
      date: selectedDate,
      time: selectedTime
    };

    setPaymentDetails(paymentData);
    processRazorpayPayment(paymentData);
  };

  const processRazorpayPayment = (paymentData: PaymentDetails) => {
    const options = {
      key: 'rzp_test_1234567890', // Replace with your Razorpay key
      amount: paymentData.amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Ayur Tribe',
      description: `Consultation with ${paymentData.doctorName}`,
      order_id: paymentData.appointmentId,
      handler: function (response: any) {
        handlePaymentSuccess(response, paymentData);
      },
      prefill: {
        name: 'John Doe', // Get from user data
        email: 'john.doe@example.com',
        contact: '+919876543210'
      },
      theme: {
        color: '#4F46E5'
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handlePaymentSuccess = (response: any, paymentData: PaymentDetails) => {
    setLoading(false);
    // Save appointment to backend
    console.log('Payment successful:', response);
    setStep(6); // Success step
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedDoctor(null);
    setSelectedDate('');
    setSelectedTime('');
    setConsultationType('');
    setPaymentDetails(null);
    onClose();
  };



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Book Appointment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center space-x-4 mb-8">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${step >= stepNumber
                  ? 'bg-[#1a4731] text-white shadow-md' // Accent Sage
                  : 'bg-gray-100 text-gray-400'
                  }`}>
                  {stepNumber}
                </div>
                {stepNumber < 5 && (
                  <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${step > stepNumber ? 'bg-[#1a4731]' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          {step === 1 && (
            <DoctorSelectionStep doctors={doctors} onSelect={handleDoctorSelect} />
          )}
          {step === 2 && (
            <DateSelectionStep
              doctor={selectedDoctor}
              onSelect={handleDateSelect}
            />
          )}
          {step === 3 && (
            <TimeSelectionStep timeSlots={timeSlots} onSelect={handleTimeSelect} />
          )}
          {step === 4 && (
            <ConsultationTypeStep treatments={treatments} onSelect={handleConsultationTypeSelect} />
          )}
          {step === 5 && (
            <PaymentStep
              doctor={selectedDoctor}
              date={selectedDate}
              time={selectedTime}
              consultationType={consultationType}
              selectedTreatment={selectedTreatment}
              onPay={initiatePayment}
              loading={loading}
            />
          )}
          {step === 6 && (
            <SuccessStep paymentDetails={paymentDetails} onNewBooking={resetBooking} />
          )}
        </div>
      </div>
    </div>
  );
};

// Step Components
const DoctorSelectionStep = ({ doctors, onSelect }: { doctors: Doctor[]; onSelect: (doctor: Doctor) => void }) => (
  <div>
    <h3 className="text-xl font-bold text-gray-800 mb-6">Choose Your Doctor</h3>
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {doctors.map((doctor) => (
        <div key={doctor.id}
          className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
          onClick={() => onSelect(doctor)}>
          <div className="flex items-center space-x-4">
            <img
              src={doctor.image}
              alt={doctor.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-800">{doctor.name}</h4>
              <p className="text-gray-600 text-sm">{doctor.specialty}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">{doctor.experience} years exp.</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-600 ml-1">{doctor.rating}</span>
                </div>
                <span className="text-sm text-green-600">Next: {doctor.nextAvailable}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-indigo-600">₹{doctor.consultationFee}</div>
              <div className="text-sm text-gray-500">Consultation</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const DateSelectionStep = ({ doctor, onSelect }: { doctor: Doctor | null; onSelect: (date: string) => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calendar generation helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        date: d.toISOString().split('T')[0],
        day: d.getDate(),
        isToday: new Date().toDateString() === d.toDateString(),
        isPast: d < new Date(new Date().setHours(0, 0, 0, 0))
      };
    });
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const nextMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  const prevMonth = () => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));

  return (
    <div>
      <h3 className="text-xl font-bold text-[#2c1810] mb-2">Select Date</h3>
      <p className="text-gray-600 mb-6 font-medium">Consultation with {doctor?.name}</p>

      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-sm">
        {/* Calendar Header */}
        <div className="flex justify-between items-center p-4 bg-[#f9fafb] border-b border-[#e5e7eb]">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded-full text-[#4b5563]">
            ←
          </button>
          <h4 className="font-bold text-[#1a4731]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded-full text-[#4b5563]">
            →
          </button>
        </div>

        <div className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {weekDays.map(day => (
              <div key={day} className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((dayInfo) => (
              <button
                key={dayInfo.date}
                onClick={() => !dayInfo.isPast && onSelect(dayInfo.date)}
                disabled={dayInfo.isPast}
                className={`
                  h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm transition-all
                  ${dayInfo.isToday ? 'border border-[#dda15e] font-bold' : ''}
                  ${dayInfo.isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-[#374151] hover:bg-[#1a4731] hover:text-white font-medium'}
                `}
              >
                {dayInfo.day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-4 mt-4 text-xs text-gray-500 justify-center">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full border border-[#dda15e] mr-1"></div> Today
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-[#1a4731] mr-1"></div> Selected
        </div>
      </div>
    </div>
  );
};

const TimeSelectionStep = ({ timeSlots, onSelect }: { timeSlots: TimeSlot[]; onSelect: (time: string) => void }) => {
  // Group slots for better UX
  const morningSlots = timeSlots.filter(s => s.time.includes('AM'));
  const afternoonSlots = timeSlots.filter(s => s.time.includes('PM'));

  return (
    <div>
      <h3 className="text-xl font-bold text-[#2c1810] mb-6">Select Time</h3>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Morning</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {morningSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && onSelect(slot.time)}
                disabled={!slot.available}
                className={`
                  py-2 px-1 rounded-lg text-sm font-medium transition-all text-center border
                  ${slot.available
                    ? 'border-[#e5e7eb] hover:border-[#dda15e] hover:bg-[#fffcf5] text-[#374151] hover:text-[#b07d34] shadow-sm'
                    : 'border-transparent bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Afternoon</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {afternoonSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && onSelect(slot.time)}
                disabled={!slot.available}
                className={`
                  py-2 px-1 rounded-lg text-sm font-medium transition-all text-center border
                  ${slot.available
                    ? 'border-[#e5e7eb] hover:border-[#dda15e] hover:bg-[#fffcf5] text-[#374151] hover:text-[#b07d34] shadow-sm'
                    : 'border-transparent bg-gray-100 text-gray-400 cursor-not-allowed'}
                `}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConsultationTypeStep = ({ treatments, onSelect }: { treatments: Treatment[]; onSelect: (typeId: string) => void }) => (
  <div>
    <h3 className="text-xl font-bold text-gray-800 mb-6">Select Treatment & Consultation</h3>

    <div className="space-y-4 max-h-96 overflow-y-auto">
      {treatments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No treatments available at the moment.</p>
      ) : (
        treatments.map((treatment) => (
          <button
            key={treatment.id}
            onClick={() => onSelect(treatment.id)} // Passing ID for now, logic might need name if used elsewhere
            className="w-full p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all text-left"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">{treatment.name}</h4>
                <p className="text-gray-600 text-sm mt-1">{treatment.description}</p>
                <span className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {treatment.duration_minutes} mins
                </span>
              </div>
              <div className="font-bold text-indigo-600">
                ₹{treatment.price}
              </div>
            </div>
          </button>
        ))
      )}
    </div>
  </div>
);

const PaymentStep = ({ doctor, date, time, consultationType, onPay, loading, ...props }: any) => (
  <div>
    <h3 className="text-xl font-bold text-gray-800 mb-6">Confirm & Pay</h3>

    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Appointment Summary</h4>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Doctor:</span>
          <span className="font-medium">{doctor?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium">{date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Time:</span>
          <span className="font-medium">{time}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium capitalize">{props.selectedTreatment?.name || consultationType}</span>
        </div>
        <hr />
        <div className="flex justify-between text-lg font-semibold">
          <span>Total Amount:</span>
          <span className="text-indigo-600">₹{props.selectedTreatment?.price || doctor?.consultationFee}</span>
        </div>
      </div>
    </div>

    <button
      onClick={onPay}
      disabled={loading}
      className={`w-full py-3 rounded-lg text-white font-medium transition-all ${loading
        ? 'bg-gray-400 cursor-not-allowed'
        : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
    >
      {loading ? 'Processing...' : 'Pay Now'}
    </button>

    <div className="mt-4 text-center text-sm text-gray-500">
      Secure payment powered by Razorpay
    </div>
  </div>
);

const SuccessStep = ({ paymentDetails, onNewBooking }: any) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">Appointment Booked Successfully!</h3>
    <p className="text-gray-600 mb-6">Your appointment has been confirmed and payment processed.</p>

    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h4>
      <div className="space-y-2 text-left">
        <div className="flex justify-between">
          <span className="text-gray-600">Appointment ID:</span>
          <span className="font-medium">{paymentDetails?.appointmentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Doctor:</span>
          <span className="font-medium">{paymentDetails?.doctorName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date & Time:</span>
          <span className="font-medium">{paymentDetails?.date} at {paymentDetails?.time}</span>
        </div>
      </div>
    </div>

    <div className="flex space-x-4">
      <button
        onClick={onNewBooking}
        className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
      >
        Book Another
      </button>
      <button className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Go to Dashboard
      </button>
    </div>
  </div>
);

export default AppointmentBooking;