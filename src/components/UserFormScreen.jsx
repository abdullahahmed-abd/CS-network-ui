import { motion } from 'framer-motion';
import { useState } from 'react';
import { Building2, Phone, MapPin, User } from 'lucide-react';
import Backgroundimage from '../assets/image/Backgroundimg19.png';

const BUSINESS_AGE_OPTIONS = [
  { label: 'Less than 1 year', value: 'LESS_THAN_ONE_YEAR' },
  { label: '1 to 5 years', value: 'ONE_TO_FIVE_YEARS' },
  { label: 'More than 5 years', value: 'MORE_THAN_FIVE_YEARS' },
];

const POSITION_OPTIONS = [
  { label: 'Freelancer', value: 'FREELANCER' },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Employee', value: 'EMPLOYEE' },
];

const CONTACT_METHOD_OPTIONS = [
  { label: 'WhatsApp', value: 'WHATSAPP' },
  { label: 'Call', value: 'CALL' },
  { label: 'Email', value: 'EMAIL' },
];

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'Arabic', value: 'Arabic' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'Urdu', value: 'Urdu' },
];

const ROLE_OPTIONS = [
  { label: 'Buyer', value: 'BUYER', icon: '🛒' },
  { label: 'Seller', value: 'SELLER', icon: '🏪' },
  { label: 'Business Partner', value: 'BUSINESS_PARTNER', icon: '🤝' },
];

export default function UserFormScreen({ phone, countryCode, onComplete }) {
  const [form, setForm] = useState({
    memberRequestType: 'SUBMIT_PERSONAL_FORM',
    alternatePhoneNumber: '',
    preferredContactMethod: 'WHATSAPP',
    companyName: '',
    businessAge: 'MORE_THAN_FIVE_YEARS',
    position: 'FREELANCER',
    country: '',
    state: '',
    city: '',
    languagePreference: 'English',
    roles: ['BUYER'],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const toggleRole = (role) => {
    setForm((prev) => {
      const exists = prev.roles.includes(role);

      let roles;

      if (role === 'BUSINESS_PARTNER') {
        // If Business Partner is clicked
        if (exists) {
          // If already selected, deselect it
          roles = prev.roles.filter((r) => r !== role);
        } else {
          // If not selected, select only Business Partner (remove Buyer and Seller)
          roles = ['BUSINESS_PARTNER'];
        }
      } else {
        // If Buyer or Seller is clicked
        if (exists) {
          // If already selected, deselect it
          roles = prev.roles.filter((r) => r !== role);
        } else {
          // If not selected, add it and remove Business Partner
          roles = [...prev.roles.filter((r) => r !== 'BUSINESS_PARTNER'), role];
        }
      }

      return { ...prev, roles };
    });

    setErrors((prev) => ({ ...prev, roles: '' }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.alternatePhoneNumber.trim()) {
      newErrors.alternatePhoneNumber = 'Alternate phone number is required';
    }
    if (!form.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!form.country.trim()) newErrors.country = 'Country is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.roles.length) newErrors.roles = 'Select at least one role';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    const payload = {
      memberRequestType: form.memberRequestType,
      alternatePhoneNumber: form.alternatePhoneNumber,
      preferredContactMethod: form.preferredContactMethod,
      companyName: form.companyName,
      businessAge: form.businessAge,
      position: form.position,
      country: form.country,
      state: form.state,
      city: form.city,
      languagePreference: form.languagePreference,
      roles: form.roles,
    };

    try {
      console.log('Submitting member form payload:', payload);

      await new Promise((resolve) => setTimeout(resolve, 700));

      onComplete?.(payload);
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .custom-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .custom-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        /* Custom select dropdown styling */
        select option {
          background-color: white;
          color: #1f2937;
        }

        select option:checked {
          background: linear-gradient(to bottom, #dcfce7, #bbf7d0);
          color: #15803d;
        }

        select:focus option:checked {
          background: linear-gradient(to bottom, #dcfce7, #bbf7d0);
        }
      `}</style>

      {/* Background Image with Overlay */}
      <div className="fixed inset-0">
        <img
          src={Backgroundimage}
          alt="Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-emerald-50/25 to-green-100/30" />
      </div>

      {/* Animated Background Overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-green-200/20 to-emerald-300/15"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-emerald-200/20 to-green-300/15"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-gradient-to-br from-green-300/20 to-emerald-200/15"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="custom-scrollbar relative z-10 h-screen overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 pb-20">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-2.5 shadow-lg shadow-green-500/10 ring-1 ring-green-200/50"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-600"></span>
                </span>
                <span className="text-sm font-bold text-green-700">Final Step</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl"
              >
                Complete Your Profile
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-700"
              >
                Add your business details to finish registration
              </motion.p>
            </div>

            {/* Phone Verification Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-10 overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-xl shadow-green-500/10"
            >
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/40"
                >
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-gray-900">Phone Verified</p>
                    <span className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
                      ✓ Active
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">OTP confirmed via WhatsApp</p>
                </div>

                <div className="rounded-2xl border border-green-200 bg-green-100/60 px-5 py-3 shadow-md">
                  <p className="text-sm font-bold text-gray-900">
                    {countryCode} {phone}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Form Sections */}
            <div className="space-y-7">
              {/* Business Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-8 shadow-xl shadow-green-500/5"
              >
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-500/20">
                    <Building2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Business Information</h3>
                    <p className="text-sm text-gray-600">Tell us about your company</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <InputField
                      label="Company Name"
                      placeholder="Enter your company name"
                      value={form.companyName}
                      error={errors.companyName}
                      onChange={(e) => updateField('companyName', e.target.value)}
                    />
                  </div>

                  <SelectField
                    label="Position"
                    value={form.position}
                    onChange={(e) => updateField('position', e.target.value)}
                    options={POSITION_OPTIONS}
                  />

                  <SelectField
                    label="Business Age"
                    value={form.businessAge}
                    onChange={(e) => updateField('businessAge', e.target.value)}
                    options={BUSINESS_AGE_OPTIONS}
                  />
                </div>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-8 shadow-xl shadow-green-500/5"
              >
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-500/20">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Contact Preferences</h3>
                    <p className="text-sm text-gray-600">How should we reach you?</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <InputField
                      label="Alternate Phone"
                      type="tel"
                      placeholder="Enter alternate phone number"
                      value={form.alternatePhoneNumber}
                      error={errors.alternatePhoneNumber}
                      onChange={(e) =>
                        updateField('alternatePhoneNumber', e.target.value)
                      }
                    />
                  </div>

                  <SelectField
                    label="Contact Method"
                    value={form.preferredContactMethod}
                    onChange={(e) =>
                      updateField('preferredContactMethod', e.target.value)
                    }
                    options={CONTACT_METHOD_OPTIONS}
                  />

                  <SelectField
                    label="Language Preference"
                    value={form.languagePreference}
                    onChange={(e) =>
                      updateField('languagePreference', e.target.value)
                    }
                    options={LANGUAGE_OPTIONS}
                  />
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-8 shadow-xl shadow-green-500/5"
              >
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-500/20">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Location Details</h3>
                    <p className="text-sm text-gray-600">Where is your business based?</p>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <InputField
                      label="Country"
                      placeholder="Enter your country"
                      value={form.country}
                      error={errors.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    />
                  </div>

                  <InputField
                    label="State"
                    placeholder="Enter your state"
                    value={form.state}
                    error={errors.state}
                    onChange={(e) => updateField('state', e.target.value)}
                  />

                  <InputField
                    label="City"
                    placeholder="Enter your city"
                    value={form.city}
                    error={errors.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Roles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="overflow-hidden rounded-3xl border border-green-200 bg-gradient-to-br from-green-50/80 to-emerald-50/80 p-8 shadow-xl shadow-green-500/5"
              >
                <div className="mb-7 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 shadow-lg shadow-green-500/20">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Choose Your Role</h3>
                    <p className="text-sm text-gray-600">Select Buyer/Seller or Business Partner</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {ROLE_OPTIONS.map((role) => {
                    const active = form.roles.includes(role.value);

                    return (
                      <motion.button
                        key={role.value}
                        type="button"
                        onClick={() => toggleRole(role.value)}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all duration-300 ${
                          active
                            ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl shadow-green-500/20'
                            : 'border-green-200 bg-green-50/40 shadow-md hover:border-green-400 hover:bg-green-100/50 hover:shadow-lg'
                        }`}
                      >
                        {active && (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-xs font-bold text-white shadow-lg shadow-green-500/50"
                          >
                            ✓
                          </motion.div>
                        )}
                        <span className="text-4xl">{role.icon}</span>
                        <span className={`text-sm font-bold ${active ? 'text-green-700' : 'text-gray-700'}`}>
                          {role.label}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {errors.roles && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.roles}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mt-10"
            >
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 px-8 py-5 text-lg font-bold text-white shadow-2xl shadow-green-500/40 transition-all hover:shadow-green-500/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <motion.svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </motion.svg>
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-green-700 via-emerald-700 to-green-700"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </button>

              <p className="mt-5 text-center text-sm text-gray-700">
                <span className="mr-1">🔒</span>
                Your information is secure and encrypted
              </p>
            </motion.div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, error, ...props }) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-bold text-gray-700">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-xl border-2 bg-green-50/50 px-4 py-3.5 text-sm font-medium text-gray-800 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:bg-green-50 focus:shadow-lg ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
            : 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100'
        }`}
      />
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}

function SelectField({ label, options, error, ...props }) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-bold text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          className={`w-full appearance-none rounded-xl border-2 bg-green-50/50 px-4 py-3.5 pr-11 text-sm font-medium text-gray-800 shadow-sm outline-none transition-all focus:bg-green-50 focus:shadow-lg ${
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-green-200 focus:border-green-500 focus:ring-4 focus:ring-green-100'
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5">
          <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-600"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}