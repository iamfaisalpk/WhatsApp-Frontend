import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import OTPInput from './OTPInput';
import QRCode from './QRCode';
import { setCurrentStep } from '../../store/slices/authSlice';
import PhoneInputComponent from './PhoneInput';



const WhatsAppAuth = () => {
    const dispatch = useDispatch();
    const { currentStep } = useSelector((state) => state.auth);

const setStep = (step) => {
    dispatch(setCurrentStep(step));
};

    if (currentStep === 'phone') return <PhoneInputComponent setStep={setStep} />;
    if (currentStep === 'otp') return <OTPInput />;
    if (currentStep === 'qr') return <QRCode setStep={setStep} />;

return null;
};

export default WhatsAppAuth;